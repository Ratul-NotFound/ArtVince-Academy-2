"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Footer from "@/components/Footer";

export default function ContactPage() {
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
                    <form className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Full Name</label>
                                <input type="text" className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter text-foreground" />
                            </div>
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Email Protocol</label>
                                <input type="email" className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter text-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Subject</label>
                            <input type="text" className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter text-foreground" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Encryption Message</label>
                            <textarea rows={6} className="w-full bg-surface border border-border rounded-xl px-4 py-4 outline-none focus:border-primary transition-all font-inter resize-none text-foreground" />
                        </div>
                        <button className="w-full bg-primary py-5 rounded-xl font-robot font-bold uppercase tracking-widest flex items-center justify-center gap-3 group overflow-hidden relative text-white">
                            <span className="relative z-10 flex items-center gap-3">
                                Transmit Signal <Send size={18} />
                            </span>
                            <div className="absolute inset-0 bg-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </button>
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
