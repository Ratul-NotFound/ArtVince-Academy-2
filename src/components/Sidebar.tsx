"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    CreditCard,
    CheckSquare,
    Video,
    FileText,
    ClipboardList,
    Megaphone,
    Search,
    DollarSign,
    Globe
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
    const { profile, userRole, logout } = useAuth();
    const pathname = usePathname();

    const getLinks = () => {
        const commonLinks = [
            { name: "Return to Website", href: "/", icon: Globe },
            { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
            { name: "Profile Dossier", href: "/dashboard/profile", icon: Users },
        ];

        switch (userRole) {
            case "admin":
                return [
                    ...commonLinks,
                    { name: "Master Courses", href: "/admin/courses", icon: BookOpen },
                    { name: "User Manifest", href: "/admin/users", icon: Users },
                    { name: "Financial Terminal", href: "/admin/enrollments", icon: CreditCard },
                    { name: "Fiscal Intelligence", href: "/admin/revenue", icon: DollarSign },
                ];
            case "moderator":
                return [
                    ...commonLinks,
                    { name: "Verify Payments", href: "/admin/enrollments", icon: CreditCard },
                    { name: "Syllabus Audit", href: "/trainer/courses", icon: BookOpen },
                    { name: "Broadcast Terminal", href: "/trainer/announcements", icon: Megaphone },
                ];
            case "trainer":
                return [
                    ...commonLinks,
                    { name: "Assigned Sectors", href: "/trainer/courses", icon: BookOpen },
                    { name: "Attendance Log", href: "/trainer/attendance", icon: ClipboardList },
                    { name: "Broadcast Terminal", href: "/trainer/announcements", icon: Megaphone },
                ];
            case "user":
            default:
                return [
                    ...commonLinks,
                    { name: "Learning Panel", href: "/dashboard/courses", icon: BookOpen },
                    { name: "Academic Archives", href: "/dashboard/enrollments", icon: CreditCard },
                    { name: "Browse Academy", href: "/courses", icon: Search },
                ];
        }
    };

    const links = getLinks();

    return (
        <aside className="w-64 border-r border-border p-6 flex flex-col h-full bg-background/50 backdrop-blur-xl">
            {/* Profile Brief */}
            <div className="mb-10 px-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center font-robot font-bold text-primary mb-4 text-xl" suppressHydrationWarning>
                    {profile?.displayName?.[0] || profile?.role?.[0].toUpperCase() || "A"}
                </div>
                <p className="font-robot text-sm font-bold uppercase tracking-tight text-foreground truncate">
                    {profile?.displayName || "Agent"}
                </p>
                <p className="font-robot text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                    {userRole || "User"}
                </p>
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 px-4 block mb-2">Navigation</span>
                <nav className="space-y-1">
                    {links.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-robot text-xs uppercase tracking-widest transition-all relative group ${isActive
                                    ? "text-primary bg-primary/5 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)]"
                                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                                    }`}
                            >
                                <item.icon size={16} className={isActive ? "text-primary" : "text-foreground/30 group-hover:text-foreground"} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-6 border-t border-border mt-auto">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 font-robot text-xs uppercase tracking-widest w-full transition-all group"
                >
                    <LogOut size={16} className="text-red-500/30 group-hover:text-red-500" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
