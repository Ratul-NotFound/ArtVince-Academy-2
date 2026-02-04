"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import Image from "next/image";

// Hero background images - curated for 3D art & gaming industry
const heroImages = [
    "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?q=80&w=2070&auto=format&fit=crop", // Gaming atmosphere
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop", // VR headset gaming
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2065&auto=format&fit=crop", // Esports gaming
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2074&auto=format&fit=crop", // Gaming controller
    "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=2070&auto=format&fit=crop", // Gaming setup RGB
];

export default function Hero() {
    const containerRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Mouse Parallax Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const headlineX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]));
    const headlineY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]));
    const bgShiftX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-50, 50]));
    const bgShiftY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-30, 30]));

    // Auto-cycle images every 5 seconds
    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) - 0.5;
            const y = (e.clientY / innerHeight) - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Scroll-based transforms
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

    // Combined interactions
    const combinedBgY = useTransform([scrollYProgress, mouseY], ([s, m]) => {
        return `calc(${(s as number) * 30}% + ${(m as number) * 30}px)`;
    });

    const combinedContentY = useTransform([scrollYProgress, mouseY], ([s, m]) => {
        return ((s as number) * -100) + ((m as number) * 20);
    });

    // Image transition variants
    const imageVariants = {
        enter: {
            opacity: 0,
            scale: 1.2,
            filter: "blur(20px)",
        },
        center: {
            opacity: 0.4,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                duration: 1.5,
                ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            filter: "blur(10px)",
            transition: {
                duration: 1,
                ease: "easeInOut" as const,
            },
        },
    };

    return (
        <section ref={containerRef} className="relative h-[120vh] flex items-center justify-center overflow-hidden" suppressHydrationWarning>
            {/* Background Wrapper */}
            <motion.div
                style={{ y: combinedBgY, scale: bgScale, x: bgShiftX }}
                className="absolute inset-[-5%] z-0"
                suppressHydrationWarning
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-background to-background opacity-70" suppressHydrationWarning />

                {/* Animated Image Slideshow */}
                <div className="absolute inset-0 overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentImageIndex}
                            variants={imageVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0"
                        >
                            <Image
                                src={heroImages[currentImageIndex]}
                                alt="Hero Background"
                                fill
                                className="object-cover object-center grayscale mix-blend-overlay"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Image Progress Indicators */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-1 rounded-full transition-all duration-500 ${index === currentImageIndex
                                ? "w-8 bg-primary"
                                : "w-2 bg-white/20 hover:bg-white/40"
                                }`}
                        />
                    ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" suppressHydrationWarning />
            </motion.div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center" suppressHydrationWarning>
                <ScrollReveal rotateX={30} distance={150} scale={0.7} blur={true}>
                    <motion.div
                        style={{ opacity: contentOpacity, scale: contentScale, y: combinedContentY, x: headlineX }}
                        className="transform-gpu"
                    >
                        <span className="font-handwritten text-5xl text-primary mb-6 block animate-pulse drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
                            Master the Art of Play
                        </span>
                        <h1 className="font-robot text-6xl md:text-9xl font-bold uppercase tracking-tighter leading-none mb-6">
                            <span className="block overflow-hidden">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="block"
                                >
                                    ARTVINCE
                                </motion.span>
                            </span>
                            <span className="block overflow-hidden text-outline-theme text-transparent">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className="block"
                                >
                                    ACADEMY
                                </motion.span>
                            </span>
                        </h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary text-white px-12 py-5 rounded-xl font-robot font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all group overflow-hidden relative shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)]"
                            >
                                <span className="relative z-10">Start Learning</span>
                                <motion.div
                                    className="absolute inset-0 bg-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500"
                                />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, borderColor: "rgba(var(--primary-rgb),1)" }}
                                whileTap={{ scale: 0.95 }}
                                className="border border-foreground/20 glass px-12 py-5 rounded-xl font-robot font-bold uppercase tracking-widest hover:text-primary transition-all backdrop-blur-md"
                            >
                                View Courses
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </ScrollReveal>
            </div>

            {/* Floating Element */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-20 left-10 md:left-20 border border-white/10 glass p-4 rounded-xl hidden md:block"
            >
                <div className="flex flex-col">
                    <span className="font-robot text-[10px] uppercase tracking-widest text-white/50 block mb-2">Next Batch</span>
                    <span className="font-robot text-xl font-bold text-foreground">FEB 2026</span>
                </div>
            </motion.div>
        </section>
    );
}
