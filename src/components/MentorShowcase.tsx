"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import TiltCard from "./TiltCard";
import { Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

const mentors = [
    {
        name: "Marcus Thorne",
        role: "Head of Character Art",
        studio: "Ex-Ubisoft / Sony",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
        tags: ["Character Modeling", "Anatomy", "Texturing"],
    },
    {
        name: "Elena Vance",
        role: "Technical Art Director",
        studio: "Ex-Epic Games",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
        tags: ["Unreal Engine", "Shaders", "Blueprints"],
    },
    {
        name: "David Chen",
        role: "Lead Game Designer",
        studio: "Ex-Blizzard",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
        tags: ["Mechanics", "Economy", "Narrative"],
    },
    {
        name: "Sarah Miller",
        role: "Senior Animator",
        studio: "Ex-Naughty Dog",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
        tags: ["Mocap", "Keyframes", "Rigging"],
    },
];

export default function MentorShowcase() {
    return (
        <section className="py-32 bg-surface">
            <div className="container mx-auto px-6">
                <ScrollReveal direction="up" distance={50}>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div>
                            <span className="font-handwritten text-3xl text-primary block mb-4">The Masters</span>
                            <h2 className="font-robot text-5xl md:text-8xl font-black uppercase tracking-tighter text-foreground leading-none">
                                INDUSTRY <br /> <span className="text-outline-theme text-transparent">LEGENDS</span>
                            </h2>
                        </div>
                        <p className="font-inter text-foreground/60 max-w-sm text-lg leading-relaxed border-l-2 border-primary/20 pl-8">
                            Learn directly from veterans who have built the games you love. No fluff, just real-world studio expertise.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {mentors.map((mentor, index) => (
                        <ScrollReveal key={index} direction="up" distance={30} rotateX={20} scale={0.9}>
                            <TiltCard className="group relative bg-background rounded-[32px] overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 shadow-2xl">
                                {/* Image Container */}
                                <div className="relative h-[300px] w-full overflow-hidden">
                                    <Image
                                        src={mentor.image}
                                        alt={mentor.name}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />

                                    {/* Studio Batch */}
                                    <div className="absolute top-6 right-6 bg-primary/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
                                        <span className="font-robot text-[8px] uppercase tracking-widest text-white font-bold">{mentor.studio}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h3 className="font-robot text-2xl font-black uppercase text-foreground mb-1">
                                        {mentor.name}
                                    </h3>
                                    <span className="font-handwritten text-xl text-primary block mb-6">
                                        {mentor.role}
                                    </span>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {mentor.tags.map((tag, i) => (
                                            <span key={i} className="font-robot text-[8px] uppercase tracking-widest bg-foreground/5 text-foreground/50 px-3 py-1 rounded-md border border-white/5 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

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
                </div>
            </div>
        </section>
    );
}
