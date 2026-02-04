"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, query as fsQuery } from "firebase/firestore";
import { Course, UserProfile } from "@/types";
import { motion } from "framer-motion";
import { ClipboardList, Users, CheckCircle, XCircle, Loader2, Calendar as CalendarIcon, Save, Search } from "lucide-react";

export default function TrainerAttendancePage() {
    const { user, profile } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [attendance, setAttendance] = useState<Record<string, "Present" | "Absent">>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchTrainerCourses = async () => {
            if (!user) return;
            try {
                let q;
                if (profile?.role === "admin" || profile?.role === "moderator") {
                    q = query(collection(db, "courses"));
                } else {
                    q = query(collection(db, "courses"), where("trainerId", "==", user.uid));
                }
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(data);
                if (data.length > 0) handleCourseSelect(data[0]);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainerCourses();
    }, [user]);

    const handleCourseSelect = async (course: Course) => {
        setSelectedCourse(course);
        setLoading(true);
        try {
            // Find users where enrolledCourses contains this course ID
            const q = query(collection(db, "users"), where("enrolledCourses", "array-contains", course.id));
            const querySnapshot = await getDocs(q);
            const studentData = querySnapshot.docs.map(doc => doc.data() as UserProfile);
            setStudents(studentData);

            // Initialize attendance
            const initial: Record<string, "Present" | "Absent"> = {};
            studentData.forEach(s => initial[s.uid] = "Present");
            setAttendance(initial);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedCourse || !user) return;
        setSaving(true);
        try {
            const attendanceRef = collection(db, "attendance");
            const batch = Object.entries(attendance).map(([uid, status]) => {
                return addDoc(attendanceRef, {
                    uid,
                    courseId: selectedCourse.id,
                    status,
                    date: new Date(sessionDate),
                    trainerId: user.uid,
                    createdAt: new Date(),
                });
            });
            await Promise.all(batch);
            alert("Attendance Dossier Committed.");
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert("Commit Failure.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <RoleGuard allowedRoles={["trainer", "admin", "moderator"]}>
            <DashboardLayout>
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground">
                            Attendance <span className="text-primary italic">Log</span>
                        </h1>
                        <p className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
                            Monitor student presence and operational participation
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-foreground/5 p-2 rounded-2xl border border-border">
                        <CalendarIcon size={16} className="text-primary ml-2" />
                        <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="bg-transparent font-robot text-[10px] uppercase tracking-widest font-bold text-foreground outline-none px-2 py-1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Course Selection */}
                    <div className="space-y-4">
                        <span className="font-robot text-[10px] uppercase tracking-widest text-foreground/30 px-2 block">Assigned Sectors</span>
                        {courses.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => handleCourseSelect(c)}
                                className={`w-full text-left p-6 rounded-3xl border transition-all ${selectedCourse?.id === c.id
                                    ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10"
                                    : "glass border-border text-foreground/50 hover:border-primary/30"
                                    }`}
                            >
                                <span className="font-robot text-[9px] uppercase tracking-widest opacity-40 block mb-1">{c.category}</span>
                                <h3 className="font-robot text-sm font-bold uppercase tracking-tight">{c.title}</h3>
                            </button>
                        ))}
                    </div>

                    {/* Student List */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-20 text-primary">
                                <Loader2 className="animate-spin" size={40} />
                            </div>
                        ) : selectedCourse ? (
                            <div className="glass rounded-[40px] border border-border overflow-hidden">
                                <div className="p-8 border-b border-border bg-foreground/[0.02] flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Users size={20} className="text-primary" />
                                        <h2 className="font-robot text-xl font-bold uppercase tracking-tighter">Student Registry</h2>
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-robot text-[9px] font-bold">{students.length} Operatives</span>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || students.length === 0}
                                        className="bg-primary text-white px-8 py-3 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Commit Log
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-foreground/5 font-robot text-[9px] uppercase tracking-widest text-foreground/30">
                                                <th className="px-8 py-4">Identity</th>
                                                <th className="px-8 py-4">Email</th>
                                                <th className="px-8 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((s) => (
                                                <tr key={s.uid} className="border-b border-border hover:bg-foreground/[0.01] transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                {s.displayName?.[0] || "A"}
                                                            </div>
                                                            <span className="font-robot text-xs font-bold uppercase text-foreground">{s.displayName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="font-inter text-xs text-foreground/40">{s.email}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => setAttendance({ ...attendance, [s.uid]: "Present" })}
                                                                className={`p-2 rounded-lg transition-all ${attendance[s.uid] === "Present"
                                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                                    : "bg-foreground/5 text-foreground/20 hover:text-emerald-500"
                                                                    }`}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setAttendance({ ...attendance, [s.uid]: "Absent" })}
                                                                className={`p-2 rounded-lg transition-all ${attendance[s.uid] === "Absent"
                                                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                                                    : "bg-foreground/5 text-foreground/20 hover:text-red-500"
                                                                    }`}
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {students.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                                        <Search size={40} className="text-foreground/10" />
                                        <p className="font-inter text-sm text-foreground/30 italic">No operatives detected in this sector.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 text-foreground/20 italic">
                                <ClipboardList size={64} className="mb-4 opacity-30" />
                                Select a sector to begin monitoring.
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
