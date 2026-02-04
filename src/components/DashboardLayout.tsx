"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Header / Mobile Bar */}
                <header className="h-20 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-30 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 hover:bg-foreground/5 rounded-lg text-foreground/50">
                            <Menu size={20} />
                        </button>
                        <h2 className="font-robot text-xs uppercase tracking-[0.3em] text-foreground/30 font-bold hidden sm:block">
                            Artvince Management System
                        </h2>
                    </div>
                </header>

                {/* Sub-content Scrollable Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
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
