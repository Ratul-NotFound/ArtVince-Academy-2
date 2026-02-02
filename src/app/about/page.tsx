"use client";

import { motion } from "framer-motion";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen pt-32 text-foreground transition-colors duration-300">
            <div className="container mx-auto px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <span className="font-handwritten text-4xl text-primary block mb-6">Our Legacy</span>
                    <h1 className="font-robot text-6xl md:text-9xl font-bold uppercase tracking-tighter mb-10 text-foreground">
                        The Creative <br /> <span className="text-outline-theme text-transparent">Collective</span>
                    </h1>
                </motion.div>
            </div>

            <div className="mb-32">
                <AboutSection />
            </div>

            <section className="py-32 bg-surface border-y border-border transition-colors duration-300">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-20">
                        <div>
                            <h3 className="font-robot text-sm text-primary uppercase tracking-[0.3em] mb-8">Mission</h3>
                            <p className="font-inter text-foreground/50 leading-relaxed">
                                To bridge the gap between imagination and technical mastery, preparing students for the bleeding edge of game and 3D industries.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-robot text-sm text-primary uppercase tracking-[0.3em] mb-8">Vision</h3>
                            <p className="font-inter text-foreground/50 leading-relaxed">
                                A world where every creator has the tools to build their own universes, backed by a community of professional pioneers.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-robot text-sm text-primary uppercase tracking-[0.3em] mb-8">Values</h3>
                            <p className="font-inter text-foreground/50 leading-relaxed">
                                Cinematic quality, technical precision, and unapologetic creativity. We build what's next.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
