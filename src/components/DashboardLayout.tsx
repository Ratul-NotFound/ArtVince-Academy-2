"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) {
    const { user, loading, isAdmin, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
        if (!loading && adminOnly && !isAdmin) {
            router.push("/dashboard");
        }
    }, [user, loading, isAdmin, adminOnly, router]);

    if (loading) return <div className="h-screen flex items-center justify-center font-robot uppercase tracking-widest">Loading Artvince...</div>;

    return (
        <div className="flex min-h-screen bg-background pt-24 text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border p-6 space-y-8 hidden md:block transition-colors duration-300">
                <div className="space-y-2">
                    <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 px-4">Menu</span>
                    <nav className="space-y-1">
                        {[
                            { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
                            { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
                            ...(isAdmin ? [
                                { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
                                { name: "Manage Users", href: "/admin/users", icon: Users },
                            ] : []),
                            { name: "Settings", href: "/dashboard/settings", icon: Settings },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface font-robot text-sm uppercase tracking-wider transition-all"
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 font-robot text-sm uppercase tracking-wider w-full transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
