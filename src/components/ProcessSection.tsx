"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";

const phases = [
    {
        id: "01",
        title: "The Vision",
        subtitle: "Aesthetic Foundations",
        description: "Master the fundamentals of art theory, color composition, and artistic vision. Before a single polygon is placed, the vision must be clear.",
        color: "from-blue-500/20 to-transparent",
    },
    {
        id: "02",
        title: "The Logic",
        subtitle: "Technical Execution",
        description: "Translate art into code. Learn the mathematics of game design, optimization, and the technical constraints of modern engines.",
        color: "from-purple-500/20 to-transparent",
    },
    {
        id: "03",
        title: "The Soul",
        subtitle: "Movement & Life",
        description: "Breathe life into static assets. Advanced animation, rigging, and particle systems that create an immersive player experience.",
        color: "from-emerald-500/20 to-transparent",
    },
    {
        id: "04",
        title: "Production",
        subtitle: "Industry Ready",
        description: "Finalize your projects through a real-world production pipeline. Packaging, debugging, and portfolio presentation for major studios.",
        color: "from-primary/20 to-transparent",
    },
];

export default function ProcessSection() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={containerRef} className="py-24 bg-background relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20">
                    <div className="sticky top-24 h-fit">
                        <ScrollReveal direction="left" distance={50}>
                            <span className="font-handwritten text-4xl text-primary block mb-6">Our Methodology</span>
                            <h2 className="font-robot text-6xl md:text-8xl font-black uppercase tracking-tighter text-foreground mb-8 leading-none">
                                THE PATH TO <br /> <span className="text-outline-theme text-transparent">MASTERY</span>
                            </h2>
                            <p className="font-inter text-xl text-foreground/50 max-w-lg mb-12 leading-relaxed">
                                We don't just teach tools. We build creators. Our structured 4-phase journey ensures you graduate with industry-level technical depth and artistic maturity.
                            </p>

                            <div className="flex items-center gap-6">
                                <div className="relative w-12 h-1 bg-primary/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-primary"
                                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                                    />
                                </div>
                                <span className="font-robot text-[10px] uppercase tracking-widest text-primary font-bold">Progress Tracking Live</span>
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className="relative pl-12 md:pl-20">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground/5 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-primary/50 to-primary origin-top"
                                style={{ scaleY }}
                            />
                        </div>

                        <div className="space-y-20">
                            {phases.map((phase, index) => (
                                <ScrollReveal
                                    key={index}
                                    direction="up"
                                    distance={80}
                                    rotateX={15}
                                    className="relative"
                                >
                                    <div className={`absolute -inset-8 bg-gradient-to-br ${phase.color} rounded-[40px] blur-2xl opacity-50`} />

                                    {/* Watermark Number */}
                                    <div className="absolute -top-10 -right-4 font-robot text-[12rem] font-black text-foreground/[0.03] leading-none select-none pointer-events-none">
                                        {phase.id}
                                    </div>

                                    <div className="relative glass border border-white/5 p-10 rounded-[40px] hover:border-primary/30 transition-all duration-500 group">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-robot text-3xl font-black text-white transform -rotate-12 group-hover:rotate-0 transition-transform">
                                                {phase.id}
                                            </div>
                                            <span className="font-robot text-[10px] uppercase tracking-[0.4em] text-foreground/30 font-bold">
                                                PHASE {phase.id}
                                            </span>
                                        </div>

                                        <h3 className="font-robot text-4xl font-black uppercase text-foreground mb-2 group-hover:text-primary transition-colors text-glow">
                                            {phase.title}
                                        </h3>
                                        <h4 className="font-handwritten text-2xl text-primary mb-4">
                                            {phase.subtitle}
                                        </h4>
                                        <p className="font-inter text-lg text-foreground/60 leading-relaxed group-hover:text-foreground/80 transition-colors">
                                            {phase.description}
                                        </p>

                                        {/* Connector Dot */}
                                        <div className="absolute left-[-52px] md:left-[-84px] top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-4 border-primary/20 rounded-full z-10 group-hover:border-primary group-hover:scale-125 transition-all" />
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
