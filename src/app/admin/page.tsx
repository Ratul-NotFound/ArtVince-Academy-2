"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { Course, UserProfile, EnrollmentRequest } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Users,
    BookOpen,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    ChevronRight,
    Activity,
    Shield,
    AlertTriangle
} from "lucide-react";

interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    pendingEnrollments: number;
    approvedEnrollments: number;
    trainers: number;
    thisMonthRevenue: number;
    recentEnrollments: EnrollmentRequest[];
    recentUsers: UserProfile[];
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        pendingEnrollments: 0,
        approvedEnrollments: 0,
        trainers: 0,
        thisMonthRevenue: 0,
        recentEnrollments: [],
        recentUsers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch users
                const usersSnap = await getDocs(collection(db, "users"));
                const users = usersSnap.docs.map(d => d.data() as UserProfile);
                const trainers = users.filter(u => u.role === "trainer").length;

                // Fetch courses
                const coursesSnap = await getDocs(collection(db, "courses"));

                // Fetch enrollments
                const enrollSnap = await getDocs(query(collection(db, "enrollments"), orderBy("requestedAt", "desc")));
                const enrollments = enrollSnap.docs.map(d => ({ id: d.id, ...d.data() } as EnrollmentRequest));

                const pending = enrollments.filter(e => e.status === "pending");
                const approved = enrollments.filter(e => e.status === "approved");

                // Calculate revenue
                let totalRev = 0;
                let monthRev = 0;
                const now = new Date();
                approved.forEach(e => {
                    const price = Number(e.coursePrice) || 0;
                    totalRev += price;
                    const date = new Date(e.requestedAt?.seconds * 1000);
                    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                        monthRev += price;
                    }
                });

                // Get recent users (last 5 sorted by createdAt)
                const recentUsers = users
                    .filter(u => u.createdAt)
                    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                    .slice(0, 5);

                setStats({
                    totalUsers: users.length,
                    totalCourses: coursesSnap.size,
                    totalRevenue: totalRev,
                    pendingEnrollments: pending.length,
                    approvedEnrollments: approved.length,
                    trainers,
                    thisMonthRevenue: monthRev,
                    recentEnrollments: enrollments.slice(0, 5),
                    recentUsers
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <RoleGuard allowedRoles={["admin"]}>
                <DashboardLayout>
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                </DashboardLayout>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRoles={["admin"]}>
            <DashboardLayout>
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Command <span className="text-primary italic">Center</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Artvince Academy Administrative Overview
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-border">
                        <Activity size={14} className="text-emerald-500 animate-pulse" />
                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/50">System Online</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        icon={<DollarSign size={22} />}
                        label="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        subtext={`$${stats.thisMonthRevenue} this month`}
                        color="text-emerald-500"
                        bg="bg-emerald-500/10"
                        href="/admin/revenue"
                    />
                    <StatCard
                        icon={<Users size={22} />}
                        label="Total Users"
                        value={stats.totalUsers.toString()}
                        subtext={`${stats.trainers} trainers`}
                        color="text-cyan-500"
                        bg="bg-cyan-500/10"
                        href="/admin/users"
                    />
                    <StatCard
                        icon={<BookOpen size={22} />}
                        label="Active Courses"
                        value={stats.totalCourses.toString()}
                        subtext={`${stats.approvedEnrollments} enrollments`}
                        color="text-purple-500"
                        bg="bg-purple-500/10"
                        href="/admin/courses"
                    />
                    <StatCard
                        icon={<Clock size={22} />}
                        label="Pending Review"
                        value={stats.pendingEnrollments.toString()}
                        subtext="Awaiting verification"
                        color="text-amber-500"
                        bg="bg-amber-500/10"
                        href="/admin/enrollments"
                        urgent={stats.pendingEnrollments > 0}
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <QuickAction href="/admin/courses" icon={<BookOpen size={18} />} label="Manage Courses" />
                    <QuickAction href="/admin/users" icon={<Users size={18} />} label="User Control" />
                    <QuickAction href="/admin/enrollments" icon={<CheckCircle2 size={18} />} label="Verify Payments" />
                    <QuickAction href="/admin/revenue" icon={<TrendingUp size={18} />} label="Revenue Report" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Enrollments */}
                    <div className="glass rounded-[32px] border border-border overflow-hidden">
                        <div className="p-6 border-b border-border bg-foreground/[0.02] flex justify-between items-center">
                            <h3 className="font-robot text-sm uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
                                <Clock size={16} className="text-primary" /> Recent Enrollments
                            </h3>
                            <Link href="/admin/enrollments" className="font-robot text-[9px] uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                View All <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {stats.recentEnrollments.length === 0 ? (
                                <div className="p-8 text-center text-foreground/20 italic font-inter text-sm">
                                    No enrollments yet
                                </div>
                            ) : (
                                stats.recentEnrollments.map((e) => (
                                    <div key={e.id} className="p-4 hover:bg-foreground/[0.02] transition-colors flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                                                e.status === "rejected" ? "bg-red-500/10 text-red-500" :
                                                    "bg-amber-500/10 text-amber-500"
                                            }`}>
                                            {e.status === "approved" ? <CheckCircle2 size={18} /> :
                                                e.status === "rejected" ? <XCircle size={18} /> :
                                                    <Clock size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-robot text-xs uppercase font-bold text-foreground truncate">{e.studentName}</p>
                                            <p className="font-inter text-[10px] text-foreground/40 truncate">{e.courseName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-robot text-sm font-bold text-foreground">${e.coursePrice}</p>
                                            <p className="font-inter text-[9px] text-foreground/30">{e.paymentMethod}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="glass rounded-[32px] border border-border overflow-hidden">
                        <div className="p-6 border-b border-border bg-foreground/[0.02] flex justify-between items-center">
                            <h3 className="font-robot text-sm uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
                                <Users size={16} className="text-cyan-500" /> New Users
                            </h3>
                            <Link href="/admin/users" className="font-robot text-[9px] uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                                View All <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {stats.recentUsers.length === 0 ? (
                                <div className="p-8 text-center text-foreground/20 italic font-inter text-sm">
                                    No users yet
                                </div>
                            ) : (
                                stats.recentUsers.map((u) => (
                                    <div key={u.uid} className="p-4 hover:bg-foreground/[0.02] transition-colors flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                            {u.photoURL ? (
                                                <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="text-primary" size={16} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-robot text-xs uppercase font-bold text-foreground truncate">{u.displayName || "Unknown"}</p>
                                            <p className="font-inter text-[10px] text-foreground/40 truncate">{u.email}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full font-robot text-[8px] uppercase font-bold ${u.role === "admin" ? "bg-red-500/10 text-red-500" :
                                                u.role === "trainer" ? "bg-cyan-500/10 text-cyan-500" :
                                                    u.role === "moderator" ? "bg-purple-500/10 text-purple-500" :
                                                        "bg-foreground/10 text-foreground/40"
                                            }`}>
                                            <Shield size={8} className="inline mr-1" />
                                            {u.role}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Alert */}
                {stats.pendingEnrollments > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 glass rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-robot text-sm uppercase font-bold text-amber-500">Action Required</p>
                            <p className="font-inter text-xs text-foreground/50">
                                {stats.pendingEnrollments} enrollment{stats.pendingEnrollments > 1 ? 's' : ''} awaiting payment verification
                            </p>
                        </div>
                        <Link
                            href="/admin/enrollments"
                            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-amber-600 transition-all"
                        >
                            Review Now
                        </Link>
                    </motion.div>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}

function StatCard({ icon, label, value, subtext, color, bg, href, urgent }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    color: string;
    bg: string;
    href: string;
    urgent?: boolean;
}) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass p-6 rounded-[24px] border ${urgent ? 'border-amber-500/50 animate-pulse' : 'border-border'} group cursor-pointer transition-all hover:border-primary/50`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
                        {icon}
                    </div>
                    <ArrowUpRight size={16} className="text-foreground/10 group-hover:text-primary transition-colors" />
                </div>
                <p className="font-robot text-[9px] uppercase tracking-[0.15em] text-foreground/40 font-bold mb-1">{label}</p>
                <h4 className="font-robot text-3xl font-bold text-foreground mb-1">{value}</h4>
                <p className="font-inter text-[10px] text-foreground/30">{subtext}</p>
            </motion.div>
        </Link>
    );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 glass rounded-2xl border border-border hover:border-primary/50 transition-all group cursor-pointer flex items-center gap-3"
            >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    {icon}
                </div>
                <span className="font-robot text-[10px] uppercase tracking-widest font-bold text-foreground/60 group-hover:text-foreground transition-colors">{label}</span>
            </motion.div>
        </Link>
    );
}
