"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    updateDoc,
    doc
} from "firebase/firestore";
import { Conversation, Course } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import {
    MessageSquare,
    Inbox,
    BookOpen,
    Loader2,
    CheckCircle2,
    Filter
} from "lucide-react";
import { motion } from "framer-motion";

type FilterType = "all" | "general" | "course" | "open" | "resolved";

export default function AdminMessagesPage() {
    const { user, profile } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("all");
    const [trainerCourses, setTrainerCourses] = useState<string[]>([]);

    // For trainers: fetch their assigned courses
    useEffect(() => {
        if (profile?.role === "trainer" && user?.uid) {
            const fetchTrainerCourses = async () => {
                const q = query(collection(db, "courses"), where("trainerId", "==", user.uid));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const courseIds = snapshot.docs.map(doc => doc.id);
                    setTrainerCourses(courseIds);
                });
                return unsubscribe;
            };
            fetchTrainerCourses();
        }
    }, [profile?.role, user?.uid]);

    // Fetch conversations based on role (real-time)
    useEffect(() => {
        if (!user?.uid || !profile) return;

        let q;

        if (profile.role === "admin" || profile.role === "moderator") {
            // Admins & Mods see ALL conversations
            q = query(
                collection(db, "conversations"),
                orderBy("lastMessageAt", "desc")
            );
        } else if (profile.role === "trainer") {
            // Trainers see only course-specific conversations for their courses
            if (trainerCourses.length === 0) {
                setConversations([]);
                setLoading(false);
                return;
            }
            q = query(
                collection(db, "conversations"),
                where("courseId", "in", trainerCourses),
                orderBy("lastMessageAt", "desc")
            );
        } else {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));
            setConversations(convs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, profile, trainerCourses]);

    const handleResolve = async (conversationId: string) => {
        await updateDoc(doc(db, "conversations", conversationId), {
            status: "resolved"
        });
        if (selectedConversation?.id === conversationId) {
            setSelectedConversation(prev => prev ? { ...prev, status: "resolved" } : null);
        }
    };

    const handleReopen = async (conversationId: string) => {
        await updateDoc(doc(db, "conversations", conversationId), {
            status: "open"
        });
        if (selectedConversation?.id === conversationId) {
            setSelectedConversation(prev => prev ? { ...prev, status: "open" } : null);
        }
    };

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        if (filter === "all") return true;
        if (filter === "general") return conv.type === "general";
        if (filter === "course") return conv.type === "course";
        if (filter === "open") return conv.status === "open";
        if (filter === "resolved") return conv.status === "resolved";
        return true;
    });

    // Stats
    const stats = {
        total: conversations.length,
        open: conversations.filter(c => c.status === "open").length,
        general: conversations.filter(c => c.type === "general").length,
        course: conversations.filter(c => c.type === "course").length
    };

    if (loading) {
        return (
            <RoleGuard allowedRoles={["trainer", "moderator", "admin"]}>
                <DashboardLayout>
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                </DashboardLayout>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRoles={["trainer", "moderator", "admin"]}>
            <DashboardLayout>
                <div className="mb-8">
                    <h1 className="font-robot text-4xl font-black uppercase tracking-tighter text-foreground">
                        {profile?.role === "trainer" ? "Student Messages" : "Support Inbox"}
                    </h1>
                    <p className="font-inter text-sm text-foreground/50 mt-1">
                        {profile?.role === "trainer"
                            ? "Messages from students enrolled in your courses"
                            : "All user support and course messages"}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total", value: stats.total, icon: Inbox, color: "text-foreground" },
                        { label: "Open", value: stats.open, icon: MessageSquare, color: "text-amber-500" },
                        { label: "General", value: stats.general, icon: MessageSquare, color: "text-primary" },
                        { label: "Course", value: stats.course, icon: BookOpen, color: "text-blue-500" }
                    ].map((stat, i) => (
                        <div key={i} className="glass p-5 rounded-2xl border border-border">
                            <div className="flex items-center gap-3">
                                <stat.icon size={18} className={stat.color} />
                                <div>
                                    <p className="font-robot text-2xl font-bold text-foreground">{stat.value}</p>
                                    <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/40">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    <Filter size={14} className="text-foreground/30 shrink-0" />
                    {(["all", "open", "resolved", "general", "course"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-robot text-[10px] uppercase tracking-widest font-bold transition-all shrink-0 ${filter === f
                                ? "bg-primary text-white"
                                : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)]">
                    {/* Conversation List */}
                    <div className={`lg:col-span-1 bg-surface border border-border rounded-3xl overflow-hidden ${selectedConversation ? "hidden lg:block" : ""
                        }`}>
                        <div className="p-5 border-b border-border">
                            <h3 className="font-robot text-xs uppercase tracking-widest font-bold text-foreground/50 flex items-center gap-2">
                                <Inbox size={14} /> Conversations ({filteredConversations.length})
                            </h3>
                        </div>
                        <div className="h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
                            <ConversationList
                                conversations={filteredConversations}
                                selectedId={selectedConversation?.id}
                                onSelect={setSelectedConversation}
                                currentUserId={user?.uid || ""}
                            />
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`lg:col-span-2 bg-surface border border-border rounded-3xl overflow-hidden flex flex-col ${!selectedConversation ? "hidden lg:flex" : ""
                        }`}>
                        {selectedConversation && (
                            <div className="p-4 border-b border-border flex items-center justify-end gap-2">
                                {selectedConversation.status === "open" ? (
                                    <button
                                        onClick={() => handleResolve(selectedConversation.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        <CheckCircle2 size={14} /> Mark Resolved
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleReopen(selectedConversation.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold hover:bg-amber-500 hover:text-white transition-all"
                                    >
                                        Reopen
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="flex-1">
                            <ChatWindow
                                conversation={selectedConversation}
                                currentUser={{
                                    uid: user?.uid || "",
                                    displayName: profile?.displayName || null,
                                    photoURL: profile?.photoURL || null,
                                    role: profile?.role || "admin"
                                }}
                                onBack={() => setSelectedConversation(null)}
                            />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
