"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { EnrollmentRequest } from "@/types";
import { motion } from "framer-motion";
import { Receipt, Clock, CheckCircle2, XCircle, CreditCard, ExternalLink, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function EnrollmentHistoryPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "enrollments"),
                    where("uid", "==", user.uid),
                    orderBy("requestedAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EnrollmentRequest));
                setEnrollments(data);
            } catch (error) {
                console.error("Error fetching enrollment history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                    Financial <span className="text-primary italic">Archives</span>
                </h1>
                <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                    Review your academic transmissions and transaction statuses
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
                            className="glass p-8 rounded-[32px] border border-border flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${e.status === "approved" ? "bg-emerald-500" :
                                    e.status === "rejected" ? "bg-red-500" :
                                        "bg-primary animate-pulse"
                                }`} />

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-robot text-[10px] uppercase tracking-widest font-bold text-primary">
                                        ID: {e.id.slice(0, 8)}
                                    </span>
                                    <div className={`px-2 py-0.5 rounded-full font-robot text-[8px] uppercase font-bold tracking-widest ${e.status === "approved" ? "bg-emerald-500/10 text-emerald-500" :
                                            e.status === "rejected" ? "bg-red-500/10 text-red-500" :
                                                "bg-primary/10 text-primary"
                                        }`}>
                                        {e.status}
                                    </div>
                                </div>
                                <h3 className="font-robot text-2xl font-bold uppercase text-foreground leading-none">
                                    {e.courseName}
                                </h3>
                                <p className="font-inter text-xs text-foreground/30 flex items-center gap-2">
                                    <Clock size={12} /> Requested: {new Date(e.requestedAt.seconds * 1000).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex flex-col md:items-end gap-1">
                                <div className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-xl border border-border">
                                    <CreditCard size={14} className="text-primary" />
                                    <span className="font-robot text-[11px] uppercase tracking-widest font-bold text-foreground/60">{e.paymentMethod}</span>
                                    <span className="w-1 h-1 rounded-full bg-foreground/10 mx-1" />
                                    <span className="font-mono text-[10px] text-primary font-bold">{e.transactionId}</span>
                                </div>
                                {e.status === "approved" && (
                                    <Link
                                        href={`/dashboard/courses/${e.courseId}`}
                                        className="mt-4 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                    >
                                        Access Course <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {enrollments.length === 0 && (
                        <div className="py-24 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
                            <Receipt size={48} className="text-foreground/10" />
                            <p className="font-inter text-sm text-foreground/30 italic">No financial footprints detected in this sector.</p>
                            <Link href="/courses" className="text-primary font-robot text-[10px] uppercase tracking-widest font-bold underline">Initiate First Transmission</Link>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}

function ArrowRight({ size }: { size: number }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    );
}
