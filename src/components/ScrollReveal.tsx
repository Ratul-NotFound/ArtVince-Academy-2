"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    distance?: number;
    direction?: "up" | "down" | "left" | "right";
    perspective?: number;
    rotateX?: number;
    rotateY?: number;
    scale?: number;
    blur?: boolean;
}

export default function ScrollReveal({
    children,
    className = "",
    distance = 100,
    direction = "up",
    perspective = 1200,
    rotateX = 15,
    rotateY = 0,
    scale = 0.95,
    blur = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const springConfig = { stiffness: 80, damping: 20, restDelta: 0.001 };
    const smoothProgress = useSpring(scrollYProgress, springConfig);

    const xOffset = direction === "left" ? -distance : direction === "right" ? distance : 0;
    const yOffset = direction === "up" ? distance : direction === "down" ? -distance : 0;

    const opacity = useTransform(smoothProgress, [0, 0.1], [0, 1]);
    const x = useTransform(smoothProgress, [0, 0.3], [xOffset, 0]);
    const y = useTransform(smoothProgress, [0, 0.3], [yOffset, 0]);
    const currentScale = useTransform(smoothProgress, [0, 0.3], [scale, 1]);
    const currentRotateX = useTransform(smoothProgress, [0, 0.3], [rotateX, 0]);
    const currentRotateY = useTransform(smoothProgress, [0, 0.3], [rotateY, 0]);
    const blurValue = useTransform(smoothProgress, [0, 0.1], [blur ? 10 : 0, 0]);

    return (
        <div
            ref={ref}
            className={`w-full ${className}`}
            style={{
                perspective: `${perspective}px`,
                transformStyle: "preserve-3d"
            }}
        >
            <motion.div
                style={{
                    opacity,
                    x,
                    y,
                    scale: currentScale,
                    rotateX: currentRotateX,
                    rotateY: currentRotateY,
                    filter: blur ? `blur(${blurValue}px)` : "none",
                    transformStyle: "preserve-3d"
                }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </div>
    );
}
