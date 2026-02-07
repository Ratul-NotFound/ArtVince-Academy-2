"use client";

import { useEffect, useRef, useState } from "react";
import { Message, Conversation, UserRole } from "@/types";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    writeBatch
} from "firebase/firestore";
import MessageInput from "./MessageInput";
import { formatDistanceToNow } from "date-fns";
import { User, BookOpen, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeMessageContent, isValidMessageContent, sanitizeDisplayName } from "@/lib/validation";

interface ChatWindowProps {
    conversation: Conversation | null;
    currentUser: {
        uid: string;
        displayName: string | null;
        photoURL: string | null;
        role: UserRole;
    };
    onBack?: () => void;
}

export default function ChatWindow({ conversation, currentUser, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Real-time message listener
    useEffect(() => {
        if (!conversation?.id) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, "conversations", conversation.id, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
            setLoading(false);

            // Mark messages as read
            const batch = writeBatch(db);
            snapshot.docs.forEach(docSnap => {
                const msg = docSnap.data();
                if (!msg.read && msg.senderId !== currentUser.uid) {
                    batch.update(doc(db, "conversations", conversation.id, "messages", docSnap.id), { read: true });
                }
            });
            batch.commit().catch(console.error);
        });

        return () => unsubscribe();
    }, [conversation?.id, currentUser.uid]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!conversation?.id || !currentUser.uid) return;

        // Validate and sanitize message content
        if (!isValidMessageContent(text)) return;
        const sanitizedText = sanitizeMessageContent(text);
        if (!sanitizedText.trim()) return;

        const messageData = {
            conversationId: conversation.id,
            senderId: currentUser.uid,
            senderName: sanitizeDisplayName(currentUser.displayName || "Anonymous"),
            senderPhoto: currentUser.photoURL || null,
            senderRole: currentUser.role,
            content: sanitizedText, // Match Firestore rules field name
            text: sanitizedText, // Keep for backward compatibility
            read: false,
            createdAt: serverTimestamp()
        };

        // Add message to sub-collection
        await addDoc(collection(db, "conversations", conversation.id, "messages"), messageData);

        // Update conversation metadata
        await updateDoc(doc(db, "conversations", conversation.id), {
            lastMessageAt: serverTimestamp(),
            lastMessagePreview: sanitizedText.slice(0, 100),
            lastMessageSenderId: currentUser.uid
        });
    };

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <BookOpen size={64} className="text-foreground/10 mb-4" />
                <p className="font-robot text-sm uppercase tracking-widest text-foreground/30">
                    Select a conversation to begin
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center gap-4 bg-surface/50">
                {onBack && (
                    <button onClick={onBack} className="lg:hidden text-foreground/50 hover:text-primary transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conversation.type === "course" ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                    }`}>
                    {conversation.userPhoto ? (
                        <img src={conversation.userPhoto} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <User size={18} />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-robot text-sm uppercase tracking-widest font-bold text-foreground">
                        {conversation.userName}
                    </h3>
                    {conversation.type === "course" && conversation.courseName && (
                        <p className="font-robot text-[9px] uppercase tracking-widest text-blue-500">
                            {conversation.courseName}
                        </p>
                    )}
                </div>
                {conversation.status === "resolved" && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 size={12} />
                        <span className="font-robot text-[8px] uppercase tracking-widest font-bold">Resolved</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="font-inter text-xs text-foreground/30 italic">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg) => {
                            const isOwn = msg.senderId === currentUser.uid;
                            const timeAgo = msg.createdAt?.seconds
                                ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000), { addSuffix: true })
                                : "";

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[70%] ${isOwn ? "order-2" : ""}`}>
                                        <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                                            {/* Avatar */}
                                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                                {msg.senderPhoto ? (
                                                    <img src={msg.senderPhoto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/20">
                                                        <User size={14} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bubble */}
                                            <div className={`px-5 py-3 rounded-2xl ${isOwn
                                                ? "bg-primary text-white rounded-br-sm"
                                                : "bg-foreground/5 text-foreground border border-border rounded-bl-sm"
                                                }`}>
                                                <p className="font-inter text-sm leading-relaxed">{msg.text}</p>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end pr-10" : "pl-10"}`}>
                                            <span className="font-robot text-[8px] uppercase tracking-widest text-foreground/20">
                                                {msg.senderName}
                                            </span>
                                            <span className="font-robot text-[8px] uppercase tracking-widest text-foreground/20">
                                                {msg.senderRole}
                                            </span>
                                            <span className="font-inter text-[9px] text-foreground/20">{timeAgo}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput
                onSend={handleSendMessage}
                disabled={conversation.status === "resolved"}
                placeholder={conversation.status === "resolved" ? "Conversation resolved" : "Type your message..."}
            />
        </div>
    );
}
