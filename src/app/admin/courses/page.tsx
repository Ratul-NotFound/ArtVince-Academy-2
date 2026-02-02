"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { Plus, Trash2, Edit2, X } from "lucide-react";

interface Course {
    id: string;
    title: string;
    category: string;
    price: string;
    image: string;
}

export default function AdminCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: "", category: "", price: "", image: "" });

    const fetchCourses = async () => {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesList);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        await addDoc(collection(db, "courses"), newCourse);
        setIsModalOpen(false);
        setNewCourse({ title: "", category: "", price: "", image: "" });
        fetchCourses();
    };

    const handleSeed = async () => {
        const seedData = [
            { id: "char-design-01", title: "AAA Character Design", category: "Game Art", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop", price: "$199" },
            { id: "animation-01", title: "3D Animation Masterclass", category: "Animation", image: "https://images.unsplash.com/photo-1616440802342-e1d0294f3655?q=80&w=2047&auto=format&fit=crop", price: "$249" },
            { id: "weapon-design-01", title: "Weapon & Hard Surface", category: "3D Modeling", image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop", price: "$179" },
            { id: "game-dev-01", title: "Game-Centric Web Dev", category: "Development", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop", price: "$159" }
        ];
        for (const data of seedData) {
            await setDoc(doc(db, "courses", data.id), data);
        }
        fetchCourses();
        alert("Database Seeded!");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            await deleteDoc(doc(db, "courses", id));
            fetchCourses();
        }
    };

    return (
        <DashboardLayout adminOnly>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">Manage Courses</h1>
                    <p className="text-foreground/40 font-inter">Add, edit or remove courses from the platform.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSeed}
                        className="border border-primary/20 bg-primary/5 px-6 py-3 rounded-lg font-robot font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all transition-colors duration-300"
                    >
                        Seed Data
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary px-6 py-3 rounded-lg font-robot font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Course
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-foreground">
                {courses.map((course) => (
                    <div key={course.id} className="glass p-6 rounded-xl flex items-center justify-between border border-border">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-foreground/5 rounded-lg overflow-hidden relative">
                                <img src={course.image} alt="" className="object-cover fill" />
                            </div>
                            <div>
                                <h3 className="font-robot font-bold text-xl uppercase">{course.title}</h3>
                                <p className="text-primary font-robot text-xs uppercase tracking-widest">{course.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <span className="font-robot font-bold text-xl">{course.price}</span>
                            <div className="flex gap-2">
                                <button className="p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 text-foreground"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(course.id)} className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-surface border border-border p-10 rounded-2xl w-full max-w-md relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-foreground/40 hover:text-foreground">
                            <X size={24} />
                        </button>
                        <h2 className="font-robot text-2xl font-bold uppercase mb-8">Add New Course</h2>
                        <form onSubmit={handleAddCourse} className="space-y-6">
                            <div>
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-2">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:border-primary transition-all text-foreground"
                                />
                            </div>
                            <div>
                                <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-2">Category</label>
                                <input
                                    required
                                    type="text"
                                    value={newCourse.category}
                                    onChange={e => setNewCourse({ ...newCourse, category: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:border-primary transition-all text-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-2">Price</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCourse.price}
                                        onChange={e => setNewCourse({ ...newCourse, price: e.target.value })}
                                        placeholder="$0.00"
                                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                                <div>
                                    <label className="font-robot text-[10px] uppercase tracking-widest text-foreground/40 block mb-2">Image URL</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCourse.image}
                                        onChange={e => setNewCourse({ ...newCourse, image: e.target.value })}
                                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 outline-none focus:border-primary transition-all text-foreground"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary py-4 rounded-lg font-robot font-bold uppercase tracking-widest mt-4">
                                Create Course
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
