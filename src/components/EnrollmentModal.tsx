"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Course } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Smartphone, Receipt, ShieldCheck, AlertCircle } from "lucide-react";

interface EnrollmentModalProps {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
}

export default function EnrollmentModal({ course, isOpen, onClose }: EnrollmentModalProps) {
    const { user, profile } = useAuth();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState<"bKash" | "Nagad" | "Rocket">("bKash");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        studentName: profile?.displayName || "",
        mobileNumber: "",
        email: user?.email || "",
        transactionId: "",
        sendingNumber: "",
    });

    const paymentNumbers = {
        bKash: process.env.NEXT_PUBLIC_BKASH_NUMBER || "(Contact Admin for Number)",
        Nagad: process.env.NEXT_PUBLIC_NAGAD_NUMBER || "(Contact Admin for Number)",
        Rocket: process.env.NEXT_PUBLIC_ROCKET_NUMBER || "(Contact Admin for Number)",
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "enrollments"), {
                uid: user?.uid,
                courseId: course.id,
                courseName: course.title,
                coursePrice: course.price,
                studentName: formData.studentName,
                mobileNumber: formData.mobileNumber,
                email: formData.email,
                paymentMethod: method,
                transactionId: formData.transactionId,
                sendingNumber: formData.sendingNumber,
                status: "pending",
                requestedAt: new Date(),
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Enrollment error:", error);
            alert("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative bg-surface border border-border w-full max-w-xl rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-6 md:p-8 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
                            <div className="min-w-0 flex-1">
                                <h2 className="font-robot text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary font-bold mb-1">Secure Enrollment</h2>
                                <p className="font-robot text-lg sm:text-2xl font-bold uppercase tracking-tighter text-foreground truncate">
                                    {course.title}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors shrink-0 ml-2">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
                            {!submitted ? (
                                <div className="space-y-8">
                                    {/* Step Indicators */}
                                    <div className="flex items-center gap-4">
                                        {[1, 2].map((s) => (
                                            <div key={s} className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-robot text-[10px] font-bold ${step >= s ? "bg-primary text-white" : "bg-foreground/10 text-foreground/30"
                                                    }`}>
                                                    {s}
                                                </div>
                                                <span className={`font-robot text-[10px] uppercase tracking-widest ${step >= s ? "text-foreground" : "text-foreground/20"
                                                    }`}>
                                                    {s === 1 ? "Payment" : "Verification"}
                                                </span>
                                                {s === 1 && <div className="w-8 h-px bg-border mx-2" />}
                                            </div>
                                        ))}
                                    </div>

                                    {step === 1 ? (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <h3 className="font-robot text-base sm:text-lg font-bold uppercase mb-4 sm:mb-6">Select Payment Method</h3>
                                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                                                {(["bKash", "Nagad", "Rocket"] as const).map((m) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setMethod(m)}
                                                        className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-2 ${method === m ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                                                            }`}
                                                    >
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-foreground/5 flex items-center justify-center font-robot font-black text-[8px] sm:text-[10px]">
                                                            {m[0]}
                                                        </div>
                                                        <span className="font-robot text-[8px] sm:text-[10px] uppercase tracking-widest font-bold">{m}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Smartphone size={20} className="text-primary" />
                                                    <p className="font-robot text-xs uppercase tracking-widest font-bold">Payment Instructions</p>
                                                </div>
                                                <ul className="space-y-3 font-inter text-xs text-foreground/60">
                                                    <li>1. Open your <span className="text-primary font-bold">{method}</span> app</li>
                                                    <li>2. Choose <span className="text-foreground font-bold italic">"Send Money"</span> option</li>
                                                    <li>3. Enter Number: <span className="text-primary font-mono font-bold select-all bg-primary/10 px-2 py-1 rounded">{paymentNumbers[method]}</span></li>
                                                    <li>4. Amount: <span className="text-foreground font-bold text-lg">${course.price}</span></li>
                                                    <li>5. Complete transaction and keep the Transaction ID.</li>
                                                </ul>
                                            </div>

                                            <button
                                                onClick={() => setStep(2)}
                                                className="w-full bg-primary text-white py-4 rounded-2xl font-robot text-xs uppercase tracking-[0.2em] font-bold mt-8 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                            >
                                                Next: Verify Payment
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Full Name</label>
                                                        <input required type="text" value={formData.studentName} onChange={(e) => setFormData({ ...formData, studentName: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Phone Number</label>
                                                        <input required type="text" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Transaction ID (TRX ID)</label>
                                                    <div className="relative">
                                                        <Receipt size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50" />
                                                        <input required type="text" placeholder="e.g. 5K8A9B2C1D" value={formData.transactionId} onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl pl-12 pr-4 py-3 font-mono text-sm outline-none focus:border-primary transition-all text-primary font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Sending Phone Number</label>
                                                    <input required type="text" placeholder="Your bKash/Nagad number" value={formData.sendingNumber} onChange={(e) => setFormData({ ...formData, sendingNumber: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all" />
                                                </div>

                                                <div className="flex items-start gap-3 p-4 bg-foreground/[0.03] rounded-2xl border border-border">
                                                    <ShieldCheck size={20} className="text-primary shrink-0 mt-1" />
                                                    <p className="font-inter text-[10px] text-foreground/40 leading-relaxed">
                                                        By submitting, you agree to manual verification. Your enrollment will be approved within 1-2 hours after valid payment check.
                                                    </p>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-robot text-xs uppercase tracking-[0.2em] font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center"
                                                    >
                                                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Submit Enrollment"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(1)}
                                                        className="px-8 border border-border rounded-2xl font-robot text-xs uppercase tracking-widest hover:bg-foreground/5 transition-all"
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-10 flex flex-col items-center text-center space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h3 className="font-robot text-3xl font-bold uppercase tracking-tighter">Request Transmitted</h3>
                                    <p className="font-inter text-sm text-foreground/40 max-w-sm">
                                        Your payment information is now in the verification vault. Our operatives will audit the transaction and grant course access shortly.
                                    </p>
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-3">
                                        <AlertCircle size={18} className="text-primary" />
                                        <p className="font-robot text-[10px] uppercase tracking-widest font-bold text-primary">Status: Pending Verification</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="bg-foreground text-background px-12 py-4 rounded-2xl font-robot text-xs uppercase tracking-widest font-bold hover:bg-primary transition-all"
                                    >
                                        Close Terminal
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
