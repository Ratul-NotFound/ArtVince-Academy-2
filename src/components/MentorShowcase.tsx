"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import TiltCard from "./TiltCard";
import { Github, Twitter, Linkedin, ExternalLink, Loader2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { UserProfile } from "@/types";
import { getFromCache, setInCache, clearCache, CACHE_TTL } from "@/lib/cache";

export default function MentorShowcase() {
    const [mentors, setMentors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            const CACHE_KEY = "mentors_showcase";

            // Clear any stale cache first (temporary fix)
            clearCache(CACHE_KEY);

            try {
                console.log("Fetching trainers from Firebase...");
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "trainer"),
                    limit(4)
                );
                const querySnapshot = await getDocs(q);
                console.log("Firebase query returned:", querySnapshot.size, "trainers");

                const trainers = querySnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                } as UserProfile));

                console.log("Trainers data:", trainers);
                setMentors(trainers);

                // Only cache if we have results
                if (trainers.length > 0) {
                    setInCache(CACHE_KEY, trainers, {
                        ttl: CACHE_TTL.TRAINERS,
                        useLocalStorage: true
                    });
                }
            } catch (error) {
                console.error("Error fetching mentors for showcase:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    return (
        <section className="py-16 sm:py-24 md:py-32 bg-surface">
            <div className="container mx-auto px-4 sm:px-6" suppressHydrationWarning>
                <ScrollReveal direction="up" distance={50}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 md:mb-20 gap-6 sm:gap-8" suppressHydrationWarning>
                        <div>
                            <span className="font-handwritten text-xl sm:text-2xl md:text-3xl text-primary block mb-2 sm:mb-4">The Masters</span>
                            <h2 className="font-robot text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-foreground leading-none">
                                INDUSTRY <br className="hidden sm:block" /> <span className="text-outline-theme text-transparent">LEGENDS</span>
                            </h2>
                        </div>
                        <p className="font-inter text-foreground/60 max-w-sm text-sm sm:text-base md:text-lg leading-relaxed border-l-2 border-primary/20 pl-4 sm:pl-8">
                            Learn directly from veterans who have built the games you love. No fluff, just real-world studio expertise.
                        </p>
                    </div>
                </ScrollReveal>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {mentors.map((mentor, index) => (
                            <ScrollReveal key={mentor.uid} direction="up" distance={30} rotateX={20} scale={0.9}>
                                <TiltCard className="group relative bg-background rounded-[24px] sm:rounded-[32px] overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-2xl">
                                    {/* Image Container */}
                                    <div className="relative h-[250px] sm:h-[280px] md:h-[300px] w-full overflow-hidden">
                                        {mentor.photoURL ? (
                                            <Image
                                                src={mentor.photoURL}
                                                alt={mentor.displayName || "Mentor"}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/10">
                                                <User size={80} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />

                                        {/* Studio Batch */}
                                        <div className="absolute top-6 right-6 bg-primary/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
                                            <span className="font-robot text-[8px] uppercase tracking-widest text-white font-bold">
                                                {mentor.studio || "ACADEMY INSTRUCTOR"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <h3 className="font-robot text-2xl font-black uppercase text-foreground mb-1 truncate">
                                            {mentor.displayName || "GUEST AGENT"}
                                        </h3>
                                        <span className="font-handwritten text-xl text-primary block mb-6 truncate">
                                            Instructor
                                        </span>

                                        {/* Bio / Tags placeholder */}
                                        <p className="font-inter text-[10px] text-foreground/40 line-clamp-2 mb-8 uppercase tracking-widest leading-relaxed">
                                            {mentor.bio || "Specialized in advanced 3D production pipelines and creative direction."}
                                        </p>

                                        {/* Social Links */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                            <button className="text-foreground/30 hover:text-primary transition-colors"><Twitter size={18} /></button>
                                            <button className="text-foreground/30 hover:text-primary transition-colors"><Linkedin size={18} /></button>
                                            <button className="text-foreground/30 hover:text-primary transition-colors ml-auto flex items-center gap-2 font-robot text-[8px] uppercase tracking-widest font-bold">
                                                Portfolio <ExternalLink size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </TiltCard>
                            </ScrollReveal>
                        ))}

                        {mentors.length === 0 && (
                            <div className="col-span-full py-20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
                                <p className="font-inter text-sm text-foreground/30 italic uppercase tracking-widest">Awaiting instructor deployment signal...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
