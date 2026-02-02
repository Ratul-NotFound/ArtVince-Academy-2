"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const { user, loginWithGoogle } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Decorative Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 rounded-[2rem] border border-border w-full max-w-md text-center relative z-10"
            >
                <div className="w-20 h-20 bg-primary mx-auto rounded-2xl flex items-center justify-center font-robot font-bold text-4xl mb-8 skew-x-12 rotate-6">
                    A
                </div>
                <h1 className="font-robot text-3xl font-bold uppercase tracking-tighter mb-2 text-foreground">Initialize Session</h1>
                <p className="font-inter text-foreground/40 mb-10 uppercase text-xs tracking-[0.2em]">Enter the creative nexus</p>

                <button
                    onClick={loginWithGoogle}
                    className="w-full bg-foreground text-background py-4 rounded-xl font-robot font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1"
                >
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                    Connect with Google
                </button>

                <div className="mt-12 pt-8 border-t border-border">
                    <p className="font-robot text-[10px] uppercase tracking-[0.2em] text-foreground/20">
                        Authorized Personnel Only <br />
                        Secure Lvl 4 Encryption
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
