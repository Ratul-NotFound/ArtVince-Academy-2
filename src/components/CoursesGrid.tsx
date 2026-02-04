"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Loader2 } from "lucide-react";
import TiltCard from "./TiltCard";
import ScrollReveal from "./ScrollReveal";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { Course } from "@/types";

export default function CoursesGrid() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch more items to allow client-side filtering
                const q = query(collection(db, "courses"), limit(50));
                const querySnapshot = await getDocs(q);
                let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));

                // 1. Filter for "Published" status (client-side)
                data = data.filter(course => course.status === "Published");

                // 2. Sort by createdAt desc
                data.sort((a: any, b: any) => {
                    const timeA = a.createdAt?.seconds || 0;
                    const timeB = b.createdAt?.seconds || 0;
                    return timeB - timeA;
                });

                // 3. Take top 4
                setCourses(data.slice(0, 4));
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <section className="py-32 bg-background overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-6" suppressHydrationWarning>
                <ScrollReveal distance={50} direction="up">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8" suppressHydrationWarning>
                        <div suppressHydrationWarning>
                            <span className="font-handwritten text-3xl text-primary block mb-2">Our Programs</span>
                            <h2 className="font-robot text-5xl md:text-7xl font-bold uppercase tracking-tighter text-foreground">
                                Forging the <br /> <span className="text-outline-theme text-transparent">Next Generation</span>
                            </h2>
                        </div>
                        <Link href="/courses" className="font-robot uppercase tracking-widest text-sm border-b border-primary pb-2 hover:text-primary transition-all">
                            View All Courses
                        </Link>
                    </div>
                </ScrollReveal>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary" suppressHydrationWarning>
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" suppressHydrationWarning>
                        {courses.map((course) => (
                            <ScrollReveal key={course.id} distance={30} direction="up" rotateX={20}>
                                <Link href={`/courses/${course.id}`}>
                                    <TiltCard className="group relative h-[500px] overflow-hidden rounded-2xl cursor-pointer">
                                        {course.thumbnail ? (
                                            <Image
                                                src={course.thumbnail}
                                                alt={course.title}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/10 group-hover:text-primary/20 transition-colors">
                                                <BookOpen size={80} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                        <div className="absolute bottom-0 left-0 p-8 w-full transform group-hover:-translate-y-4 transition-transform duration-500">
                                            <span className="font-robot text-[10px] uppercase tracking-[0.2em] text-primary mb-2 block">
                                                {course.category}
                                            </span>
                                            <h3 className="font-robot text-2xl font-bold uppercase mb-4 leading-tight truncate">
                                                {course.title}
                                            </h3>
                                            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                                                <span className="font-robot font-bold text-xl text-foreground">${course.price}</span>
                                                <div className="bg-foreground text-background p-3 rounded-full hover:bg-primary hover:text-white transition-colors">
                                                    <ArrowUpRight size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </TiltCard>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
