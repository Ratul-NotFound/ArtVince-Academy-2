"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { UserProfile, UserRole } from "@/types";
import { Loader2, Shield, User as UserIcon, Mail, Calendar, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

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
            fetchUsers();
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const roles: UserRole[] = ["user", "trainer", "moderator", "admin"];

    return (
        <RoleGuard allowedRoles={["admin"]}>
            <DashboardLayout>
                <div className="mb-10">
                    <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                        User <span className="text-primary italic">Intelligence</span>
                    </h1>
                    <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                        Platform Access Control & Role Assignment
                    </p>
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
                                        <th className="px-8 py-6">Identity</th>
                                        <th className="px-8 py-6">Current Role</th>
                                        <th className="px-8 py-6 text-center">Assign Role</th>
                                        <th className="px-8 py-6">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <motion.tr
                                            key={u.uid}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-border group hover:bg-foreground/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
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
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-robot text-[10px] uppercase font-bold ${u.role === "admin" ? "bg-red-500/10 text-red-500" :
                                                        u.role === "moderator" ? "bg-purple-500/10 text-purple-500" :
                                                            u.role === "trainer" ? "bg-cyan-500/10 text-cyan-500" :
                                                                "bg-foreground/10 text-foreground/40"
                                                    }`}>
                                                    <Shield size={12} />
                                                    {u.role}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {roles.map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => handleRoleChange(u.uid, role)}
                                                            className={`px-3 py-1 rounded-lg font-robot text-[9px] uppercase tracking-widest transition-all ${u.role === role
                                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                                    : "border border-border text-foreground/30 hover:border-primary hover:text-primary"
                                                                }`}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-inter text-xs text-foreground/30 flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-foreground/20 italic font-inter text-sm">
                                <ShieldAlert size={40} className="mb-4 opacity-50" />
                                No users found in the neural network...
                            </div>
                        )}
                    </div>
                )}
            </DashboardLayout>
        </RoleGuard>
    );
}
