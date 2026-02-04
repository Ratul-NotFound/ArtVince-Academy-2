"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Course } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Plus, Trash2, Loader2, Send, Save, BookOpen, AlertCircle } from "lucide-react";
import Portal from "@/components/Portal";

interface Announcement {
    id: string;
    title: string;
    content: string;
    courseId: string;
    courseName: string;
    createdAt: any;
    trainerName: string;
}

export default function TrainerAnnouncementsPage() {
    const { user, profile } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        content: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch Courses
                let qCourses;
                if (profile?.role === "admin" || profile?.role === "moderator") {
                    qCourses = query(collection(db, "courses"));
                } else {
                    qCourses = query(collection(db, "courses"), where("trainerId", "==", user.uid));
                }
                const coursesSnap = await getDocs(qCourses);
                const coursesData = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(coursesData);
                if (coursesData.length > 0) setSelectedCourseId(coursesData[0].id);

                // Fetch existing announcements
                let qAnn;
                if (profile?.role === "admin" || profile?.role === "moderator") {
                    qAnn = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
                } else {
                    qAnn = query(collection(db, "announcements"), where("trainerId", "==", user.uid), orderBy("createdAt", "desc"));
                }
                const annSnap = await getDocs(qAnn);
                setAnnouncements(annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
            } catch (error) {
                console.error("Error fetching announcements:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedCourseId) return;
        setLoading(true);
        try {
            const course = courses.find(c => c.id === selectedCourseId);
            const newAnn = {
                title: formData.title,
                content: formData.content,
                courseId: selectedCourseId,
                courseName: course?.title || "Unknown Course",
                trainerId: user.uid,
                trainerName: profile?.displayName || "Instructor",
                createdAt: new Date(),
            };
            const docRef = await addDoc(collection(db, "announcements"), newAnn);
            setAnnouncements([{ id: docRef.id, ...newAnn }, ...announcements]);
            setIsModalOpen(false);
            setFormData({ title: "", content: "" });
        } catch (error) {
            console.error("Error posting announcement:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Retract this announcement?")) return;
        await deleteDoc(doc(db, "announcements", id));
        setAnnouncements(announcements.filter(a => a.id !== id));
    };

    return (
        <RoleGuard allowedRoles={["trainer", "admin", "moderator"]}>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Academy <span className="text-primary italic">Broadcast</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Deploy tactical alerts and course objectives to your operatives
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-robot text-[10px] uppercase tracking-widest font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                    >
                        <Plus size={16} /> New Transmission
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 text-primary">
                            <Loader2 className="animate-spin" size={40} />
                        </div>
                    ) : announcements.length > 0 ? (
                        announcements.map((a) => (
                            <motion.div
                                layout
                                key={a.id}
                                className="glass p-8 rounded-[32px] border border-border group hover:border-primary/50 transition-all flex flex-col md:flex-row gap-8"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Megaphone size={18} />
                                        </div>
                                        <div>
                                            <span className="font-robot text-[9px] uppercase tracking-widest text-primary font-bold">{a.courseName}</span>
                                            <h3 className="font-robot text-xl font-bold uppercase text-foreground leading-none">{a.title}</h3>
                                        </div>
                                    </div>
                                    <p className="font-inter text-sm text-foreground/50 leading-relaxed">
                                        {a.content}
                                    </p>
                                </div>
                                <div className="flex flex-col justify-between items-end gap-4 border-l border-border pl-8">
                                    <div className="text-right">
                                        <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/20">Deployment Date</p>
                                        <p className="font-robot text-[10px] uppercase font-bold text-foreground/60">
                                            {a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toLocaleDateString() : "Just Now"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        className="p-3 rounded-xl bg-red-500/5 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-32 border-2 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center text-center space-y-4">
                            <AlertCircle size={48} className="text-foreground/10" />
                            <p className="font-inter text-sm text-foreground/30 italic">Clear signals. No active broadcasts detected.</p>
                        </div>
                    )}
                </div>

                {/* Broadcast Modal */}
                <Portal>
                    <AnimatePresence>
                        {isModalOpen && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute inset-0 bg-background/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative bg-surface border border-border w-full max-w-xl rounded-[40px] p-12 overflow-y-auto max-h-[90vh] shadow-2xl"
                                >
                                    <h2 className="font-robot text-3xl font-bold uppercase tracking-tighter mb-8">
                                        Academy <span className="text-primary">Transmission</span>
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4 flex items-center gap-2">
                                                <BookOpen size={12} /> Target Sector (Course)
                                            </label>
                                            <select
                                                required
                                                value={selectedCourseId}
                                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                                className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-robot text-xs uppercase tracking-widest font-bold outline-none focus:border-primary transition-all text-foreground appearance-none"
                                            >
                                                <option value="" disabled>Select sector...</option>
                                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Alert Subject</label>
                                            <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-2xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground" placeholder="e.g. Schedule Override" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Tactical Data (Content)</label>
                                            <textarea rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-3xl px-6 py-4 font-inter text-sm outline-none focus:border-primary transition-all text-foreground resize-none" placeholder="Enter message details..." />
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-primary text-white py-5 rounded-2xl font-robot text-[10px] uppercase tracking-[0.3em] font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Send size={16} /> Deploy Broadcast
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-8 border border-border rounded-2xl font-robot text-[10px] uppercase tracking-widest font-bold hover:bg-foreground/5 transition-all"
                                            >
                                                Abort
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </Portal>
            </DashboardLayout>
        </RoleGuard>
    );
}
