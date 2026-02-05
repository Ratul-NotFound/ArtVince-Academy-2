"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

type AuthMode = "login" | "register" | "reset";

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const { user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");

    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (user) {
            router.push(redirect ? `/courses/${redirect}` : "/dashboard");
        }
    }, [user, router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "login") {
                await loginWithEmail(email, password);
            } else if (mode === "register") {
                if (!displayName.trim()) {
                    throw new Error("Display name is required");
                }
                await registerWithEmail(email, password, displayName);
            } else if (mode === "reset") {
                await resetPassword(email);
                setSuccess("Password reset email sent! Check your inbox.");
                setEmail("");
            }
        } catch (err: any) {
            let message = "An error occurred";
            if (err.code === "auth/email-already-in-use") {
                message = "This email is already registered";
            } else if (err.code === "auth/invalid-email") {
                message = "Invalid email address";
            } else if (err.code === "auth/weak-password") {
                message = "Password should be at least 6 characters";
            } else if (err.code === "auth/user-not-found") {
                message = "No account found with this email";
            } else if (err.code === "auth/wrong-password") {
                message = "Incorrect password";
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Login Page - Google Error:", err);
            setError(err.message || "Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Decorative Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 rounded-[2rem] border border-border w-full max-w-md relative z-10"
            >
                <Link href="/" className="block w-20 h-20 bg-primary/10 mx-auto rounded-2xl flex items-center justify-center skew-x-12 rotate-6 hover:scale-110 transition-transform overflow-hidden border border-primary/20">
                    <img src="/favicon.png" alt="Artvince Logo" className="w-12 h-12 object-contain -skew-x-12" />
                </Link>

                <h1 className="font-robot text-3xl font-bold uppercase tracking-tighter mb-2 text-foreground text-center">
                    {mode === "login" && "Initialize Session"}
                    {mode === "register" && "Create Account"}
                    {mode === "reset" && "Reset Password"}
                </h1>
                <p className="font-inter text-foreground/40 mb-8 uppercase text-xs tracking-[0.2em] text-center">
                    {mode === "login" && "Enter the creative nexus"}
                    {mode === "register" && "Join the academy"}
                    {mode === "reset" && "Recover your access"}
                </p>

                {/* Error/Success Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                        >
                            <AlertCircle size={18} className="text-red-500 shrink-0" />
                            <p className="font-inter text-sm text-red-500">{error}</p>
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
                        >
                            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                            <p className="font-inter text-sm text-emerald-500">{success}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    {mode === "register" && (
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                            <input
                                type="text"
                                placeholder="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full bg-foreground/5 border border-border rounded-xl pl-12 pr-4 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/30"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-foreground/5 border border-border rounded-xl pl-12 pr-4 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/30"
                            required
                        />
                    </div>

                    {mode !== "reset" && (
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-foreground/5 border border-border rounded-xl pl-12 pr-4 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/30"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-robot font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                {mode === "login" && "Sign In"}
                                {mode === "register" && "Create Account"}
                                {mode === "reset" && "Send Reset Link"}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {mode !== "reset" && (
                    <>
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-border" />
                            <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/30">Or</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-foreground text-background py-4 rounded-xl font-robot font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-foreground/90 transition-all disabled:opacity-50"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                            Connect with Google
                        </button>
                    </>
                )}

                <div className="mt-8 pt-6 border-t border-border space-y-3 text-center">
                    {mode === "login" && (
                        <>
                            <button
                                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                                className="font-robot text-[11px] uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors block w-full"
                            >
                                New Agent? <span className="text-primary font-bold">Create Account</span>
                            </button>
                            <button
                                onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                                className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors block w-full"
                            >
                                Forgot Password?
                            </button>
                        </>
                    )}
                    {mode === "register" && (
                        <button
                            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                            className="font-robot text-[11px] uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors block w-full"
                        >
                            Already have an account? <span className="text-primary font-bold">Sign In</span>
                        </button>
                    )}
                    {mode === "reset" && (
                        <button
                            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                            className="font-robot text-[11px] uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors block w-full"
                        >
                            Remember your password? <span className="text-primary font-bold">Sign In</span>
                        </button>
                    )}
                </div>

                <div className="mt-8 pt-4 border-t border-border">
                    <p className="font-robot text-[10px] uppercase tracking-[0.2em] text-foreground/20 text-center">
                        Authorized Personnel Only <br />
                        Secure Lvl 4 Encryption
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
