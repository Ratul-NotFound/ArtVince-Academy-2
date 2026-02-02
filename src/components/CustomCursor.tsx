"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [clicked, setClicked] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        const handleMouseDown = () => setClicked(true);
        const handleMouseUp = () => setClicked(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.closest("a") ||
                target.closest("button")
            ) {
                setHovered(true);
            } else {
                setHovered(false);
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* Primary Dot (Instant) */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full z-[10000] pointer-events-none mix-blend-difference hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    left: 12, // Offset to center on 32px frame, though we moved it in moveCursor
                }}
            />

            {/* Trailing Geometric Aura */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 border-2 border-primary/50 z-[9999] pointer-events-none hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                }}
                animate={{
                    scale: hovered ? 1.8 : clicked ? 0.6 : 1,
                    rotate: hovered ? 135 : 0,
                    borderRadius: hovered ? "30%" : "50%",
                    borderWidth: hovered ? "1px" : "2px",
                    borderColor: hovered ? "rgba(var(--primary-rgb), 1)" : "rgba(var(--primary-rgb), 0.5)",
                }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    mass: 0.5
                }}
            />

            {/* Glowing Pulse on Click */}
            {clicked && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed top-0 left-0 w-10 h-10 bg-primary/20 rounded-full z-[9998] pointer-events-none hidden md:block"
                    style={{
                        x: cursorXSpring,
                        y: cursorYSpring,
                    }}
                />
            )}
        </>
    );
}
