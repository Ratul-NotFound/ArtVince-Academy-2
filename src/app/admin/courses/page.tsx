"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { Course, UserProfile } from "@/types";
import { Plus, Edit2, Trash2, ExternalLink, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [trainers, setTrainers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Form Stats
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        category: "Concept Art",
        duration: "",
        difficulty: "Beginner",
        thumbnail: "",
        trainerId: "",
    });

    useEffect(() => {
        fetchCourses();
        fetchTrainers();
    }, []);

    const fetchCourses = async () => {
        try {
            const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainers = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "trainer"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => doc.data() as UserProfile);
            setTrainers(data);
        } catch (error) {
            console.error("Error fetching trainers:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await updateDoc(doc(db, "courses", editingCourse.id), formData);
            } else {
                await addDoc(collection(db, "courses"), {
                    ...formData,
                    status: "Published",
                    enrolledCount: 0,
                    createdAt: new Date(),
                });
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (error) {
            console.error("Error saving course:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this course?")) {
            await deleteDoc(doc(db, "courses", id));
            fetchCourses();
        }
    };

    return (
        <RoleGuard allowedRoles={["admin"]}>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Course <span className="text-primary italic">Vault</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Manage Academy Curriculum
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCourse(null);
                            setFormData({ title: "", description: "", price: 0, category: "Concept Art", duration: "", difficulty: "Beginner", thumbnail: "", trainerId: "" });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} />
                        New Course
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <motion.div
                                layout
                                key={course.id}
                                className="glass p-6 rounded-2xl border border-border group hover:border-primary/50 transition-all"
                            >
                                <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-foreground/5 relative">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-foreground/10">
                                            <BookOpen size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full font-robot text-[10px] uppercase font-bold text-primary">
                                        ${course.price}
                                    </div>
                                </div>

                                <h3 className="font-robot text-xl font-bold uppercase text-foreground mb-2 truncate">
                                    {course.title}
                                </h3>
                                <p className="font-inter text-xs text-foreground/40 line-clamp-2 mb-6">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-border">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCourse(course);
                                                setFormData({ ...course });
                                                setIsModalOpen(true);
                                            }}
                                            className="p-3 rounded-xl border border-border hover:border-primary hover:text-primary transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="p-3 rounded-xl border border-border hover:border-red-500 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-2 font-robot text-[10px] uppercase tracking-widest text-foreground/30 hover:text-primary transition-all">
                                        View Details <ExternalLink size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Course Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-background/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-surface border border-border w-full max-w-2xl rounded-3xl p-8 sm:p-12 overflow-y-auto max-h-[90vh] shadow-2xl"
                            >
                                <h2 className="font-robot text-3xl font-bold uppercase tracking-tighter mb-8">
                                    {editingCourse ? "Edit Course" : "Assemble New Course"}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Course Title</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                                placeholder="e.g. 3D Character Design"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Price (USD)</label>
                                            <input
                                                required
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                                placeholder="99"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                            >
                                                <option>Concept Art</option>
                                                <option>Game Dev</option>
                                                <option>Animation</option>
                                                <option>Publishing</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Duration</label>
                                            <input
                                                type="text"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                                placeholder="e.g. 8 Weeks"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Difficulty</label>
                                            <select
                                                value={formData.difficulty}
                                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Advanced</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Assigned Trainer</label>
                                            <select
                                                required
                                                value={formData.trainerId}
                                                onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                                                className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                            >
                                                <option value="">Select Trainer</option>
                                                {trainers.map(t => (
                                                    <option key={t.uid} value={t.uid}>{t.displayName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Description</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all resize-none"
                                            placeholder="Course synopsis..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-4">Thumbnail URL</label>
                                        <input
                                            type="text"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-inter text-sm outline-none focus:border-primary transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary text-white py-4 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
                                        >
                                            {editingCourse ? "Update Course" : "Initialize Course"}
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
