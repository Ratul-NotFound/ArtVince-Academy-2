"use client";

import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";

export default function AboutSection() {
    return (
        <section className="py-32 bg-surface relative overflow-hidden transition-colors duration-300" suppressHydrationWarning>
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center" suppressHydrationWarning>
                <ScrollReveal direction="left" rotateX={20} rotateY={20} distance={50}>
                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-border group" suppressHydrationWarning>
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                        >
                            <source src="https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-futuristic-city-at-night-42111-large.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 flex items-center justify-center" suppressHydrationWarning>
                            <h2 className="font-robot text-8xl font-black text-white/5 tracking-tighter uppercase">CREATIVE</h2>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent opacity-60" suppressHydrationWarning />
                    </div>
                </ScrollReveal>

                <ScrollReveal direction="right" distance={50}>
                    <div suppressHydrationWarning>
                        <span className="font-handwritten text-4xl text-primary block mb-6">
                            Where Art Meets Code
                        </span>
                        <p className="font-inter text-xl text-foreground/70 leading-relaxed mb-10">
                            Artvince Academy is more than just an education platform. We are a creative incubator designed for the next generation of game developers and 3D artists. Our curriculum is built by industry veterans who have worked on AAA titles, ensuring you learn the exact skills used in professional studios worldwide.
                        </p>

                        <div className="grid grid-cols-2 gap-8" suppressHydrationWarning>
                            {[
                                { label: "Mentors", value: "20+" },
                                { label: "Graduates", value: "500+" },
                                { label: "Placement", value: "95%" },
                                { label: "Projects", value: "1.2k" },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="border-l-2 border-primary/30 pl-6 py-2 hover:border-primary transition-colors"
                                    suppressHydrationWarning
                                >
                                    <span className="font-robot text-3xl font-bold block text-foreground">{stat.value}</span>
                                    <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/40">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
