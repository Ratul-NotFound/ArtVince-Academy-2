"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFromCache, setInCache, CACHE_TTL } from "@/lib/cache";

interface StatsData {
    mentors: string;
    graduates: string;
    placement: string;
    projects: string;
}

export default function AboutSection() {
    const containerRef = useRef(null);
    const [stats, setStats] = useState<StatsData>({
        mentors: "20+",
        graduates: "500+",
        placement: "95%",
        projects: "1.2k"
    });

    useEffect(() => {
        const fetchStats = async () => {
            const CACHE_KEY = "about_section_stats";

            // Try cache first
            const cached = getFromCache<StatsData>(CACHE_KEY);
            if (cached) {
                setStats(cached);
                return;
            }

            try {
                // Get Trainer Count
                const trainerQuery = query(collection(db, "users"), where("role", "==", "trainer"));
                const trainerSnap = await getDocs(trainerQuery);
                const trainerCount = trainerSnap.size;

                // Get Student Count
                const studentQuery = query(collection(db, "users"), where("role", "==", "user"));
                const studentSnap = await getDocs(studentQuery);
                const studentCount = studentSnap.size;

                // Get Showcase Count (Projects)
                const showcaseSnap = await getDocs(collection(db, "showcase"));
                const showcaseCount = showcaseSnap.size;

                const newStats: StatsData = {
                    mentors: `${trainerCount}+`,
                    graduates: `${studentCount}+`,
                    placement: "95%",
                    projects: showcaseCount > 1000 ? `${(showcaseCount / 1000).toFixed(1)}k` : `${showcaseCount}`
                };

                setStats(newStats);

                // Cache the result
                setInCache(CACHE_KEY, newStats, {
                    ttl: CACHE_TTL.STATS,
                    useLocalStorage: true
                });
            } catch (error) {
                console.error("Error fetching about stats:", error);
            }
        };

        fetchStats();
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax Effects
    const yImage = useTransform(smoothProgress, [0, 1], [100, -100]); // Moves opposite to scroll
    const yText = useTransform(smoothProgress, [0, 1], [50, -50]);
    const rotate = useTransform(smoothProgress, [0, 1], [0, 45]);
    const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

    return (
        <section ref={containerRef} className="py-32 bg-surface relative overflow-hidden transition-colors duration-300" suppressHydrationWarning>
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center" suppressHydrationWarning>

                {/* Image Column - Slower Parallax */}
                <motion.div style={{ y: yImage, scale }}>
                    <ScrollReveal direction="left" rotateX={20} rotateY={20} distance={50}>
                        <div className="relative aspect-square rounded-3xl overflow-hidden border border-border group bg-background shadow-2xl" suppressHydrationWarning>
                            <img
                                src="/images/about-render.png"
                                alt="Industry Standard 3D Render"
                                className="w-full h-full object-cover grayscale-[0.5] brightness-75 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-700 scale-110 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" suppressHydrationWarning>
                                <motion.div style={{ rotate }}>
                                    <h2 className="font-robot text-8xl font-black text-white/10 tracking-tighter uppercase select-none">CREATIVE</h2>
                                </motion.div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent opacity-80 pointer-events-none" suppressHydrationWarning />
                        </div>
                    </ScrollReveal>
                </motion.div>

                {/* Text Column - Faster Parallax */}
                <motion.div style={{ y: yText }}>
                    <ScrollReveal direction="right" distance={50}>
                        <div suppressHydrationWarning>
                            <span className="font-handwritten text-4xl text-primary block mb-6">
                                Where Art Meets Code
                            </span>
                            <p className="font-inter text-xl text-foreground/70 leading-relaxed mb-10">
                                Artvince Academy is more than just an education platform. We are a creative incubator designed for the next generation of game developers and 3D artists. Our curriculum is built by industry veterans who have worked on AAA titles, ensuring you learn the exact skills used in professional studios worldwide.
                            </p>

                            <div className="grid grid-cols-2 gap-8" suppressHydrationWarning>
                                {[
                                    { label: "Mentors", value: stats.mentors },
                                    { label: "Operatives", value: stats.graduates },
                                    { label: "Placement", value: stats.placement },
                                    { label: "Showcase", value: stats.projects },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10, borderColor: "rgba(var(--primary-rgb), 1)" }}
                                        className="border-l-2 border-primary/30 pl-6 py-2 transition-colors cursor-default"
                                        suppressHydrationWarning
                                    >
                                        <span className="font-robot text-3xl font-bold block text-foreground">{stat.value}</span>
                                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">{stat.label}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </motion.div>
            </div>
        </section>
    );
}
