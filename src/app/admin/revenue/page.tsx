"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { EnrollmentRequest } from "@/types";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    CreditCard,
    DollarSign,
    Loader2,
    Calendar,
    ChevronDown,
    Download,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

export default function AdminRevenuePage() {
    const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const q = query(collection(db, "enrollments"), orderBy("requestedAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnrollmentRequest));
                setEnrollments(data);
            } catch (error) {
                console.error("Error fetching financial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const approved = enrollments.filter(e => e.status === "approved");

        let total = 0;
        let monthRev = 0;
        let lastMonthRev = 0;
        let weekRev = 0;

        // Payment method breakdown
        const methodBreakdown: Record<string, number> = {};
        // Course breakdown
        const courseBreakdown: Record<string, { name: string; revenue: number; count: number }> = {};

        approved.forEach(e => {
            const price = Number(e.coursePrice) || 0;
            const date = new Date(e.requestedAt?.seconds * 1000);

            total += price;

            // This month
            if (date >= monthStart) {
                monthRev += price;
            }

            // Last month
            if (date >= lastMonthStart && date <= lastMonthEnd) {
                lastMonthRev += price;
            }

            // This week
            if (date >= weekAgo) {
                weekRev += price;
            }

            // Method breakdown
            const method = e.paymentMethod || "Unknown";
            methodBreakdown[method] = (methodBreakdown[method] || 0) + price;

            // Course breakdown
            const courseId = e.courseId;
            if (!courseBreakdown[courseId]) {
                courseBreakdown[courseId] = { name: e.courseName || "Unknown", revenue: 0, count: 0 };
            }
            courseBreakdown[courseId].revenue += price;
            courseBreakdown[courseId].count += 1;
        });

        const monthGrowth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

        return {
            totalRevenue: total,
            thisMonthRevenue: monthRev,
            lastMonthRevenue: lastMonthRev,
            thisWeekRevenue: weekRev,
            monthGrowth,
            totalEnrollments: approved.length,
            avgOrderValue: approved.length > 0 ? total / approved.length : 0,
            methodBreakdown: Object.entries(methodBreakdown).map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount),
            courseBreakdown: Object.values(courseBreakdown).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        };
    }, [enrollments]);

    const filteredEnrollments = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        return enrollments.filter(e => {
            if (e.status !== "approved") return false;
            if (timeRange === "all") return true;
            const date = new Date(e.requestedAt?.seconds * 1000);
            if (timeRange === "month") return date >= monthStart;
            if (timeRange === "week") return date >= weekAgo;
            return true;
        });
    }, [enrollments, timeRange]);

    const exportCSV = () => {
        const headers = ["Student", "Email", "Course", "Amount", "Method", "Date"];
        const rows = filteredEnrollments.map(e => [
            e.studentName,
            e.email,
            e.courseName,
            e.coursePrice,
            e.paymentMethod,
            new Date(e.requestedAt?.seconds * 1000).toLocaleDateString()
        ]);
        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artvince-revenue-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    return (
        <RoleGuard allowedRoles={["admin"]}>
            <DashboardLayout>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Fiscal <span className="text-primary italic">Intelligence</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Revenue Analytics & Enrollment Metrics
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as any)}
                                className="appearance-none pl-4 pr-10 py-3 bg-foreground/5 border border-border rounded-xl font-robot text-xs uppercase tracking-widest outline-none focus:border-primary"
                            >
                                <option value="all">All Time</option>
                                <option value="month">This Month</option>
                                <option value="week">This Week</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                        </div>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 bg-foreground/5 text-foreground/60 px-5 py-3 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-white transition-all"
                        >
                            <Download size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<DollarSign size={22} />}
                                label="Total Revenue"
                                value={`$${stats.totalRevenue.toLocaleString()}`}
                                subtext="All time earnings"
                                color="text-emerald-500"
                                bg="bg-emerald-500/10"
                            />
                            <StatCard
                                icon={<Calendar size={22} />}
                                label="This Month"
                                value={`$${stats.thisMonthRevenue.toLocaleString()}`}
                                subtext={stats.monthGrowth >= 0 ? `+${stats.monthGrowth.toFixed(1)}%` : `${stats.monthGrowth.toFixed(1)}%`}
                                color="text-primary"
                                bg="bg-primary/10"
                                trend={stats.monthGrowth >= 0 ? "up" : "down"}
                            />
                            <StatCard
                                icon={<Users size={22} />}
                                label="Paid Students"
                                value={stats.totalEnrollments.toString()}
                                subtext="Approved enrollments"
                                color="text-cyan-500"
                                bg="bg-cyan-500/10"
                            />
                            <StatCard
                                icon={<BarChart3 size={22} />}
                                label="Avg. Order"
                                value={`$${stats.avgOrderValue.toFixed(0)}`}
                                subtext="Per enrollment"
                                color="text-purple-500"
                                bg="bg-purple-500/10"
                            />
                        </div>

                        {/* Breakdown Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Payment Method Breakdown */}
                            <div className="glass rounded-[32px] border border-border p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <PieChart size={18} />
                                    </div>
                                    <h3 className="font-robot text-sm uppercase tracking-widest font-bold">Payment Methods</h3>
                                </div>
                                {stats.methodBreakdown.length === 0 ? (
                                    <p className="text-foreground/30 text-sm italic text-center py-8">No data</p>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.methodBreakdown.map((item, i) => (
                                            <div key={item.method} className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-pink-500' : i === 1 ? 'bg-orange-500' : 'bg-cyan-500'}`} />
                                                <span className="font-robot text-sm uppercase flex-1">{item.method}</span>
                                                <span className="font-robot text-sm font-bold">${item.amount.toLocaleString()}</span>
                                                <span className="font-inter text-xs text-foreground/30">
                                                    {((item.amount / stats.totalRevenue) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Top Courses */}
                            <div className="glass rounded-[32px] border border-border p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                        <TrendingUp size={18} />
                                    </div>
                                    <h3 className="font-robot text-sm uppercase tracking-widest font-bold">Top Earning Courses</h3>
                                </div>
                                {stats.courseBreakdown.length === 0 ? (
                                    <p className="text-foreground/30 text-sm italic text-center py-8">No data</p>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.courseBreakdown.map((course, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <span className="font-robot text-xs text-foreground/30 w-5">{i + 1}.</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-robot text-xs uppercase font-bold truncate">{course.name}</p>
                                                    <p className="font-inter text-[10px] text-foreground/30">{course.count} students</p>
                                                </div>
                                                <span className="font-robot text-sm font-bold text-primary">${course.revenue.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="glass rounded-[32px] border border-border overflow-hidden">
                            <div className="p-6 border-b border-border bg-foreground/[0.02] flex justify-between items-center">
                                <h3 className="font-robot text-sm uppercase tracking-widest font-bold flex items-center gap-3">
                                    <CreditCard size={18} className="text-primary" /> Transaction Log
                                </h3>
                                <span className="font-inter text-xs text-foreground/30">{filteredEnrollments.length} records</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-foreground/5 font-robot text-[9px] uppercase tracking-widest text-foreground/30">
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Course</th>
                                            <th className="px-6 py-4">Method</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEnrollments.slice(0, 20).map((e) => (
                                            <tr key={e.id} className="border-b border-border hover:bg-foreground/[0.01] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-robot text-xs font-bold uppercase text-foreground">{e.studentName}</span>
                                                        <span className="font-inter text-[10px] text-foreground/20">{e.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-robot text-[10px] uppercase font-bold text-foreground/60">{e.courseName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[9px] uppercase font-bold ${e.paymentMethod?.toLowerCase().includes('bkash') ? 'bg-pink-500/10 text-pink-500' :
                                                            e.paymentMethod?.toLowerCase().includes('nagad') ? 'bg-orange-500/10 text-orange-500' :
                                                                'bg-cyan-500/10 text-cyan-500'
                                                        }`}>
                                                        {e.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-robot font-bold text-sm text-foreground">${e.coursePrice}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-inter text-xs text-foreground/30">
                                                        {new Date(e.requestedAt?.seconds * 1000).toLocaleDateString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredEnrollments.length === 0 && (
                                <div className="py-16 text-center text-foreground/20 italic font-inter text-sm">
                                    No transactions for selected period
                                </div>
                            )}

                            {filteredEnrollments.length > 20 && (
                                <div className="p-4 text-center border-t border-border">
                                    <p className="font-inter text-xs text-foreground/30">
                                        Showing 20 of {filteredEnrollments.length} • Export CSV for full data
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}

function StatCard({ icon, label, value, subtext, color, bg, trend }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    color: string;
    bg: string;
    trend?: "up" | "down";
}) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-[28px] border border-border group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                        {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                )}
            </div>
            <p className="font-robot text-[9px] uppercase tracking-[0.15em] text-foreground/40 font-bold mb-1">{label}</p>
            <h4 className="font-robot text-3xl font-bold text-foreground mb-1">{value}</h4>
            <p className={`font-inter text-[10px] ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-foreground/30"}`}>
                {subtext}
            </p>
        </motion.div>
    );
}
