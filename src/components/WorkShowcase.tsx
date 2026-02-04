"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import TiltCard from "./TiltCard";
import { Play } from "lucide-react";

const works = [
    {
        title: "Cybernetic Samurai",
        artist: "Student Project - Leo K.",
        image: "https://images.unsplash.com/photo-1635273051937-200744733306?q=80&w=2070&auto=format&fit=crop",
        category: "3D Character Art",
        span: "md:col-span-2 md:row-span-2",
    },
    {
        title: "The Last Outpost",
        artist: "Mentor Demo - Sarah J.",
        image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1954&auto=format&fit=crop",
        category: "Environment Design",
        span: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Viking Axe",
        artist: "Student Project - Mark R.",
        image: "https://images.unsplash.com/photo-1590333744342-6e2182ce6a72?q=80&w=2070&auto=format&fit=crop",
        category: "Hard Surface Modeling",
        span: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Neon City Drive",
        artist: "Technical Art - Alex B.",
        image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop",
        category: "Shaders & VFX",
        span: "md:col-span-2 md:row-span-1",
    },
];

export default function WorkShowcase() {
    return (
        <section className="py-32 bg-surface overflow-hidden">
            <div className="container mx-auto px-6" suppressHydrationWarning>
                <ScrollReveal direction="up" distance={50}>
                    <div className="text-center mb-20" suppressHydrationWarning>
                        <span className="font-handwritten text-3xl text-primary block mb-4">Excellence in Motion</span>
                        <h2 className="font-robot text-5xl md:text-8xl font-black uppercase tracking-tighter text-foreground mb-6">
                            STUDENT <span className="text-outline-theme text-transparent">SHOWCASE</span>
                        </h2>
                        <p className="font-inter text-foreground/60 max-w-2xl mx-auto text-lg leading-relaxed">
                            A curated selection of the most exceptional work from our academy. From AAA-quality characters to breathtaking environments.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {works.map((work, index) => (
                        <ScrollReveal
                            key={index}
                            direction="up"
                            distance={30}
                            className={work.span}
                            rotateX={10}
                        >
                            <TiltCard className="group relative w-full h-full overflow-hidden rounded-3xl cursor-pointer">
                                <Image
                                    src={work.image}
                                    alt={work.title}
                                    fill
                                    className="object-cover transition-all duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="w-16 h-16 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/50 text-primary scale-50 group-hover:scale-100 transition-transform duration-500">
                                        <Play fill="currentColor" size={24} />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="font-robot text-[10px] uppercase tracking-[0.3em] text-primary/80 mb-2 block font-bold">
                                        {work.category}
                                    </span>
                                    <h3 className="font-robot text-3xl font-black uppercase text-white mb-2">
                                        {work.title}
                                    </h3>
                                    <p className="font-inter text-sm text-white/60">
                                        {work.artist}
                                    </p>
                                </div>
                            </TiltCard>
                        </ScrollReveal>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center"
                >
                    <button className="font-robot uppercase tracking-widest text-sm border-b-2 border-primary pb-2 hover:text-primary transition-all font-bold">
                        Browse Full Gallery
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
