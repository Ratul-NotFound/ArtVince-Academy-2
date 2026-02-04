"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDoc
} from "firebase/firestore";
import { Course, CourseModule } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
    Plus,
    Edit2,
    Trash2,
    GripVertical,
    Video,
    FileText,
    X,
    Loader2,
    BookOpen,
    Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TrainerModulesPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        videoUrl: "",
        content: "",
        order: 1,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !user) return;
            try {
                // Verify course exists and trainer has access
                const courseDoc = await getDoc(doc(db, "courses", id as string));
                if (!courseDoc.exists()) {
                    router.push("/trainer/courses");
                    return;
                }
                const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                const isAuthorized = courseData.trainerId === user.uid || profile?.role === "admin" || profile?.role === "moderator";

                if (!isAuthorized) {
                    router.push("/trainer/courses");
                    return;
                }
                setCourse(courseData);

                // Fetch modules
                const q = query(
                    collection(db, "courseModules"),
                    where("courseId", "==", id),
                    orderBy("order", "asc")
                );
                const querySnapshot = await getDocs(q);
                const modulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseModule));
                setModules(modulesData);
                setFormData(prev => ({ ...prev, order: modulesData.length + 1 }));
            } catch (error) {
                console.error("Error fetching module data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingModule) {
                await updateDoc(doc(db, "courseModules", editingModule.id), formData);
            } else {
                await addDoc(collection(db, "courseModules"), {
                    ...formData,
                    courseId: id,
                });
            }
            setIsModalOpen(false);
            setEditingModule(null);
            // Refresh
            const q = query(collection(db, "courseModules"), where("courseId", "==", id), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const modulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseModule));
            setModules(modulesData);
            setFormData({ title: "", videoUrl: "", content: "", order: modulesData.length + 1 });
        } catch (error) {
            console.error("Error saving module:", error);
        }
    };

    const handleDelete = async (moduleId: string) => {
        if (confirm("Delete this module forever?")) {
            await deleteDoc(doc(db, "courseModules", moduleId));
            setModules(modules.filter(m => m.id !== moduleId));
        }
    };

    return (
        <RoleGuard allowedRoles={["trainer", "admin", "moderator"]}>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={() => router.back()} className="text-foreground/30 hover:text-primary p-2">
                                <X size={20} />
                            </button>
                            <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                                Syllabus <span className="text-primary italic">Forge</span>
                            </h1>
                        </div>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 ml-12">
                            Curriculum for: <span className="text-foreground font-bold">{course?.title}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingModule(null);
                            setFormData({ title: "", videoUrl: "", content: "", order: modules.length + 1 });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                    >
                        <Plus size={16} /> Add Module
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {modules.map((m) => (
                            <motion.div
                                layout
                                key={m.id}
                                className="glass p-6 rounded-2xl border border-border flex items-center justify-between group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="text-foreground/10 cursor-move">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center font-robot text-xs font-bold text-foreground/40 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        {m.order < 10 ? `0${m.order}` : m.order}
                                    </div>
                                    <div>
                                        <h3 className="font-robot text-sm uppercase font-bold tracking-widest text-foreground">{m.title}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            {m.videoUrl && <span className="flex items-center gap-1 font-inter text-[9px] text-primary uppercase font-bold"><Video size={10} /> Video</span>}
                                            {m.content && <span className="flex items-center gap-1 font-inter text-[9px] text-cyan-500 uppercase font-bold"><FileText size={10} /> Dossier</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingModule(m);
                                            setFormData({
                                                title: m.title || "",
                                                videoUrl: m.videoUrl || "",
                                                content: m.content || "",
                                                order: m.order || 1
                                            });
                                            setIsModalOpen(true);
                                        }}
                                        className="p-3 rounded-xl hover:bg-foreground/5 text-foreground/30 hover:text-primary transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(m.id)}
                                        className="p-3 rounded-xl hover:bg-red-500/5 text-foreground/30 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {modules.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-border rounded-[40px]">
                                <BookOpen size={48} className="text-foreground/10" />
                                <p className="font-inter text-sm text-foreground/30 italic font-medium">This curriculum vault is currently empty.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Module Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
                                className="relative bg-surface border border-border w-full max-w-xl rounded-3xl p-10 overflow-y-auto max-h-[90vh] shadow-2xl"
                            >
                                <h2 className="font-robot text-2xl font-bold uppercase tracking-tighter mb-8">
                                    {editingModule ? "Recalibrate Module" : "Assemble Module"}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Order</label>
                                            <input required type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all" />
                                        </div>
                                        <div className="sm:col-span-3 space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Module Title</label>
                                            <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all" placeholder="e.g. Introduction to Anatomy" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Video URL (YouTube/Vimeo)</label>
                                        <input type="text" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Module Dossier (Content)</label>
                                        <textarea rows={6} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all resize-none" placeholder="Enter module details, notes, or instructions..." />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary text-white py-4 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2"
                                        >
                                            <Save size={16} /> {editingModule ? "Save Changes" : "Commit Module"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-8 border border-border rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground/5 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </DashboardLayout>
        </RoleGuard>
    );
}
