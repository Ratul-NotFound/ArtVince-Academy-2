"use client";

import { motion } from "framer-motion";
import CoursesGrid from "@/components/CoursesGrid";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function CoursesPage() {
    return (
        <div className="bg-background min-h-screen text-foreground transition-colors duration-300">
            <Navbar />
            <div className="container mx-auto px-6 mb-20 pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="font-handwritten text-4xl text-primary block mb-4">Master Your Craft</span>
                    <h1 className="font-robot text-5xl md:text-8xl font-bold uppercase tracking-tighter text-foreground">
                        3D Art <span className="text-outline-theme text-transparent">Catalogue</span>
                    </h1>
                </motion.div>
            </div>

            <CoursesGrid />

            <section className="py-20 bg-surface transition-colors duration-300">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="font-robot text-2xl font-bold uppercase mb-8 text-foreground">Can't decide where to start?</h3>
                    <button className="bg-primary text-white px-10 py-4 rounded-lg font-robot font-bold uppercase tracking-widest hover:scale-105 transition-all">
                        Talk to a Mentor
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
