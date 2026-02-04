"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Course } from "@/types";
import Link from "next/link";

export default function UserDashboard() {
    const { user, profile } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchDashboardData = async () => {
            if (!profile?.uid || !profile?.enrolledCourses || profile.enrolledCourses.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch Course Details
                const qCourses = query(collection(db, "courses"), where("__name__", "in", profile.enrolledCourses));
                const coursesSnap = await getDocs(qCourses);
                const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 2. Fetch Progress for each course
                const dashboardCourses = await Promise.all(coursesData.map(async (course: any) => {
                    // Get total modules
                    const qMod = query(collection(db, "courseModules"), where("courseId", "==", course.id));
                    const modSnap = await getDocs(qMod);
                    const totalModules = modSnap.size;

                    // Get completed modules
                    const qProg = query(
                        collection(db, "userProgress"),
                        where("uid", "==", profile.uid),
                        where("courseId", "==", course.id)
                    );
                    const progSnap = await getDocs(qProg);
                    const completedCount = !progSnap.empty ? (progSnap.docs[0].data().completedModules?.length || 0) : 0;

                    const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

                    return {
                        ...course,
                        progress
                    };
                }));

                setEnrolledCourses(dashboardCourses);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [profile]);

    const totalAverageProgress = enrolledCourses.length > 0
        ? Math.round(enrolledCourses.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCourses.length)
        : 0;

    return (
        <DashboardLayout>
            <div className="mb-12">
                <span className="font-handwritten text-3xl text-primary block mb-2">Welcome Back</span>
                <h1 className="font-robot text-4xl md:text-6xl font-bold uppercase tracking-tighter text-foreground">
                    {mounted ? (user?.displayName || "Agent") : "Agent"} <span className="text-outline-theme text-transparent">_{mounted ? user?.uid.slice(0, 3).toUpperCase() : "000"}</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="md:col-span-1 space-y-8">
                    <div className="glass p-8 rounded-2xl border border-border">
                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-4">Academy Standing</span>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="font-robot text-5xl font-bold text-foreground">{totalAverageProgress}%</span>
                            <span className="font-robot text-xs text-primary mb-2">Level {Math.floor(totalAverageProgress / 10) + 1}</span>
                        </div>
                        <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalAverageProgress}%` }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <div className="md:col-span-2 space-y-8">
                    <h3 className="font-robot text-xl font-bold uppercase tracking-widest text-foreground">Active Operatives</h3>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {enrolledCourses.map((course) => (
                                <div key={course.id} className="group glass p-2 rounded-2xl border border-border flex flex-col sm:flex-row items-center gap-6 pr-8 transition-colors duration-300">
                                    <div className="w-full sm:w-40 aspect-video rounded-xl overflow-hidden relative border border-border">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        ) : (
                                            <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/10">
                                                <Play size={24} />
                                            </div>
                                        )}
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
                                    <Link
                                        href={`/dashboard/courses/${course.id}`}
                                        className="bg-foreground text-background p-4 rounded-full hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Play size={20} fill="currentColor" />
                                    </Link>
                                </div>
                            ))}

                            {enrolledCourses.length === 0 && (
                                <div className="py-20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                                    <p className="font-inter text-sm text-foreground/30 italic">No active missions located.</p>
                                    <Link href="/courses" className="text-primary font-robot text-[10px] uppercase tracking-widest font-bold underline">Enroll in New Program</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
