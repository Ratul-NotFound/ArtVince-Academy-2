"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-robot text-[10px] uppercase tracking-[0.3em] text-primary animate-pulse">Initializing Interface</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden pt-20">
            {/* Sidebar (Desktop) */}
            <div className="hidden md:block h-full">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-72 z-[70] md:hidden"
                        >
                            <div className="h-full pt-20">
                                <Sidebar />
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-24 right-4 p-2 rounded-lg bg-foreground/10 text-foreground hover:bg-primary hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header / Mobile Bar */}
                <header className="h-16 sm:h-20 border-b border-border flex items-center justify-between px-4 sm:px-8 bg-background/50 backdrop-blur-md z-30 shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button - larger touch target */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-3 -ml-1 hover:bg-primary/10 active:bg-primary/20 rounded-xl text-foreground border border-border/50 transition-all"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="font-robot text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-foreground/30 font-bold hidden sm:block">
                            Artvince Management System
                        </h2>
                    </div>
                </header>

                {/* Sub-content Scrollable Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 relative">
                    {/* Background Subtle Gradient */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
