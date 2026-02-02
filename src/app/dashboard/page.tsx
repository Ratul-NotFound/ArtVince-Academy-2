"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function UserDashboard() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="mb-12">
                <span className="font-handwritten text-3xl text-primary block mb-2">Welcome Back</span>
                <h1 className="font-robot text-4xl md:text-6xl font-bold uppercase tracking-tighter text-foreground">
                    {user?.displayName || "Agent"} <span className="text-outline-theme text-transparent">_001</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="md:col-span-1 space-y-8">
                    <div className="glass p-8 rounded-2xl border border-border">
                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-4">Total Progress</span>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="font-robot text-5xl font-bold text-foreground">65%</span>
                            <span className="font-robot text-xs text-primary mb-2">Lvl 12</span>
                        </div>
                        <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "65%" }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>

                    <div className="glass p-8 rounded-2xl border border-border">
                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-6">Upcoming Sessions</span>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-robot text-primary">05</div>
                                <div>
                                    <p className="font-robot text-sm font-bold uppercase text-foreground">Weapon Modeling Live</p>
                                    <p className="font-inter text-xs text-foreground/30">Tomorrow, 10:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div className="md:col-span-2 space-y-8">
                    <h3 className="font-robot text-xl font-bold uppercase tracking-widest text-foreground">Active Operatives</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {[
                            { title: "AAA Character Design", progress: 82, img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" },
                            { title: "3D Animation Masterclass", progress: 45, img: "https://images.unsplash.com/photo-1616440802342-e1d0294f3655?q=80&w=2047&auto=format&fit=crop" },
                        ].map((course, i) => (
                            <div key={i} className="group glass p-2 rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-6 pr-8 transition-colors duration-300">
                                <div className="w-full sm:w-40 aspect-video rounded-xl overflow-hidden relative">
                                    <img src={course.img} alt="" className="object-cover fill grayscale group-hover:grayscale-0 transition-all" />
                                </div>
                                <div className="flex-1 py-4">
                                    <h4 className="font-robot font-bold text-lg uppercase mb-4 text-foreground">{course.title}</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-1 bg-foreground/5 rounded-full overflow-hidden">
                                            <div style={{ width: `${course.progress}%` }} className="h-full bg-primary" />
                                        </div>
                                        <span className="font-robot text-xs text-foreground/40">{course.progress}%</span>
                                    </div>
                                </div>
                                <button className="bg-foreground text-background p-4 rounded-full hover:bg-primary hover:text-white transition-all">
                                    <Play size={20} fill="currentColor" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
