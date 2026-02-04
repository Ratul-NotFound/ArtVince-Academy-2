"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { EnrollmentRequest } from "@/types";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    CreditCard,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Calendar,
    Filter,
    Download,
    CheckCircle2
} from "lucide-react";

export default function AdminRevenuePage() {
    const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        approvedEnrollments: 0,
        pendingRevenue: 0,
        thisMonthRevenue: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const q = query(collection(db, "enrollments"), orderBy("requestedAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnrollmentRequest));
                setEnrollments(data);

                // Calculate Stats
                let total = 0;
                let approved = 0;
                let pending = 0;
                let monthRev = 0;
                const now = new Date();

                data.forEach(e => {
                    const price = Number(e.coursePrice) || 0;
                    if (e.status === "approved") {
                        total += price;
                        approved++;
                        const reqDate = new Date(e.requestedAt.seconds * 1000);
                        if (reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear()) {
                            monthRev += price;
                        }
                    } else if (e.status === "pending") {
                        pending += price;
                    }
                });

                setStats({
                    totalRevenue: total,
                    approvedEnrollments: approved,
                    pendingRevenue: pending,
                    thisMonthRevenue: monthRev
                });

            } catch (error) {
                console.error("Error fetching financial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <RoleGuard allowedRoles={["admin"]}>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Fiscal <span className="text-primary italic">Intelligence</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Monitor academy revenue streams and enrollment analytics
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-foreground/5 text-foreground/40 px-6 py-3 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-all">
                        <Download size={14} /> Export XLS
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<TrendingUp size={20} />}
                                label="Total Revenue"
                                value={`$${stats.totalRevenue}`}
                                trend="+12.5%"
                                color="text-primary"
                                bg="bg-primary/5"
                            />
                            <StatCard
                                icon={<Users size={20} />}
                                label="Operatives"
                                value={stats.approvedEnrollments.toString()}
                                trend="+4.2%"
                                color="text-cyan-500"
                                bg="bg-cyan-500/5"
                            />
                            <StatCard
                                icon={<DollarSign size={20} />}
                                label="Pending Liquidity"
                                value={`$${stats.pendingRevenue}`}
                                trend="Awaiting Verification"
                                color="text-amber-500"
                                bg="bg-amber-500/5"
                            />
                            <StatCard
                                icon={<Calendar size={20} />}
                                label="Cycle Revenue"
                                value={`$${stats.thisMonthRevenue}`}
                                trend="Current Month"
                                color="text-emerald-500"
                                bg="bg-emerald-500/5"
                            />
                        </div>

                        {/* Recent Transactions */}
                        <div className="glass rounded-[40px] border border-border overflow-hidden">
                            <div className="p-8 border-b border-border bg-foreground/[0.02] flex justify-between items-center">
                                <h3 className="font-robot text-xl font-bold uppercase tracking-tighter flex items-center gap-3">
                                    <CreditCard size={20} className="text-primary" /> Transmission Log
                                </h3>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg bg-foreground/5 text-foreground/40">
                                        <Filter size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-foreground/5 font-robot text-[9px] uppercase tracking-widest text-foreground/30">
                                            <th className="px-8 py-4">Operative</th>
                                            <th className="px-8 py-4">Target Course</th>
                                            <th className="px-8 py-4">Method</th>
                                            <th className="px-8 py-4">Amount</th>
                                            <th className="px-8 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((e) => (
                                            <tr key={e.id} className="border-b border-border hover:bg-foreground/[0.01] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-robot text-xs font-bold uppercase text-foreground">{e.studentName}</span>
                                                        <span className="font-inter text-[10px] text-foreground/20">{e.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-robot text-[10px] uppercase font-bold text-foreground/60">{e.courseName}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-mono text-[10px] text-primary">{e.paymentMethod}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-robot font-bold text-xs text-foreground">${e.coursePrice}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-robot text-[8px] uppercase font-bold tracking-widest ${e.status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                                                        e.status === "rejected" ? "bg-red-500/10 text-red-500" :
                                                            "bg-primary/10 text-primary"
                                                        }`}>
                                                        {e.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}

function StatCard({ icon, label, value, trend, color, bg }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass p-8 rounded-[32px] border border-border group`}
        >
            <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 border border-border/50`}>
                {icon}
            </div>
            <p className="font-robot text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-bold mb-1">{label}</p>
            <h4 className="font-robot text-3xl font-bold uppercase text-foreground mb-4">{value}</h4>
            <div className="flex items-center gap-2">
                <span className={`font-robot text-[9px] uppercase font-bold tracking-widest ${color}`}>
                    {trend}
                </span>
            </div>
        </motion.div>
    );
}
