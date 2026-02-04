"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy,
    arrayUnion,
    increment,
    addDoc
} from "firebase/firestore";
import { EnrollmentRequest } from "@/types";
import { Loader2, CheckCircle, XCircle, Clock, Receipt, Phone, Mail, Search, X, ChevronDown, DollarSign, Users, Filter, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const q = query(collection(db, "enrollments"), orderBy("requestedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnrollmentRequest));
            setEnrollments(data);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (enrollment: EnrollmentRequest) => {
        setProcessing(enrollment.id);
        try {
            await updateDoc(doc(db, "enrollments", enrollment.id), {
                status: "approved",
                processedAt: new Date(),
            });

            await updateDoc(doc(db, "users", enrollment.uid), {
                enrolledCourses: arrayUnion(enrollment.courseId)
            });

            await updateDoc(doc(db, "courses", enrollment.courseId), {
                enrolledCount: increment(1)
            });

            await addDoc(collection(db, "notifications"), {
                uid: enrollment.uid,
                type: "enrollment_approved",
                title: "Enrollment Approved!",
                message: `Your enrollment for "${enrollment.courseName}" has been approved. You can now access the course content.`,
                link: `/dashboard/courses/${enrollment.courseId}`,
                read: false,
                createdAt: new Date()
            });

            setEnrollments(prev => prev.map(e => e.id === enrollment.id ? { ...e, status: "approved" } : e));
        } catch (error) {
            console.error("Error approving enrollment:", error);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (enrollment: EnrollmentRequest) => {
        if (!confirm("Are you sure you want to reject this enrollment?")) return;
        setProcessing(enrollment.id);
        try {
            await updateDoc(doc(db, "enrollments", enrollment.id), {
                status: "rejected",
                processedAt: new Date(),
            });

            await addDoc(collection(db, "notifications"), {
                uid: enrollment.uid,
                type: "enrollment_rejected",
                title: "Enrollment Update",
                message: `Your enrollment request for "${enrollment.courseName}" was not approved. Please contact support for more information.`,
                read: false,
                createdAt: new Date()
            });

            setEnrollments(prev => prev.map(e => e.id === enrollment.id ? { ...e, status: "rejected" } : e));
        } catch (error) {
            console.error("Error rejecting enrollment:", error);
        } finally {
            setProcessing(null);
        }
    };

    const handleBulkApprove = async () => {
        const pendingSelected = enrollments.filter(e => selectedIds.includes(e.id) && e.status === "pending");
        if (pendingSelected.length === 0) return;

        for (const enrollment of pendingSelected) {
            await handleApprove(enrollment);
        }
        setSelectedIds([]);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllPending = () => {
        const pendingIds = filteredEnrollments.filter(e => e.status === "pending").map(e => e.id);
        setSelectedIds(pendingIds);
    };

    const filteredEnrollments = useMemo(() => {
        return enrollments.filter(e => {
            const matchesSearch = !searchQuery ||
                e.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || e.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [enrollments, searchQuery, statusFilter]);

    const stats = useMemo(() => ({
        total: enrollments.length,
        pending: enrollments.filter(e => e.status === "pending").length,
        approved: enrollments.filter(e => e.status === "approved").length,
        rejected: enrollments.filter(e => e.status === "rejected").length,
        totalRevenue: enrollments.filter(e => e.status === "approved").reduce((acc, e) => acc + (Number(e.coursePrice) || 0), 0),
    }), [enrollments]);

    return (
        <RoleGuard allowedRoles={["admin", "moderator"]}>
            <DashboardLayout>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Financial <span className="text-primary italic">Terminal</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Verify bKash / Nagad / Rocket Transactions
                        </p>
                    </div>
                    {stats.pending > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500">
                            <AlertTriangle size={16} />
                            <span className="font-robot text-xs uppercase">{stats.pending} Pending</span>
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <MiniStat icon={<Receipt size={16} />} label="Total" value={stats.total} color="text-foreground" />
                    <MiniStat icon={<Clock size={16} />} label="Pending" value={stats.pending} color="text-amber-500" />
                    <MiniStat icon={<CheckCircle size={16} />} label="Approved" value={stats.approved} color="text-emerald-500" />
                    <MiniStat icon={<XCircle size={16} />} label="Rejected" value={stats.rejected} color="text-red-500" />
                    <MiniStat icon={<DollarSign size={16} />} label="Revenue" value={`$${stats.totalRevenue}`} color="text-primary" isText />
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Search by name, course, or TRX ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-border rounded-xl font-inter text-sm outline-none focus:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none pl-4 pr-10 py-3 bg-foreground/5 border border-border rounded-xl font-robot text-xs uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between"
                    >
                        <span className="font-robot text-xs uppercase text-primary">{selectedIds.length} selected</span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkApprove}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-robot text-xs uppercase hover:bg-emerald-600 transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={14} /> Approve All
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 border border-border rounded-lg font-robot text-xs uppercase hover:bg-foreground/5 transition-all"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Select All Button */}
                {statusFilter === "pending" || (statusFilter === "all" && stats.pending > 0) ? (
                    <button
                        onClick={selectAllPending}
                        className="mb-4 font-robot text-[10px] uppercase tracking-widest text-primary hover:underline"
                    >
                        Select all pending ({filteredEnrollments.filter(e => e.status === "pending").length})
                    </button>
                ) : null}

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEnrollments.map((e) => (
                            <motion.div
                                layout
                                key={e.id}
                                className={`glass rounded-2xl border ${selectedIds.includes(e.id) ? "border-primary" :
                                        e.status === "pending" ? "border-amber-500/30" : "border-border"
                                    } p-6 flex flex-col lg:flex-row gap-6 transition-all relative overflow-hidden`}
                            >
                                {/* Selection Checkbox */}
                                {e.status === "pending" && (
                                    <div className="absolute top-6 left-6">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(e.id)}
                                            onChange={() => toggleSelect(e.id)}
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* Status Indicator Strip */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${e.status === "approved" ? "bg-emerald-500" :
                                        e.status === "rejected" ? "bg-red-500" :
                                            "bg-amber-500 animate-pulse"
                                    }`} />

                                {/* Student & Course Info */}
                                <div className={`flex-1 space-y-4 ${e.status === "pending" ? "pl-8" : ""}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-robot text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-1 block">
                                                {e.courseName}
                                            </span>
                                            <h3 className="font-robot text-xl font-bold uppercase text-foreground">
                                                {e.studentName}
                                            </h3>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-robot text-[9px] uppercase font-bold ${e.status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                                                e.status === "rejected" ? "bg-red-500/10 text-red-500" :
                                                    "bg-amber-500/10 text-amber-500"
                                            }`}>
                                            {e.status === "pending" ? <Clock size={10} /> : e.status === "approved" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {e.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="font-inter text-[10px] uppercase tracking-widest text-foreground/30">Contact</p>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-inter text-xs text-foreground/60 flex items-center gap-2"><Phone size={12} /> {e.mobileNumber}</span>
                                                <span className="font-inter text-xs text-foreground/60 flex items-center gap-2"><Mail size={12} /> {e.email}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-inter text-[10px] uppercase tracking-widest text-foreground/30">Submitted</p>
                                            <p className="font-inter text-xs text-foreground/60 flex items-center gap-2">
                                                <Clock size={12} /> {new Date(e.requestedAt?.seconds * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Box */}
                                <div className="lg:w-72 bg-foreground/5 rounded-2xl p-5 border border-border flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Receipt size={14} className="text-primary" />
                                            <span className="font-robot text-[9px] uppercase tracking-widest text-foreground/40 font-bold">Transaction</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/30 mb-1">Method</p>
                                                <p className="font-robot text-sm font-bold text-foreground">{e.paymentMethod}</p>
                                            </div>
                                            <div>
                                                <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/30 mb-1">Amount</p>
                                                <p className="font-robot text-sm font-bold text-primary">${e.coursePrice}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/30 mb-1">TRX ID</p>
                                            <p className="font-mono text-xs font-bold text-foreground select-all break-all">{e.transactionId}</p>
                                        </div>
                                        <div className="mt-3">
                                            <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/30 mb-1">Sender</p>
                                            <p className="font-robot text-xs text-foreground/70">{e.sendingNumber}</p>
                                        </div>
                                    </div>

                                    {e.status === "pending" && (
                                        <div className="flex gap-2 mt-5 pt-5 border-t border-border">
                                            <button
                                                disabled={processing === e.id}
                                                onClick={() => handleApprove(e)}
                                                className="flex-1 bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                {processing === e.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                                            </button>
                                            <button
                                                disabled={processing === e.id}
                                                onClick={() => handleReject(e)}
                                                className="flex-1 bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {filteredEnrollments.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-foreground/20 italic font-inter text-sm">
                                <Receipt size={40} className="mb-4 opacity-50" />
                                {searchQuery || statusFilter !== "all"
                                    ? "No enrollments match your criteria..."
                                    : "No financial transmissions detected..."}
                            </div>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && (
                    <p className="mt-6 font-inter text-xs text-foreground/30 text-center">
                        Showing {filteredEnrollments.length} of {enrollments.length} enrollments
                    </p>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}

function MiniStat({ icon, label, value, color, isText }: { icon: React.ReactNode; label: string; value: string | number; color: string; isText?: boolean }) {
    return (
        <div className="glass p-4 rounded-2xl border border-border flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className={`font-robot ${isText ? 'text-lg' : 'text-xl'} font-bold ${color}`}>{value}</p>
                <p className="font-robot text-[8px] uppercase tracking-widest text-foreground/40">{label}</p>
            </div>
        </div>
    );
}
