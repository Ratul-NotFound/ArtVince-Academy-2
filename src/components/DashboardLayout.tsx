"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X, LayoutDashboard, BookOpen, MessageSquare, MoreHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

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

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        {
            name: userRole === 'admin' ? "Manifest" : (userRole === 'trainer' ? "Sectors" : "Courses"),
            href: userRole === 'admin' ? "/admin/courses" : (userRole === 'trainer' ? "/trainer/courses" : "/dashboard/courses"),
            icon: BookOpen
        },
        {
            name: "Support",
            href: (userRole === 'admin' || userRole === 'trainer' || userRole === 'moderator') ? "/admin/messages" : "/dashboard/messages",
            icon: MessageSquare
        },
    ];

    return (
        <div className="flex h-screen bg-background overflow-hidden pt-20 pb-20 md:pb-0" suppressHydrationWarning>
            {/* Sidebar (Desktop) */}
            <div className="hidden md:block h-full border-r border-border/50">
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-80 z-[95] md:hidden bg-background shadow-2xl border-r border-primary/20"
                        >
                            <div className="h-full pt-8 relative">
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-xl bg-foreground/5 text-foreground/50 hover:bg-primary/10 hover:text-primary transition-all z-10"
                                >
                                    <X size={20} />
                                </button>
                                <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative" suppressHydrationWarning>
                {/* Top Header - Kept for branding/branding/context */}
                <header className="h-16 sm:h-20 border-b border-border flex items-center justify-between px-4 sm:px-8 bg-background/50 backdrop-blur-md z-30 shrink-0" suppressHydrationWarning>
                    <div className="flex items-center gap-4" suppressHydrationWarning>
                        <h2 className="font-robot text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-foreground/30 font-bold">
                            Artvince Management System <span className="text-primary/40">_Terminal</span>
                        </h2>
                    </div>
                </header>

                {/* Sub-content Scrollable Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-6 md:p-10 relative" suppressHydrationWarning>
                    {/* Background Subtle Gradient */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative max-w-7xl mx-auto p-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 glass-card rounded-2xl border border-white/10 shadow-2xl z-[100] flex items-center justify-around px-2 overflow-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-foreground/40 hover:text-foreground"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : ""} />
                            <span className="font-robot text-[8px] uppercase tracking-widest font-bold">
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]"
                                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                />
                            )}
                        </Link>
                    );
                })}

                {/* More Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex flex-col items-center justify-center gap-1 w-full h-full text-foreground/40 hover:text-primary transition-all duration-300"
                >
                    <MoreHorizontal size={20} />
                    <span className="font-robot text-[8px] uppercase tracking-widest font-bold">
                        More
                    </span>
                </button>
            </nav>
        </div>
    );
}
