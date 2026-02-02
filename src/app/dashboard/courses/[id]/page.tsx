"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Play, CheckCircle2, ChevronLeft, Lock } from "lucide-react";

export default function CourseViewer() {
    const { id } = useParams();
    const router = useRouter();
    const [activeLesson, setActiveLesson] = useState(0);

    const lessons = [
        { title: "Introduction to AAA Workflow", duration: "12:05", completed: true },
        { title: "Conceptualizing the Character", duration: "45:30", completed: true },
        { title: "Blockout & Proportions", duration: "1:20:15", active: true },
        { title: "High-Poly Sculpting Basics", duration: "3:40:00", locked: true },
        { title: "Substance Painter Pipeline", duration: "2:15:00", locked: true },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Player Section */}
                <div className="flex-1">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-foreground/40 hover:text-foreground mb-6 font-robot text-xs uppercase tracking-widest transition-all"
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </button>

                    <div className="aspect-video bg-surface rounded-3xl overflow-hidden border border-border relative group">
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40 group-hover:bg-background/20 transition-all">
                            <Play size={64} className="text-white cursor-pointer hover:scale-110 transition-transform" fill="white" />
                        </div>
                        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" />
                    </div>

                    <div className="mt-8">
                        <h2 className="font-robot text-3xl font-bold uppercase mb-4 text-foreground">{lessons[activeLesson].title}</h2>
                        <p className="font-inter text-foreground/50 leading-relaxed">
                            In this session, we dive deep into the core principles of cinematic 3D art. You'll learn how to establish a strong foundation for your character using industry-standard blockout techniques.
                        </p>
                    </div>
                </div>

                {/* Sidebar Index */}
                <div className="w-full lg:w-96 space-y-6">
                    <div className="glass p-8 rounded-3xl border border-border">
                        <h3 className="font-robot text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4 text-foreground">Course Content</h3>
                        <div className="space-y-4">
                            {lessons.map((lesson, i) => (
                                <div
                                    key={i}
                                    onClick={() => !lesson.locked && setActiveLesson(i)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${activeLesson === i ? "bg-primary/20 border-primary" : "bg-foreground/5 border-transparent hover:border-foreground/10"
                                        } ${lesson.locked ? "opacity-40 cursor-not-allowed" : ""}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {lesson.completed ? <CheckCircle2 size={18} className="text-green-500" /> : lesson.locked ? <Lock size={18} /> : <Play size={18} />}
                                        <div className="overflow-hidden whitespace-nowrap">
                                            <p className="font-robot text-xs uppercase font-bold truncate text-foreground">{lesson.title}</p>
                                            <p className="font-inter text-[10px] text-foreground/30">{lesson.duration}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/10 p-8 rounded-3xl border border-primary/20">
                        <h4 className="font-robot text-xs font-bold uppercase mb-2 text-primary">Mentor Notes</h4>
                        <p className="font-inter text-sm text-foreground/60">
                            Don't forget to upload your progress mesh to the #critique channel in Discord for feedback.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
