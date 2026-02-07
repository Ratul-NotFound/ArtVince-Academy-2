"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { User, Mail, Camera, Save, Loader2, ShieldCheck, MapPin, Globe } from "lucide-react";

export default function ProfilePage() {
    const { profile, user, userRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        studio: "",
        location: "",
        website: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || "",
                bio: profile.bio || "",
                studio: profile.studio || "",
                location: profile.location || "",
                website: profile.website || "",
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                ...formData,
                updatedAt: new Date(),
            });
            alert("Digital Identity Synchronized.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Synchronization Failure.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-10">
                <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                    Profile <span className="text-primary italic">Dossier</span>
                </h1>
                <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                    Manage your neural presence and platform credentials
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[40px] border border-border text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-primary/10 -z-10" />
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 rounded-3xl bg-surface border-4 border-background flex items-center justify-center overflow-hidden shadow-2xl mx-auto">
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-primary" />
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                                <Camera size={14} />
                            </button>
                        </div>

                        <h2 className="font-robot text-xl font-bold uppercase tracking-tight text-foreground">
                            {profile?.displayName || "Anonymous Agent"}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className={`px-3 py-1 rounded-full font-robot text-[9px] uppercase font-bold tracking-widest ${userRole === "admin" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                userRole === "trainer" ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" :
                                    "bg-primary/10 text-primary border border-primary/20"
                                }`}>
                                <ShieldCheck size={10} className="inline mr-1" />
                                {userRole}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
                            <div>
                                <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mb-1">Enrolled</p>
                                <p className="font-robot text-lg font-bold text-foreground">{profile?.enrolledCourses?.length || 0}</p>
                            </div>
                            <div>
                                <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mb-1">Completed</p>
                                <p className="font-robot text-lg font-bold text-foreground">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[32px] border border-border">
                        <h3 className="font-robot text-xs uppercase tracking-widest text-foreground/40 font-bold mb-6">Account Metadata</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Mail size={16} className="text-primary" />
                                <div className="overflow-hidden">
                                    <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/20">Email Protocol</p>
                                    <p className="font-inter text-xs text-foreground/60 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <User size={16} className="text-primary" />
                                <div>
                                    <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/20">Unique Identifier</p>
                                    <p className="font-mono text-[10px] text-foreground/60 truncate max-w-[150px]">{user?.uid}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="glass p-10 rounded-[40px] border border-border space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4 flex items-center gap-2">
                                    <User size={12} /> Operational Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground"
                                    placeholder="Agency Alias"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4 flex items-center gap-2">
                                    <Globe size={12} /> Personal Node (Website)
                                </label>
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground"
                                    placeholder="https://artvince.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4 flex items-center gap-2">
                                    <MapPin size={12} /> Sector (Location)
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground"
                                    placeholder="Dhaka, Bangladesh"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4 flex items-center gap-2">
                                    <Globe size={12} /> Studio / Agency
                                </label>
                                <input
                                    type="text"
                                    value={formData.studio}
                                    onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
                                    className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground"
                                    placeholder="Artvince Labs"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4 flex items-center gap-2">
                                Professional Synopsis (Bio)
                            </label>
                            <textarea
                                rows={6}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-foreground/5 border border-border rounded-3xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground resize-none"
                                placeholder="I am a tactical digital artist specializing in..."
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-12 py-5 rounded-2xl font-robot text-xs uppercase tracking-[0.3em] font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Synchronize Dossier
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
