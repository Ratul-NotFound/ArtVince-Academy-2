"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, writeBatch } from "firebase/firestore";
import { Notification } from "@/types";
import { Bell, CheckCheck, X, BookOpen, UserCheck, UserX, MessageSquare, FileText, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationDropdown() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, "notifications"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(data.slice(0, 20)); // Limit to 20 latest
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Close dropdown on outside click
    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            await updateDoc(doc(db, "notifications", notificationId), { read: true });
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.uid) return;
        try {
            const batch = writeBatch(db);
            notifications.filter(n => !n.read).forEach(n => {
                batch.update(doc(db, "notifications", n.id), { read: true });
            });
            await batch.commit();
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "enrollment_approved": return <UserCheck size={16} className="text-emerald-500" />;
            case "enrollment_rejected": return <UserX size={16} className="text-red-500" />;
            case "announcement": return <MessageSquare size={16} className="text-blue-500" />;
            case "module_added": return <FileText size={16} className="text-purple-500" />;
            case "course_update": return <BookOpen size={16} className="text-primary" />;
            default: return <Bell size={16} className="text-foreground/50" />;
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef} suppressHydrationWarning>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-foreground/5 transition-colors"
            >
                <Bell size={20} className="text-foreground/60" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border bg-foreground/[0.02]">
                            <h3 className="font-robot text-xs uppercase tracking-widest font-bold text-foreground">
                                Notifications
                            </h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="flex items-center gap-1 text-foreground/40 hover:text-primary transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={14} />
                                        <span className="font-inter text-[10px]">Mark all read</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-foreground/5 rounded-lg transition-colors"
                                >
                                    <X size={14} className="text-foreground/40" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Bell size={32} className="mx-auto text-foreground/10 mb-3" />
                                    <p className="font-inter text-xs text-foreground/30 italic">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.read && markAsRead(n.id)}
                                        className={`p-4 border-b border-border/50 hover:bg-foreground/[0.02] transition-all cursor-pointer ${!n.read ? "bg-primary/5" : ""
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-robot text-[11px] uppercase tracking-widest font-bold text-foreground mb-0.5 truncate">
                                                    {n.title}
                                                </p>
                                                <p className="font-inter text-[11px] text-foreground/50 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="font-inter text-[9px] text-foreground/20 mt-1">
                                                    {mounted && n.createdAt?.seconds
                                                        ? new Date(n.createdAt.seconds * 1000).toLocaleDateString()
                                                        : (mounted ? "Just now" : "")}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                                            )}
                                        </div>
                                        {n.link && (
                                            <Link
                                                href={n.link}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mt-2 flex items-center gap-1 text-primary font-robot text-[9px] uppercase tracking-widest hover:underline"
                                            >
                                                View Details <ArrowRight size={10} />
                                            </Link>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
