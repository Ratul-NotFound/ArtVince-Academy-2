"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { Course, UserProfile } from "@/types";
import { Plus, Edit2, Trash2, ExternalLink, Loader2, BookOpen, Search, X, Users, DollarSign, ChevronDown, Eye, Settings, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Portal from "@/components/Portal";

const DEFAULT_COURSES = [
    {
        title: "Digital Sculpting Foundations",
        description: "Master organic & hard-surface sculpting in ZBrush. Understand primary shapes, silhouettes, and anatomical foundations.",
        price: 89,
        category: "Digital Sculpting",
        duration: "8 Weeks",
        difficulty: "Beginner",
        thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop",
        status: "Published",
        enrolledCount: 142,
        createdAt: new Date(),
    },
    {
        title: "Mastering AAA Characters",
        description: "Master the complete character pipeline for games and film: from high-poly sculpture to retopology and PBR texturing.",
        price: 129,
        category: "Character Art",
        duration: "12 Weeks",
        difficulty: "Advanced",
        thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=2070&auto=format&fit=crop",
        status: "Published",
        enrolledCount: 256,
        createdAt: new Date(),
    },
    {
        title: "Hollywood Cinematic Lighting",
        description: "Create immersive worlds and atmospheric scenes in Unreal Engine 5. Master cinematic lighting, composition, and VFX.",
        price: 109,
        category: "Environment Art",
        duration: "10 Weeks",
        difficulty: "Intermediate",
        thumbnail: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop",
        status: "Published",
        enrolledCount: 98,
        createdAt: new Date(),
    }
];

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [trainers, setTrainers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        category: "Concept Art",
        duration: "",
        difficulty: "Beginner",
        thumbnail: "",
        trainerId: "",
        status: "Published",
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
        setSaving(true);
        try {
            if (editingCourse) {
                await updateDoc(doc(db, "courses", editingCourse.id), formData);
            } else {
                await addDoc(collection(db, "courses"), {
                    ...formData,
                    enrolledCount: 0,
                    createdAt: new Date(),
                });
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            fetchCourses();
        } catch (error) {
            console.error("Error saving course:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, "courses", id));
            setCourses(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    const handleSeed = async () => {
        if (confirm("This will add 4 demo courses to the database. Continue?")) {
            setLoading(true);
            try {
                for (const course of DEFAULT_COURSES) {
                    await addDoc(collection(db, "courses"), {
                        ...course,
                        trainerId: trainers[0]?.uid || "system", // Fallback to first trainer or system
                    });
                }
                await fetchCourses();
            } catch (error) {
                console.error("Error seeding courses:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const openCreateModal = () => {
        setEditingCourse(null);
        setFormData({ title: "", description: "", price: 0, category: "Concept Art", duration: "", difficulty: "Beginner", thumbnail: "", trainerId: "", status: "Published" });
        setIsModalOpen(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            price: course.price,
            category: course.category,
            duration: course.duration,
            difficulty: course.difficulty,
            thumbnail: course.thumbnail,
            trainerId: course.trainerId,
            status: course.status,
        });
        setIsModalOpen(true);
    };

    const filteredCourses = useMemo(() => {
        return courses.filter(c => {
            const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [courses, searchQuery, categoryFilter]);

    const categories = ["Concept Art", "Game Dev", "Animation", "Publishing"];

    const stats = useMemo(() => ({
        total: courses.length,
        published: courses.filter(c => c.status === "Published").length,
        draft: courses.filter(c => c.status === "Draft").length,
        totalEnrollments: courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0),
    }), [courses]);

    return (
        <RoleGuard allowedRoles={["admin", "moderator"]}>
            <DashboardLayout>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Course <span className="text-primary italic">Vault</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Manage Academy Curriculum
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSeed}
                            className="flex items-center gap-2 bg-secondary/10 text-secondary px-6 py-3 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all"
                        >
                            <RefreshCw size={16} />
                            Seed Defaults
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={16} />
                            New Course
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MiniStat icon={<BookOpen size={16} />} label="Total Courses" value={stats.total} color="text-primary" />
                    <MiniStat icon={<Eye size={16} />} label="Published" value={stats.published} color="text-emerald-500" />
                    <MiniStat icon={<Settings size={16} />} label="Drafts" value={stats.draft} color="text-amber-500" />
                    <MiniStat icon={<Users size={16} />} label="Enrollments" value={stats.totalEnrollments} color="text-cyan-500" />
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-border rounded-xl font-inter text-sm outline-none focus:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-3 bg-foreground/5 border border-border rounded-xl font-robot text-xs uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <motion.div
                                    layout
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
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
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className={`px-2 py-1 rounded-full font-robot text-[8px] uppercase font-bold ${course.status === "Published" ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-white"}`}>
                                                {course.status}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full font-robot text-[10px] uppercase font-bold text-primary">
                                            ${course.price}
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-robot text-lg font-bold uppercase text-foreground truncate flex-1">
                                            {course.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-2 py-1 bg-foreground/5 rounded-lg font-robot text-[9px] uppercase text-foreground/40">{course.category}</span>
                                        <span className="px-2 py-1 bg-foreground/5 rounded-lg font-robot text-[9px] uppercase text-foreground/40">{course.difficulty}</span>
                                        <span className="flex items-center gap-1 font-robot text-[9px] text-foreground/30">
                                            <Users size={10} /> {course.enrolledCount || 0}
                                        </span>
                                    </div>

                                    <p className="font-inter text-xs text-foreground/40 line-clamp-2 mb-6">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(course)}
                                                className="p-2.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-all"
                                                title="Edit Course"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            {deleteConfirm === course.id ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleDelete(course.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-[9px] uppercase">Delete</button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 border border-border rounded-lg text-[9px] uppercase">Cancel</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(course.id)}
                                                    className="p-2.5 rounded-xl border border-border hover:border-red-500 hover:text-red-500 transition-all"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <Link href={`/courses/${course.id}`} className="flex items-center gap-2 font-robot text-[10px] uppercase tracking-widest text-foreground/30 hover:text-primary transition-all">
                                            View <ExternalLink size={12} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredCourses.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-foreground/20">
                                <BookOpen size={48} className="mb-4 opacity-50" />
                                <p className="font-inter text-sm italic">
                                    {searchQuery || categoryFilter !== "all" ? "No courses match your criteria" : "No courses created yet"}
                                </p>
                            </div>
                        )}

                        <p className="mt-6 font-inter text-xs text-foreground/30 text-center">
                            Showing {filteredCourses.length} of {courses.length} courses
                        </p>
                    </>
                )}

                {/* Course Modal */}
                <Portal>
                    <AnimatePresence>
                        {isModalOpen && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
                                    className="relative bg-surface border border-border w-full max-w-2xl rounded-3xl p-8 overflow-y-auto max-h-[90vh] shadow-2xl"
                                >
                                    <h2 className="font-robot text-2xl font-bold uppercase tracking-tighter mb-6 flex items-center gap-3">
                                        {editingCourse ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                                        {editingCourse ? "Edit Course" : "Create New Course"}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <FormField label="Course Title" required>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    className="form-input"
                                                    placeholder="e.g. 3D Character Design"
                                                />
                                            </FormField>
                                            <FormField label="Price (USD)" required>
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                    className="form-input"
                                                    placeholder="99"
                                                />
                                            </FormField>
                                            <FormField label="Category">
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="form-input"
                                                >
                                                    {categories.map(cat => <option key={cat}>{cat}</option>)}
                                                </select>
                                            </FormField>
                                            <FormField label="Duration">
                                                <input
                                                    type="text"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                    className="form-input"
                                                    placeholder="e.g. 8 Weeks"
                                                />
                                            </FormField>
                                            <FormField label="Difficulty">
                                                <select
                                                    value={formData.difficulty}
                                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                                    className="form-input"
                                                >
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                            </FormField>
                                            <FormField label="Status">
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                                    className="form-input"
                                                >
                                                    <option>Published</option>
                                                    <option>Draft</option>
                                                </select>
                                            </FormField>
                                            <FormField label="Assigned Trainer" className="sm:col-span-2">
                                                <select
                                                    required
                                                    value={formData.trainerId}
                                                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                                                    className="form-input"
                                                >
                                                    <option value="">Select Trainer</option>
                                                    {trainers.map(t => (
                                                        <option key={t.uid} value={t.uid}>{t.displayName}</option>
                                                    ))}
                                                </select>
                                                {trainers.length === 0 && (
                                                    <p className="text-amber-500 text-[10px] mt-1">No trainers available. Assign user as trainer first.</p>
                                                )}
                                            </FormField>
                                        </div>
                                        <FormField label="Description" required>
                                            <textarea
                                                required
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                className="form-input resize-none"
                                                placeholder="Course synopsis..."
                                            />
                                        </FormField>
                                        <FormField label="Thumbnail URL">
                                            <input
                                                type="text"
                                                value={formData.thumbnail}
                                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                                className="form-input"
                                                placeholder="https://..."
                                            />
                                        </FormField>
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 bg-primary text-white py-3 rounded-xl font-robot text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {saving && <Loader2 size={14} className="animate-spin" />}
                                                {editingCourse ? "Update Course" : "Create Course"}
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
                </Portal>

                <style jsx>{`
                    .form-input {
                        width: 100%;
                        background: rgba(var(--foreground-rgb), 0.05);
                        border: 1px solid rgba(var(--foreground-rgb), 0.1);
                        border-radius: 12px;
                        padding: 12px 16px;
                        font-size: 14px;
                        outline: none;
                        transition: all 0.2s;
                    }
                    .form-input:focus {
                        border-color: var(--primary);
                    }
                `}</style>
            </DashboardLayout>
        </RoleGuard>
    );
}

function FormField({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 ml-1 flex items-center gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="glass p-4 rounded-2xl border border-border flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className={`font-robot text-xl font-bold ${color}`}>{value}</p>
                <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/40">{label}</p>
            </div>
        </div>
    );
}
