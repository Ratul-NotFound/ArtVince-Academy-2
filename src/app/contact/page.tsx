"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;

        setStatus("submitting");
        try {
            await addDoc(collection(db, "contactMessages"), {
                ...formData,
                status: "unread",
                createdAt: serverTimestamp()
            });
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setStatus("idle"), 5000);
        } catch (error) {
            console.error("Error submitting contact form:", error);
            setStatus("error");
        }
    };

    return (
        <div className="bg-background min-h-screen pt-32 text-foreground transition-colors duration-300">
            <div className="container mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <span className="font-handwritten text-4xl text-primary block mb-4">Get in Touch</span>
                    <h1 className="font-robot text-6xl md:text-9xl font-bold uppercase tracking-tighter text-foreground">
                        Establish <br /> <span className="text-outline-theme text-transparent">Link</span>
                    </h1>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 mb-32">
                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="glass p-12 rounded-[2rem] border border-border"
                >
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Email Protocol</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter text-foreground"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Encryption Message</label>
                            <textarea
                                rows={6}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter resize-none text-foreground"
                            />
                        </div>

                        {status === "success" ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-500/10 border border-emerald-500/50 p-4 rounded-xl flex items-center gap-3 text-emerald-500 font-robot text-xs uppercase tracking-widest font-bold"
                            >
                                <CheckCircle2 size={18} /> Signal Transmitted Successfully
                            </motion.div>
                        ) : (
                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="w-full bg-primary py-5 rounded-xl font-robot font-bold uppercase tracking-widest flex items-center justify-center gap-3 group overflow-hidden relative text-white disabled:opacity-50"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {status === "submitting" ? (
                                        <>Broadcasting... <Loader2 className="animate-spin" size={18} /></>
                                    ) : (
                                        <>Transmit Signal <Send size={18} /></>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>
                        )}
                        {status === "error" && (
                            <p className="text-red-500 font-robot text-[10px] uppercase tracking-widest text-center">Transmission Error. Please retry later.</p>
                        )}
                    </form>
                </motion.div>

                {/* Info */}
                <div className="space-y-12 py-12">
                    <div className="flex gap-8 group">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h4 className="font-robot font-bold uppercase text-sm tracking-widest mb-2 text-foreground">Email</h4>
                            <p className="font-inter text-foreground/50 text-lg">ops@artvince.com</p>
                        </div>
                    </div>
                    <div className="flex gap-8 group">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h4 className="font-robot font-bold uppercase text-sm tracking-widest mb-2 text-foreground">Secure Line</h4>
                            <p className="font-inter text-foreground/50 text-lg">+1 (888) ART-VINCE</p>
                        </div>
                    </div>
                    <div className="flex gap-8 group">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 className="font-robot font-bold uppercase text-sm tracking-widest mb-2 text-foreground">Nexus Node</h4>
                            <p className="font-inter text-foreground/50 text-lg">Creative District 7, <br /> San Francisco, CA</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
