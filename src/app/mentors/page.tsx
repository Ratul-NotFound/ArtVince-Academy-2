"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";
import Footer from "@/components/Footer";

const mentors = [
    {
        name: "Alex 'Vince' Rivers",
        role: "Lead Game Architect",
        specialty: "Unreal Engine 5 & C++",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
        bio: "Ex-Ubisoft and CD Projekt Red architect with 15+ years in AAA development."
    },
    {
        name: "Sarah 'Maya' Chen",
        role: "Senior Character Artist",
        specialty: "ZBrush & Substance",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
        bio: "Specializing in hyper-realistic anatomy and stylized character pipelines."
    },
    {
        name: "Marcus Thorne",
        role: "Weapon Designer",
        specialty: "Hard Surface Modeling",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
        bio: "Leading the weapon art team at major gaming studios for over a decade."
    },
    {
        name: "Elena Rodriguez",
        role: "Creative Director",
        specialty: "Visual Storytelling",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
        bio: "Focusing on the intersection of narrative design and immersive 3D art."
    }
];

export default function MentorsPage() {
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

            <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                {mentors.map((mentor, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative h-[600px] rounded-3xl overflow-hidden border border-border bg-surface"
                    >
                        <Image
                            src={mentor.image}
                            alt={mentor.name}
                            fill
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-24 group-hover:translate-y-0 transition-transform duration-500 bg-background/60 backdrop-blur-md">
                            <span className="font-robot text-[10px] uppercase tracking-widest text-primary mb-2 block">{mentor.role}</span>
                            <h3 className="font-robot text-2xl font-bold uppercase mb-4 text-foreground">{mentor.name}</h3>
                            <p className="font-inter text-sm text-foreground/50 mb-6">{mentor.bio}</p>
                            <div className="flex gap-4">
                                <Linkedin size={18} className="text-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                                <Twitter size={18} className="text-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                                <Github size={18} className="text-foreground/40 hover:text-primary cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Footer />
        </div>
    );
}
