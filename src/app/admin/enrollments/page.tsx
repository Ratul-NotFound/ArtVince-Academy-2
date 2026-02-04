"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy,
    arrayUnion,
    increment
} from "firebase/firestore";
import { EnrollmentRequest } from "@/types";
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink, Receipt, User as UserIcon, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

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
            // 1. Update Enrollment Status
            await updateDoc(doc(db, "enrollments", enrollment.id), {
                status: "approved",
                processedAt: new Date(),
            });

            // 2. Add course to user's enrolledCourses
            await updateDoc(doc(db, "users", enrollment.uid), {
                enrolledCourses: arrayUnion(enrollment.courseId)
            });

            // 3. Increment course enrollment count
            await updateDoc(doc(db, "courses", enrollment.courseId), {
                enrolledCount: increment(1)
            });

            fetchEnrollments();
        } catch (error) {
            console.error("Error approving enrollment:", error);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (enrollmentId: string) => {
        if (!confirm("Are you sure you want to reject this enrollment?")) return;
        setProcessing(enrollmentId);
        try {
            await updateDoc(doc(db, "enrollments", enrollmentId), {
                status: "rejected",
                processedAt: new Date(),
            });
            fetchEnrollments();
        } catch (error) {
            console.error("Error rejecting enrollment:", error);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <RoleGuard allowedRoles={["admin", "moderator"]}>
            <DashboardLayout>
                <div className="mb-10">
                    <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                        Financial <span className="text-primary italic">Terminal</span>
                    </h1>
                    <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                        Verify bKash / Nagad / Rocket Transactions
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {enrollments.map((e) => (
                            <motion.div
                                layout
                                key={e.id}
                                className={`glass rounded-3xl border ${e.status === "pending" ? "border-primary/20" : "border-border"
                                    } p-8 flex flex-col md:flex-row gap-8 transition-all relative overflow-hidden group`}
                            >
                                {/* Status Indicator Strip */}
                                <div className={`absolute top-0 left-0 w-2 h-full ${e.status === "approved" ? "bg-emerald-500" :
                                        e.status === "rejected" ? "bg-red-500" :
                                            "bg-primary animate-pulse"
                                    }`} />

                                {/* Student & Course Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-robot text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-1 block">
                                                {e.courseName}
                                            </span>
                                            <h3 className="font-robot text-xl font-bold uppercase text-foreground">
                                                {e.studentName}
                                            </h3>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-robot text-[9px] uppercase font-bold ${e.status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                                                e.status === "rejected" ? "bg-red-500/10 text-red-500" :
                                                    "bg-primary/10 text-primary"
                                            }`}>
                                            {e.status === "pending" ? <Clock size={10} /> : e.status === "approved" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {e.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                        <div className="space-y-1">
                                            <p className="font-inter text-[10px] uppercase tracking-widest text-foreground/30">Contact Info</p>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-inter text-xs text-foreground/60 flex items-center gap-2"><Phone size={12} /> {e.mobileNumber}</span>
                                                <span className="font-inter text-xs text-foreground/60 flex items-center gap-2"><Mail size={12} /> {e.email}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-inter text-[10px] uppercase tracking-widest text-foreground/30">Metadata</p>
                                            <p className="font-inter text-xs text-foreground/60 flex items-center gap-2 italic">
                                                <Clock size={12} /> Requested: {new Date(e.requestedAt.seconds * 1000).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction Box */}
                                <div className="md:w-72 bg-foreground/5 rounded-2xl p-6 border border-border flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Receipt size={16} className="text-primary" />
                                            <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Transaction Details</span>
                                        </div>
                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mb-1">Method</p>
                                        <p className="font-robot text-sm font-bold text-foreground mb-4">{e.paymentMethod}</p>

                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mb-1">TRX ID</p>
                                        <p className="font-mono text-sm font-bold text-primary select-all">{e.transactionId}</p>

                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-4 mb-1">Sending Number</p>
                                        <p className="font-robot text-sm text-foreground">{e.sendingNumber}</p>
                                    </div>

                                    {e.status === "pending" && (
                                        <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                                            <button
                                                disabled={processing === e.id}
                                                onClick={() => handleApprove(e)}
                                                className="flex-1 bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                {processing === e.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                                            </button>
                                            <button
                                                disabled={processing === e.id}
                                                onClick={() => handleReject(e.id)}
                                                className="flex-1 bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {enrollments.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-foreground/20 italic font-inter text-sm">
                                <Receipt size={40} className="mb-4 opacity-50" />
                                No financial transmissions detected...
                            </div>
                        )}
                    </div>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}
