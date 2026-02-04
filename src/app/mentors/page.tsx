"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { UserProfile } from "@/types";
import { Github, Twitter, Linkedin, Loader2, User } from "lucide-react";
import Footer from "@/components/Footer";

export default function MentorsPage() {
    const [mentors, setMentors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "trainer"));
                const querySnapshot = await getDocs(q);
                const trainers = querySnapshot.docs.map(doc => doc.data() as UserProfile);
                setMentors(trainers);
            } catch (error) {
                console.error("Error fetching mentors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    return (
        <div className="bg-background min-h-screen pt-32 text-foreground transition-colors duration-300">
            <div className="container mx-auto px-6 mb-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="font-handwritten text-4xl text-primary block mb-4">Master Mentors</span>
                    <h1 className="font-robot text-6xl md:text-9xl font-bold uppercase tracking-tighter text-foreground">
                        Industry <span className="text-outline-theme text-transparent">Pioneers</span>
                    </h1>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 mb-32">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {mentors.map((mentor, i) => (
                            <motion.div
                                key={mentor.uid}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative h-[600px] rounded-3xl overflow-hidden border border-border bg-surface"
                            >
                                {mentor.photoURL ? (
                                    <Image
                                        src={mentor.photoURL}
                                        alt={mentor.displayName || "Mentor"}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-foreground/5 text-foreground/10">
                                        <User size={120} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-8 translate-y-24 group-hover:translate-y-0 transition-transform duration-500 bg-background/60 backdrop-blur-md">
                                    <span className="font-robot text-[10px] uppercase tracking-widest text-primary mb-2 block">{mentor.studio || "Academy Instructor"}</span>
                                    <h3 className="font-robot text-2xl font-bold uppercase mb-4 text-foreground">{mentor.displayName || "Agent"}</h3>
                                    <p className="font-inter text-sm text-foreground/50 mb-6 line-clamp-3">{mentor.bio || "This master mentor has not yet synchronized their personal dossier."}</p>
                                    <div className="flex gap-4">
                                        <Linkedin size={18} className="text-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                                        <Twitter size={18} className="text-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                                        <Github size={18} className="text-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {!loading && mentors.length === 0 && (
                            <div className="col-span-full py-20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                                <p className="font-inter text-sm text-foreground/30 italic">Operative registry currently empty. Initializing new cycles...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
