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
    addDoc,
    serverTimestamp,
    getDocs
} from "firebase/firestore";
import { Conversation, Course } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { MessageSquare, Plus, BookOpen, HelpCircle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserMessagesPage() {
    const { user, profile } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

    // Fetch user's conversations (real-time)
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, "conversations"),
            where("userId", "==", user.uid),
            orderBy("lastMessageAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));
            setConversations(convs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Fetch enrolled courses for course-specific messaging
    useEffect(() => {
        const fetchCourses = async () => {
            if (!profile?.enrolledCourses?.length) return;

            const coursesData: Course[] = [];
            for (const courseId of profile.enrolledCourses) {
                const courseQuery = query(collection(db, "courses"), where("__name__", "==", courseId));
                const snap = await getDocs(courseQuery);
                if (!snap.empty) {
                    coursesData.push({ id: snap.docs[0].id, ...snap.docs[0].data() } as Course);
                }
            }
            setEnrolledCourses(coursesData);
        };

        fetchCourses();
    }, [profile?.enrolledCourses]);

    const startNewConversation = async (type: "general" | "course", courseId?: string, courseName?: string) => {
        if (!user?.uid || !profile) return;

        // Check if conversation already exists
        const existingConv = conversations.find(c =>
            type === "general" ? c.type === "general" : c.courseId === courseId
        );

        if (existingConv) {
            setSelectedConversation(existingConv);
            setShowNewConversation(false);
            return;
        }

        // Create new conversation - only include defined fields
        const conversationData: Record<string, any> = {
            type,
            userId: user.uid,
            userName: profile.displayName || profile.email || "User",
            participantIds: [user.uid],
            lastMessageAt: serverTimestamp(),
            lastMessagePreview: "",
            status: "open",
            createdAt: serverTimestamp()
        };

        // Only add optional fields if they have values
        if (courseId) conversationData.courseId = courseId;
        if (courseName) conversationData.courseName = courseName;
        if (profile.photoURL) conversationData.userPhoto = profile.photoURL;

        const docRef = await addDoc(collection(db, "conversations"), conversationData);
        const newConv = { id: docRef.id, ...conversationData } as Conversation;
        setSelectedConversation(newConv);
        setShowNewConversation(false);
    };


    if (loading) {
        return (
            <RoleGuard allowedRoles={["user", "trainer", "moderator", "admin"]}>
                <DashboardLayout>
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                </DashboardLayout>
            </RoleGuard>
        );
    }

    return (
        <RoleGuard allowedRoles={["user", "trainer", "moderator", "admin"]}>
            <DashboardLayout>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-robot text-4xl font-black uppercase tracking-tighter text-foreground">
                            Messages
                        </h1>
                        <p className="font-inter text-sm text-foreground/50 mt-1">
                            Communicate with instructors and support
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewConversation(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-robot text-xs uppercase tracking-widest font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} /> New Message
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                    {/* Conversation List */}
                    <div className={`lg:col-span-1 bg-surface border border-border rounded-3xl overflow-hidden ${selectedConversation ? "hidden lg:block" : ""
                        }`}>
                        <div className="p-5 border-b border-border">
                            <h3 className="font-robot text-xs uppercase tracking-widest font-bold text-foreground/50 flex items-center gap-2">
                                <MessageSquare size={14} /> Conversations
                            </h3>
                        </div>
                        <div className="h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
                            <ConversationList
                                conversations={conversations}
                                selectedId={selectedConversation?.id}
                                onSelect={setSelectedConversation}
                                currentUserId={user?.uid || ""}
                            />
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`lg:col-span-2 bg-surface border border-border rounded-3xl overflow-hidden ${!selectedConversation ? "hidden lg:block" : ""
                        }`}>
                        <ChatWindow
                            conversation={selectedConversation}
                            currentUser={{
                                uid: user?.uid || "",
                                displayName: profile?.displayName || null,
                                photoURL: profile?.photoURL || null,
                                role: profile?.role || "user"
                            }}
                            onBack={() => setSelectedConversation(null)}
                        />
                    </div>
                </div>

                {/* New Conversation Modal */}
                <AnimatePresence>
                    {showNewConversation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                            onClick={() => setShowNewConversation(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-background border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-robot text-xl font-bold uppercase tracking-tighter">
                                        Start Conversation
                                    </h2>
                                    <button onClick={() => setShowNewConversation(false)} className="text-foreground/30 hover:text-foreground transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* General Support */}
                                    <button
                                        onClick={() => startNewConversation("general")}
                                        className="w-full p-6 bg-primary/5 border border-primary/20 rounded-2xl text-left hover:bg-primary/10 hover:border-primary/40 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <HelpCircle size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-robot text-sm uppercase tracking-widest font-bold text-foreground">
                                                    General Support
                                                </h4>
                                                <p className="font-inter text-xs text-foreground/50 mt-1">
                                                    Account issues, inquiries, feedback
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Course-Specific */}
                                    {enrolledCourses.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-3 pt-4">
                                                <div className="h-px flex-1 bg-border" />
                                                <span className="font-robot text-[9px] uppercase tracking-widest text-foreground/30">
                                                    Your Courses
                                                </span>
                                                <div className="h-px flex-1 bg-border" />
                                            </div>

                                            {enrolledCourses.map((course) => (
                                                <button
                                                    key={course.id}
                                                    onClick={() => startNewConversation("course", course.id, course.title)}
                                                    className="w-full p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-left hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                            <BookOpen size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-robot text-xs uppercase tracking-widest font-bold text-foreground truncate">
                                                                {course.title}
                                                            </h4>
                                                            <p className="font-inter text-[10px] text-foreground/50 mt-0.5">
                                                                Message your instructor
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    )}

                                    {enrolledCourses.length === 0 && (
                                        <p className="text-center font-inter text-xs text-foreground/30 italic py-4">
                                            Enroll in a course to message instructors
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DashboardLayout>
        </RoleGuard>
    );
}
