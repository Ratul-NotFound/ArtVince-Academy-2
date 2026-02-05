"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import TiltCard from "./TiltCard";
import { Play, ArrowRight, Layers } from "lucide-react";

const phases = [
    {
        id: "01",
        title: "Anatomy & Form",
        subtitle: "Digital Sculpting Foundations",
        description: "Master organic & hard-surface sculpting in ZBrush. Understand primary shapes & silhouettes.",
        color: "from-blue-500 to-cyan-500",
        tech: "SCULPTING",
        image: "/images/pipeline-sculpting.png", // ZBrush Character Sculpt
    },
    {
        id: "02",
        title: "Precision Mesh",
        subtitle: "Technical Retopology",
        description: "Convert high-poly sculpts into game-ready geometry. Master baking & UV mapping.",
        color: "from-purple-500 to-pink-500",
        tech: "RETOPOLOGY",
        image: "/images/pipeline-retopology.png", // Retopology Wireframe
    },
    {
        id: "03",
        title: "Material Mastery",
        subtitle: "PBR Texturing Workflow",
        description: "Bring models to life with Substance Painter. Master photorealistic metal & skin shaders.",
        color: "from-emerald-500 to-teal-500",
        tech: "PBR TEXTURING",
        image: "/images/pipeline-texturing.png", // Substance Painter Armor
    },
    {
        id: "04",
        title: "Cinematic State",
        subtitle: "Lighting & Composition",
        description: "Final presentation in Unreal Engine 5. Master cinematic lighting & VFX integration.",
        color: "from-primary to-orange-500",
        tech: "RENDERING",
        image: "/images/pipeline-rendering.png", // UE5 Cinematic Render
    },
];



export default function ProcessSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 20,
        restDelta: 0.001
    });

    return (
        <section ref={sectionRef} className="relative h-[300vh] bg-background" suppressHydrationWarning>
            <div className="sticky top-0 h-screen w-full flex flex-col items-center overflow-hidden bg-grid-white/[0.02]" suppressHydrationWarning>

                {/* Ambient Glow - Centered in background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" suppressHydrationWarning />

                {/* Header Information - Flex Item */}
                <div className="pt-12 md:pt-20 pb-4 text-center z-10 w-full px-4 shrink-0 pointer-events-none" suppressHydrationWarning>
                    <span className="font-robot text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block font-bold">
                        Production Pipeline
                    </span>
                    <h2 className="font-robot text-3xl md:text-5xl font-black uppercase tracking-tight text-white/90">
                        The 3D Mastery Workflow
                    </h2>
                </div>

                {/* Card Stack Container - Flex Item (Grow) covers remaining space */}
                <div className="relative w-full flex-grow flex items-center justify-center perspective-[1000px] min-h-0" suppressHydrationWarning>

                    {/* Indicators behind cards */}
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-20 hidden md:flex" suppressHydrationWarning>
                        <div className="text-left" suppressHydrationWarning>
                            <ArrowRight className="rotate-180 mb-2 w-8 h-8 text-white" />
                            <span className="font-robot text-[10px] uppercase tracking-widest text-white display-block">Prev Phase</span>
                        </div>
                        <div className="text-right" suppressHydrationWarning>
                            <ArrowRight className="mb-2 w-8 h-8 text-white ml-auto" />
                            <span className="font-robot text-[10px] uppercase tracking-widest text-white display-block">Next Phase</span>
                        </div>
                    </div>

                    {phases.map((phase, index) => (
                        <ShufflingCard
                            key={index}
                            phase={phase}
                            index={index}
                            total={phases.length}
                            progress={smoothProgress}
                        />
                    ))}
                </div>

                {/* Progress Bar - Flex Item (Bottom) */}
                <div className="pb-12 w-full max-w-md px-6 shrink-0 z-20" suppressHydrationWarning>
                    <div className="flex justify-between text-[10px] uppercase font-robot tracking-widest text-white/40 mb-2" suppressHydrationWarning>
                        <span>Initialization</span>
                        <span>Completion</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden" suppressHydrationWarning>
                        <motion.div
                            className="h-full bg-primary"
                            style={{ scaleX: smoothProgress, transformOrigin: "left" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function ShufflingCard({ phase, index, total, progress }: { phase: any, index: number, total: number, progress: any }) {
    const step = 1 / total;
    const start = index * step;
    const end = (index + 1) * step;

    // Normalized progress for "exit phase"
    const exitProgress = useTransform(progress, [start, end], [0, 1]);

    // Alternate directions
    const xDir = index % 2 === 0 ? -1 : 1;
    const rotationDir = index % 2 === 0 ? -15 : 15;

    // Slide Out Motion
    const x = useTransform(exitProgress, [0, 1], ["0%", `${xDir * 150}%`]);
    const rotate = useTransform(exitProgress, [0, 1], [0, rotationDir]);
    const opacity = useTransform(exitProgress, [0, 0.8, 1], [1, 1, 0]);

    // Z-Index Stacking
    const zIndex = total - index;

    // Entry / Behind Logic (Next card zooming in)
    const enterProgress = useTransform(progress, [start - step, start], [0, 1]);
    const scale = useTransform(enterProgress, [0, 1], [0.95, 1]);
    const brightness = useTransform(enterProgress, [0, 1], [0.5, 1]);

    return (
        <motion.div
            style={{
                zIndex,
                x,
                rotate,
                scale,
                opacity: index === 0 ? opacity : useTransform(progress, [start - step, start], [0, 1]), // Cards appear as they approach their turn
                filter: useTransform(brightness, b => `brightness(${b})`),
            }}
            className="absolute max-h-[60vh] h-auto aspect-[3/4] md:aspect-[4/5] w-[85vw] md:w-auto md:h-[450px] will-change-transform"
        >
            <TiltCard className="w-full h-full relative group">
                <div className="relative h-full w-full bg-[#0F0F11] border border-white/10 rounded-[32px] overflow-hidden flex flex-col p-6 md:p-8 shadow-2xl transition-colors hover:border-primary/50">

                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-80"
                        style={{ backgroundImage: `url('${phase.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-[#0F0F11]/80 to-transparent" />

                    {/* Header */}
                    <div className="relative z-10 flex justify-between items-center mb-auto md:mb-10">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-primary" />
                            <span className="font-robot text-[10px] uppercase tracking-widest text-white/60 font-bold">
                                Layer {phase.id}
                            </span>
                        </div>
                        <span className="font-robot text-[9px] uppercase tracking-[0.2em] px-2 py-1 bg-white/5 rounded text-white/30">
                            {phase.tech}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 mt-8 md:mt-auto">
                        <div className={`w-16 h-1 bg-gradient-to-r ${phase.color} mb-6 rounded-full`} />

                        <h3 className="font-robot text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-[0.9]">
                            {phase.title}
                        </h3>
                        <h4 className="font-handwritten text-lg md:text-xl text-white/60 mb-6 md:mb-8">
                            {phase.subtitle}
                        </h4>

                        <div className="border-t border-white/5 pt-6 flex justify-between items-end">
                            <p className="font-inter text-xs text-white/40 leading-relaxed max-w-[200px]">
                                {phase.description}
                            </p>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-4">
                                <Play size={14} fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${phase.color} opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`} />
                </div>
            </TiltCard>
        </motion.div>
    );
}
