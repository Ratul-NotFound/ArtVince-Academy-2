"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Plus, Trash2, Edit2, Image as ImageIcon, Save, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShowcaseItem {
    id: string;
    title: string;
    artist: string;
    image: string;
    category: string;
    span: string; // "md:col-span-2 md:row-span-2", "md:col-span-1 md:row-span-1", etc.
}

const DEFAULT_ITEMS = [
    {
        title: "Cybernetic Samurai",
        artist: "Student Project - Leo K.",
        image: "https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=2070&auto=format&fit=crop",
        category: "3D Character Art",
        span: "md:col-span-2 md:row-span-2",
    },
    {
        title: "The Last Outpost",
        artist: "Mentor Demo - Sarah J.",
        image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop",
        category: "Environment Design",
        span: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Tactical Weapons",
        artist: "Student Project - Mark R.",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2047&auto=format&fit=crop",
        category: "Hard Surface Modeling",
        span: "md:col-span-1 md:row-span-1",
    },
    {
        title: "Neon City VFX",
        artist: "Technical Art - Alex B.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop",
        category: "Shaders & VFX",
        span: "md:col-span-2 md:row-span-1",
    },
];

export default function ManageShowcasePage() {
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ShowcaseItem | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        artist: "",
        image: "",
        category: "",
        span: "md:col-span-1 md:row-span-1"
    });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "showcase"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedItems = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ShowcaseItem));
            setItems(fetchedItems);
        } catch (error) {
            console.error("Error fetching showcase items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSave = async () => {
        try {
            const dataToSave = {
                ...formData,
                updatedAt: serverTimestamp(),
            };

            if (editingItem) {
                await updateDoc(doc(db, "showcase", editingItem.id), dataToSave);
            } else {
                await addDoc(collection(db, "showcase"), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
            setEditingItem(null);
            setFormData({ title: "", artist: "", image: "", category: "", span: "md:col-span-1 md:row-span-1" });
            fetchItems();
        } catch (error) {
            console.error("Error saving item:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this item?")) {
            try {
                await deleteDoc(doc(db, "showcase", id));
                fetchItems();
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        }
    };

    const handleEdit = (item: ShowcaseItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            artist: item.artist,
            image: item.image,
            category: item.category,
            span: item.span
        });
        setIsModalOpen(true);
    };

    const handleSeed = async () => {
        if (confirm("This will add default items to the database. Continue?")) {
            try {
                for (const item of DEFAULT_ITEMS) {
                    await addDoc(collection(db, "showcase"), {
                        ...item,
                        createdAt: serverTimestamp()
                    });
                }
                fetchItems();
            } catch (error) {
                console.error("Error seeding data:", error);
            }
        }
    };

    return (
        <RoleGuard allowedRoles={["admin", "moderator"]}>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-robot text-3xl font-bold uppercase tracking-tighter text-foreground">
                            Student <span className="text-primary italic">Showcase</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Manage the gallery of student work
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSeed}
                            className="bg-secondary/10 text-secondary px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest hover:bg-secondary/20 transition-all flex items-center gap-2"
                        >
                            <RefreshCw size={14} /> Seed Defaults
                        </button>
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setFormData({ title: "", artist: "", image: "", category: "", span: "md:col-span-1 md:row-span-1" });
                                setIsModalOpen(true);
                            }}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                            <Plus size={14} /> Add New Item
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-foreground/30">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.length === 0 && (
                            <div className="col-span-full text-center py-20 border-2 border-dashed border-border rounded-3xl">
                                <p className="text-foreground/30 font-inter">No items found. Click "Seed Defaults" to get started.</p>
                            </div>
                        )}
                        {items.map((item) => (
                            <div key={item.id} className="glass rounded-2xl overflow-hidden group border border-border hover:border-primary/30 transition-all">
                                <div className="relative h-48">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(item)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-md">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-500 backdrop-blur-md">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-robot font-bold text-foreground text-lg uppercase">{item.title}</h3>
                                            <p className="font-inter text-xs text-foreground/50">{item.artist}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">
                                            {item.category}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest bg-foreground/5 text-foreground/40 px-2 py-1 rounded">
                                            {item.span.includes("col-span-2") ? "Large" : "Regular"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit/Add Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-surface border border-border w-full max-w-lg rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-robot text-2xl font-bold uppercase tracking-tighter text-foreground">
                                        {editingItem ? "Edit Item" : "New Item"}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-foreground/40 hover:text-foreground">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4 font-inter">
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-foreground/40 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                                            placeholder="e.g. Cybernetic Samurai"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-foreground/40 mb-1">Artist Name</label>
                                        <input
                                            type="text"
                                            value={formData.artist}
                                            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                                            placeholder="e.g. Student Project - Leo K."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-foreground/40 mb-1">Image URL</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={formData.image}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            {formData.image && (
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-foreground/5 flex-shrink-0">
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-foreground/40 mb-1">Category</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                                            placeholder="e.g. 3D Character Art"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-foreground/40 mb-1">Layout Size</label>
                                        <select
                                            value={formData.span}
                                            onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                                            className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                                        >
                                            <option value="md:col-span-1 md:row-span-1">Regular (1x1)</option>
                                            <option value="md:col-span-2 md:row-span-1">Wide (2x1)</option>
                                            <option value="md:col-span-1 md:row-span-2">Tall (1x2)</option>
                                            <option value="md:col-span-2 md:row-span-2">Large (2x2)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl border border-border text-foreground hover:bg-foreground/5 text-xs uppercase font-bold tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> Save Item
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </DashboardLayout>
        </RoleGuard>
    );
}
