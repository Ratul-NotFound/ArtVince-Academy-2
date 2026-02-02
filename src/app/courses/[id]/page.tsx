"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Play, CheckCircle, Clock, BarChart, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";

interface Course {
    id: string;
    title: string;
    category: string;
    price: string;
    image: string;
    description?: string;
}

export default function CourseDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            const docRef = doc(db, "courses", id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
            }

            if (user) {
                const enrollQuery = query(
                    collection(db, "enrollments"),
                    where("userId", "==", user.uid),
                    where("courseId", "==", id)
                );
                const enrollSnap = await getDocs(enrollQuery);
                setIsEnrolled(!enrollSnap.empty);
            }
            setLoading(false);
        };

        if (id) fetchCourse();
    }, [id, user]);

    const handleEnroll = async () => {
        if (!user) {
            alert("Please login to enroll");
            return;
        }
        await addDoc(collection(db, "enrollments"), {
            userId: user.uid,
            courseId: id,
            enrolledAt: new Date(),
            progress: 0
        });
        setIsEnrolled(true);
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-robot uppercase tracking-widest bg-background text-foreground">Initializing Intel...</div>;
    if (!course) return <div className="h-screen flex items-center justify-center font-robot bg-background text-foreground">Course Not Found</div>;

    return (
        <div className="bg-background min-h-screen pt-32 text-foreground transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-3 gap-16">
                    {/* Main Info */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className="font-robot text-primary uppercase tracking-[0.3em] text-xs mb-4 block">Deployment Log // {course.category}</span>
                            <h1 className="font-robot text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8 leading-tight">
                                {course.title}
                            </h1>
                            <div className="aspect-video rounded-3xl overflow-hidden relative border border-border mb-12">
                                <img src={course.image} alt="" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-center justify-center">
                                    <button className="bg-primary p-6 rounded-full hover:scale-110 transition-transform">
                                        <Play size={32} className="text-white" fill="white" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div>
                                    <h3 className="font-robot text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                                        <ShieldCheck className="text-primary" /> Mission Objectives
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[
                                            "Master industry-standard AAA workflows",
                                            "Build production-ready assets from scratch",
                                            "Personal mentorship from studio veterans",
                                            "Lifetime access to creative resources"
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 p-4 glass rounded-xl border border-border">
                                                <CheckCircle size={20} className="text-primary shrink-0" />
                                                <span className="font-inter text-foreground/70 text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-robot text-2xl font-bold uppercase mb-6 text-foreground">Execution Summary</h3>
                                    <p className="font-inter text-foreground/50 leading-relaxed text-lg">
                                        {course.description || "This advanced module covers the full creative cycle, from conceptualization to deployment. You will work with industry tools and peer-reviewed pipelines to ensure your skills are sharp and market-ready."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Pricing / Enrollment Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 glass p-10 rounded-3xl border border-white/10 space-y-8">
                            <div className="flex justify-between items-end border-b border-border pb-6">
                                <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">Total Access</span>
                                <span className="font-robot text-4xl font-bold text-foreground">{course.price}</span>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-foreground/40"><Clock size={16} /> Duration</span>
                                    <span className="font-robot text-foreground">12 Weeks</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-foreground/40"><BarChart size={16} /> Level</span>
                                    <span className="font-robot text-foreground">Advanced</span>
                                </div>
                            </div>

                            {isEnrolled ? (
                                <button className="w-full bg-foreground/10 border border-border py-5 rounded-xl font-robot font-bold uppercase tracking-widest text-primary">
                                    Enrolled
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    className="w-full bg-primary py-5 rounded-xl font-robot font-bold uppercase tracking-widest text-white hover:bg-foreground hover:text-background transition-all transform hover:scale-[1.02]"
                                >
                                    Enroll Now
                                </button>
                            )}

                            <p className="text-center font-robot text-[10px] uppercase tracking-[0.2em] text-foreground/20">
                                Secure checkout powered by Artvince
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-32">
                <Footer />
            </div>
        </div>
    );
}
