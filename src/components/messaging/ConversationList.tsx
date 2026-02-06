"use client";

import { Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, BookOpen, User, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ConversationListProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (conversation: Conversation) => void;
    currentUserId: string;
}

export default function ConversationList({
    conversations,
    selectedId,
    onSelect,
    currentUserId
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare size={48} className="text-foreground/10 mb-4" />
                <p className="font-robot text-xs uppercase tracking-widest text-foreground/30">
                    No conversations yet
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border">
            {conversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                const isUnread = conv.lastMessageSenderId !== currentUserId && (conv.unreadCount || 0) > 0;
                const timeAgo = conv.lastMessageAt?.seconds
                    ? formatDistanceToNow(new Date(conv.lastMessageAt.seconds * 1000), { addSuffix: true })
                    : "";

                return (
                    <motion.button
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        whileHover={{ x: 4 }}
                        className={`w-full text-left p-5 transition-all ${isSelected
                            ? "bg-primary/10 border-l-4 border-l-primary"
                            : "hover:bg-foreground/[0.02]"
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Avatar / Icon */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${conv.type === "course"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-primary/10 text-primary"
                                }`}>
                                {conv.type === "course" ? (
                                    <BookOpen size={20} />
                                ) : conv.userPhoto ? (
                                    <img src={conv.userPhoto} alt="" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className={`font-robot text-sm uppercase tracking-widest truncate ${isUnread ? "font-bold text-foreground" : "text-foreground/70"
                                        }`}>
                                        {conv.userName || "Unknown User"}
                                    </h4>
                                    {conv.status === "resolved" && (
                                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                    )}
                                </div>

                                {conv.type === "course" && conv.courseName && (
                                    <p className="font-robot text-[9px] uppercase tracking-widest text-blue-500 mb-1 truncate">
                                        {conv.courseName}
                                    </p>
                                )}

                                <p className={`font-inter text-xs truncate ${isUnread ? "text-foreground/80" : "text-foreground/40"
                                    }`}>
                                    {conv.lastMessagePreview || "No messages yet"}
                                </p>

                                <p className="font-inter text-[10px] text-foreground/20 mt-1">
                                    {timeAgo}
                                </p>
                            </div>

                            {/* Unread Badge */}
                            {isUnread && (
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}
