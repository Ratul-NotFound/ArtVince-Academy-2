"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { UserProfile, UserRole } from "@/types";
import { Loader2, Shield, User as UserIcon, Mail, Calendar, ShieldAlert, Search, Trash2, X, Filter, Download, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const handleDeleteUser = async (uid: string) => {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, "users", uid));
            setUsers(prev => prev.filter(u => u.uid !== uid));
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setDeleting(false);
        }
    };

    const roles: UserRole[] = ["user", "trainer", "moderator", "admin"];

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = !searchQuery ||
                u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === "all" || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === "admin").length,
        trainers: users.filter(u => u.role === "trainer").length,
        moderators: users.filter(u => u.role === "moderator").length,
        students: users.filter(u => u.role === "user").length,
    }), [users]);

    return (
        <RoleGuard allowedRoles={["admin"]}>
            <DashboardLayout>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            User <span className="text-primary italic">Intelligence</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Platform Access Control & Role Assignment
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <MiniStat label="Total" value={stats.total} color="text-foreground" />
                    <MiniStat label="Admins" value={stats.admins} color="text-red-500" />
                    <MiniStat label="Trainers" value={stats.trainers} color="text-cyan-500" />
                    <MiniStat label="Moderators" value={stats.moderators} color="text-purple-500" />
                    <MiniStat label="Students" value={stats.students} color="text-foreground/50" />
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-foreground/5 border border-border rounded-xl font-inter text-sm outline-none focus:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
                            className="appearance-none pl-4 pr-10 py-3 bg-foreground/5 border border-border rounded-xl font-robot text-xs uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admins</option>
                            <option value="trainer">Trainers</option>
                            <option value="moderator">Moderators</option>
                            <option value="user">Students</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-primary">
                        <Loader2 className="animate-spin" size={40} />
                    </div>
                ) : (
                    <div className="glass rounded-3xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-foreground/5 font-robot text-[10px] uppercase tracking-widest text-foreground/40">
                                        <th className="px-6 py-5">Identity</th>
                                        <th className="px-6 py-5">Current Role</th>
                                        <th className="px-6 py-5 text-center">Assign Role</th>
                                        <th className="px-6 py-5">Joined</th>
                                        <th className="px-6 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <motion.tr
                                            key={u.uid}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-border group hover:bg-foreground/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20">
                                                        {u.photoURL ? (
                                                            <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="text-primary" size={18} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-robot text-sm font-bold uppercase tracking-tight text-foreground truncate max-w-[200px]">
                                                            {u.displayName || "Unknown Agent"}
                                                        </p>
                                                        <p className="font-inter text-xs text-foreground/30 flex items-center gap-1">
                                                            <Mail size={10} /> {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-robot text-[10px] uppercase font-bold ${u.role === "admin" ? "bg-red-500/10 text-red-500" :
                                                    u.role === "moderator" ? "bg-purple-500/10 text-purple-500" :
                                                        u.role === "trainer" ? "bg-cyan-500/10 text-cyan-500" :
                                                            "bg-foreground/10 text-foreground/40"
                                                    }`}>
                                                    <Shield size={12} />
                                                    {u.role}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-1">
                                                    {roles.map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => handleRoleChange(u.uid, role)}
                                                            className={`px-2.5 py-1 rounded-lg font-robot text-[8px] uppercase tracking-widest transition-all ${u.role === role
                                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                                : "border border-border text-foreground/30 hover:border-primary hover:text-primary"
                                                                }`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-inter text-xs text-foreground/30 flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center">
                                                    {deleteConfirm === u.uid ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleDeleteUser(u.uid)}
                                                                disabled={deleting}
                                                                className="px-3 py-1 bg-red-500 text-white rounded-lg font-robot text-[9px] uppercase tracking-widest hover:bg-red-600 disabled:opacity-50"
                                                            >
                                                                {deleting ? <Loader2 size={12} className="animate-spin" /> : "Confirm"}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-3 py-1 border border-border rounded-lg font-robot text-[9px] uppercase tracking-widest hover:bg-foreground/5"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(u.uid)}
                                                            className="p-2 rounded-lg text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="py-16 flex flex-col items-center justify-center text-foreground/20 italic font-inter text-sm">
                                <ShieldAlert size={40} className="mb-4 opacity-50" />
                                {searchQuery || roleFilter !== "all"
                                    ? "No users match your search criteria..."
                                    : "No users found in the neural network..."}
                            </div>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && (
                    <p className="mt-4 font-inter text-xs text-foreground/30 text-center">
                        Showing {filteredUsers.length} of {users.length} users
                    </p>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="glass p-4 rounded-2xl border border-border text-center">
            <p className={`font-robot text-2xl font-bold ${color}`}>{value}</p>
            <p className="font-robot text-[9px] uppercase tracking-widest text-foreground/40">{label}</p>
        </div>
    );
}
