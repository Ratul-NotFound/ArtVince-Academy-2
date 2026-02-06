"use client";

import { useState } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";

interface MessageInputProps {
    onSend: (text: string, attachmentUrl?: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

export default function MessageInput({ onSend, disabled, placeholder }: MessageInputProps) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || sending || disabled) return;

        setSending(true);
        try {
            await onSend(text.trim());
            setText("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
            <div className="flex items-center gap-3">
                {/* Attachment Button (placeholder for now) */}
                <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all"
                    disabled
                >
                    <Paperclip size={18} />
                </button>

                {/* Text Input */}
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder || "Type your message..."}
                    disabled={disabled || sending}
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-inter text-sm text-foreground placeholder:text-foreground/30 disabled:opacity-50"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!text.trim() || sending || disabled}
                    className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {sending ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </div>
        </form>
    );
}
