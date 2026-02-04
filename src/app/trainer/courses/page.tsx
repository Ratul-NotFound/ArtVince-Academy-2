"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Course } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Users, Video, Plus, Layout, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TrainerCoursesPage() {
    const { user, profile } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedCourses = async () => {
            if (!user) return;
            try {
                let q;
                if (profile?.role === "admin" || profile?.role === "moderator") {
                    q = query(collection(db, "courses"));
                } else {
                    q = query(collection(db, "courses"), where("trainerId", "==", user.uid));
                }
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(data);
            } catch (error) {
                console.error("Error fetching trainer courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignedCourses();
    }, [user]);

    return (
        <RoleGuard allowedRoles={["trainer", "admin", "moderator"]}>
            <DashboardLayout>
                <div className="mb-10">
                    <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                        Instructor <span className="text-primary italic">Command</span>
                    </h1>
                    <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                        Manage your assigned academic programs
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {courses.map((course) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-8 rounded-[32px] border border-border group hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="text-right">
                                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 block mb-1">Status</span>
                                        <span className="font-robot text-[10px] uppercase tracking-widest font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                            {course.status}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="font-robot text-2xl font-bold uppercase text-foreground mb-4 leading-tight">
                                    {course.title}
                                </h3>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="space-y-1">
                                        <p className="font-robot text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-bold">Students</p>
                                        <div className="flex items-center gap-2 text-foreground font-robot font-bold uppercase">
                                            <Users size={12} className="text-primary" /> {course.enrolledCount}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-robot text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-bold">Difficulty</p>
                                        <div className="flex items-center gap-2 text-foreground font-robot font-bold uppercase text-[10px]">
                                            {course.difficulty}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-robot text-[9px] uppercase tracking-[0.2em] text-foreground/30 font-bold">Category</p>
                                        <div className="flex items-center gap-2 text-foreground font-inter font-bold text-[10px]">
                                            {course.category}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-border">
                                    <Link
                                        href={`/trainer/courses/${course.id}/modules`}
                                        className="flex-1 bg-foreground text-background py-4 rounded-xl font-robot text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Layout size={14} /> Manage Syllabus
                                    </Link>
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                        className="w-14 bg-foreground/5 text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all rounded-xl flex items-center justify-center"
                                    >
                                        <Plus size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}

                        {courses.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-border rounded-[40px]">
                                <BookOpen size={48} className="text-foreground/10" />
                                <p className="font-inter text-sm text-foreground/30 italic font-medium">No logistical assignments located in your sector.</p>
                                <button className="text-primary font-robot text-[10px] uppercase tracking-widest font-bold underline">Contact High Command</button>
                            </div>
                        )}
                    </div>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}
