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
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import {
    MessageSquare,
    X,
    Plus,
    ArrowLeft,
    HelpCircle,
    BookOpen,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChat() {
    const { user, profile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch conversations
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

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

            // Count unread
            const unread = convs.filter(c =>
                c.lastMessageSenderId !== user.uid && c.status === "open"
            ).length;
            setUnreadCount(unread);

            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Fetch enrolled courses
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

        const existingConv = conversations.find(c =>
            type === "general" ? c.type === "general" : c.courseId === courseId
        );

        if (existingConv) {
            setSelectedConversation(existingConv);
            setShowNewChat(false);
            return;
        }

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

        if (courseId) conversationData.courseId = courseId;
        if (courseName) conversationData.courseName = courseName;
        if (profile.photoURL) conversationData.userPhoto = profile.photoURL;

        const docRef = await addDoc(collection(db, "conversations"), conversationData);
        const newConv = { id: docRef.id, ...conversationData } as Conversation;
        setSelectedConversation(newConv);
        setShowNewChat(false);
    };

    // Don't render if not logged in
    if (!user) return null;

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-primary shadow-2xl shadow-primary/30 flex items-center justify-center text-white hover:scale-110 transition-all ${isOpen ? "hidden" : ""}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageSquare size={28} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-h-[80vh] bg-background border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                {selectedConversation && (
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="text-foreground/50 hover:text-primary transition-colors"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                )}
                                <h3 className="font-robot text-sm uppercase tracking-widest font-bold text-foreground">
                                    {selectedConversation ? selectedConversation.userName : showNewChat ? "New Message" : "Messages"}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {!selectedConversation && !showNewChat && (
                                    <button
                                        onClick={() => setShowNewChat(true)}
                                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setSelectedConversation(null);
                                        setShowNewChat(false);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-foreground/5 text-foreground/50 flex items-center justify-center hover:bg-foreground/10 hover:text-foreground transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            ) : showNewChat ? (
                                /* New Chat Options */
                                <div className="p-4 space-y-3 overflow-y-auto h-full custom-scrollbar">
                                    <button
                                        onClick={() => {
                                            startNewConversation("general");
                                            setShowNewChat(false);
                                        }}
                                        className="w-full p-4 bg-primary/5 border border-primary/20 rounded-2xl text-left hover:bg-primary/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <HelpCircle size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-robot text-xs uppercase tracking-widest font-bold text-foreground">
                                                    General Support
                                                </h4>
                                                <p className="font-inter text-[10px] text-foreground/50">
                                                    Account issues, inquiries
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    {enrolledCourses.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-2 py-2">
                                                <div className="h-px flex-1 bg-border" />
                                                <span className="font-robot text-[8px] uppercase tracking-widest text-foreground/30">
                                                    Your Courses
                                                </span>
                                                <div className="h-px flex-1 bg-border" />
                                            </div>
                                            {enrolledCourses.map((course) => (
                                                <button
                                                    key={course.id}
                                                    onClick={() => {
                                                        startNewConversation("course", course.id, course.title);
                                                        setShowNewChat(false);
                                                    }}
                                                    className="w-full p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-left hover:bg-blue-500/10 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                            <BookOpen size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-robot text-xs uppercase tracking-widest font-bold text-foreground truncate">
                                                                {course.title}
                                                            </h4>
                                                            <p className="font-inter text-[10px] text-foreground/50">
                                                                Message instructor
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </>
                                    )}

                                    <button
                                        onClick={() => setShowNewChat(false)}
                                        className="w-full py-3 text-center font-robot text-[10px] uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : selectedConversation ? (
                                /* Chat Window */
                                <ChatWindow
                                    conversation={selectedConversation}
                                    currentUser={{
                                        uid: user.uid,
                                        displayName: profile?.displayName || null,
                                        photoURL: profile?.photoURL || null,
                                        role: profile?.role || "user"
                                    }}
                                />
                            ) : (
                                /* Conversation List */
                                <div className="h-full overflow-y-auto custom-scrollbar">
                                    <ConversationList
                                        conversations={conversations}
                                        selectedId={undefined}
                                        onSelect={setSelectedConversation}
                                        currentUserId={user.uid}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
