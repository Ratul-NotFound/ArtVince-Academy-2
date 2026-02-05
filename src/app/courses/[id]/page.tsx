"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Course, CourseModule, UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnrollmentModal from "@/components/EnrollmentModal";
import {
    Clock,
    BarChart,
    Users,
    CheckCircle2,
    Play,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Zap,
    BookOpen,
    Lock,
    User
} from "lucide-react";
import { motion } from "framer-motion";

export default function CourseDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [trainer, setTrainer] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!id) return;
            try {
                // Fetch Course
                const docSnap = await getDoc(doc(db, "courses", id as string));
                if (docSnap.exists()) {
                    let courseData = { id: docSnap.id, ...docSnap.data() } as Course;

                    // Get REAL enrollment count from enrollments collection
                    const enrollmentsQuery = query(
                        collection(db, "enrollments"),
                        where("courseId", "==", id)
                    );
                    const enrollmentsSnap = await getDocs(enrollmentsQuery);
                    courseData.enrolledCount = enrollmentsSnap.size; // Real count

                    setCourse(courseData);

                    // Fetch Modules for this course
                    const qModules = query(
                        collection(db, "courseModules"),
                        where("courseId", "==", id),
                        orderBy("order", "asc")
                    );
                    const modulesSnap = await getDocs(qModules);
                    setModules(modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseModule)));

                    // Fetch Trainer info if trainerId exists
                    if (courseData.trainerId) {
                        const trainerDoc = await getDoc(doc(db, "users", courseData.trainerId));
                        if (trainerDoc.exists()) {
                            setTrainer(trainerDoc.data() as UserProfile);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching course:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id]);

    const isEnrolled = profile?.enrolledCourses?.includes(id as string);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-background p-6">
                <h1 className="font-robot text-4xl font-bold uppercase mb-4 text-foreground/20">Data Unavailable</h1>
                <button onClick={() => router.push("/courses")} className="text-primary font-robot uppercase tracking-widest text-sm underline">Return to Academy</button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-50 blur-[120px] rounded-full -top-40 -left-40 w-full h-full pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                            >
                                <Zap size={14} className="text-primary" />
                                <span className="font-robot text-[10px] uppercase tracking-widest text-primary font-bold">Industry Standard Training</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-robot text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground leading-[0.9]"
                            >
                                {course.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="font-inter text-lg text-foreground/50 max-w-xl leading-relaxed"
                            >
                                {course.description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-primary border border-border">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30">Duration</p>
                                        <p className="font-robot text-xs font-bold uppercase">{course.duration || "8 Weeks"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-primary border border-border">
                                        <BarChart size={18} />
                                    </div>
                                    <div>
                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30">Difficulty</p>
                                        <p className="font-robot text-xs font-bold uppercase">{course.difficulty}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-primary border border-border">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30">Enrolled</p>
                                        <p className="font-robot text-xs font-bold uppercase">{course.enrolledCount} Operatives</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="pt-6"
                            >
                                {isEnrolled ? (
                                    <button
                                        onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                                        className="bg-primary text-white px-10 py-5 rounded-2xl font-robot text-sm uppercase tracking-[0.2em] font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3"
                                    >
                                        Resume Learning <ArrowRight size={20} />
                                    </button>
                                ) : (
                                    <div className="flex gap-4 items-center">
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    router.push("/login?redirect=" + id);
                                                } else {
                                                    setIsEnrollModalOpen(true);
                                                }
                                            }}
                                            className="bg-primary text-white px-10 py-5 rounded-2xl font-robot text-sm uppercase tracking-[0.2em] font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3 shrink-0"
                                        >
                                            Enroll in Class <ArrowRight size={20} />
                                        </button>
                                        <div className="hidden sm:block">
                                            <p className="font-robot text-3xl font-black text-foreground">${course.price}</p>
                                            <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30">Single Payment</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Thumbnail / Video Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-video rounded-3xl overflow-hidden border border-border group"
                        >
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                            ) : (
                                <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/10">
                                    <BookOpen size={120} strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl animate-pulse">
                                    <Play size={32} fill="currentColor" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Details */}
            <section className="py-20 border-t border-border bg-foreground/[0.01]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2 space-y-12">
                            {/* Trainer Info */}
                            {trainer && (
                                <div className="glass p-6 rounded-2xl border border-border flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                                        {trainer.photoURL ? (
                                            <img src={trainer.photoURL} alt={trainer.displayName || ""} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={28} className="text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 mb-1">Instructor</p>
                                        <h4 className="font-robot text-lg font-bold uppercase text-foreground">{trainer.displayName || "Academy Trainer"}</h4>
                                        {trainer.bio && (
                                            <p className="font-inter text-xs text-foreground/50 mt-1 line-clamp-2">{trainer.bio}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <h3 className="font-robot text-2xl font-bold uppercase tracking-tight">Curriculum Preview</h3>
                                <div className="space-y-4">
                                    {modules.length > 0 ? (
                                        modules.map((m, i) => (
                                            <div key={m.id} className="glass p-6 rounded-2xl border border-border flex items-center justify-between group hover:border-primary/50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center font-robot text-xs text-foreground/40 font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                                        {m.order < 10 ? `0${m.order}` : m.order}
                                                    </div>
                                                    <span className="font-robot text-sm uppercase tracking-widest text-foreground/70 group-hover:text-foreground transition-all">{m.title}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-foreground/20">
                                                    {isEnrolled ? (
                                                        <>
                                                            <span className="font-inter text-xs text-primary">Unlocked</span>
                                                            <CheckCircle2 size={16} className="text-primary" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-inter text-xs">Locked</span>
                                                            <Lock size={16} />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center">
                                            <BookOpen size={32} className="text-foreground/10 mb-4" />
                                            <p className="font-inter text-sm text-foreground/30 italic">Curriculum is being prepared by the instructor.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="glass p-8 rounded-3xl border border-border h-full">
                                <h4 className="font-robot text-lg font-bold uppercase mb-6 flex items-center gap-2">
                                    <Zap size={18} className="text-primary" /> Included Features
                                </h4>
                                <ul className="space-y-4">
                                    {[
                                        "Lifetime High-Res Video Access",
                                        "Downloadable Pipeline Assets",
                                        "Bi-Weekly Live Mentorship Sessions",
                                        "Private Academic Discord Access",
                                        "Official Industry Certification",
                                        "Portfolio Review by Mentors"
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="font-inter text-sm text-foreground/60">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <EnrollmentModal
                course={course}
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
            />
        </main>
    );
}
