"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, where, addDoc, updateDoc } from "firebase/firestore";
import { Course, CourseModule } from "@/types";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import RoleGuard from "@/components/RoleGuard";
import {
    Play,
    CheckCircle2,
    ChevronRight,
    FileText,
    Link as LinkIcon,
    Video,
    MessageSquare,
    Loader2,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentLearningPage() {
    const { id } = useParams();
    const router = useRouter();
    const { profile } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
    const [loading, setLoading] = useState(true);

    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [attendanceRecord, setAttendanceRecord] = useState<any[]>([]);
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const [progressLoading, setProgressLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!id || !profile?.uid) return;
            try {
                // 1. Fetch Course Info
                const courseDoc = await getDoc(doc(db, "courses", id as string));
                if (!courseDoc.exists()) {
                    router.push("/dashboard");
                    return;
                }
                setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);

                // 2. Fetch Modules
                const qModules = query(
                    collection(db, "courseModules"),
                    where("courseId", "==", id),
                    orderBy("order", "asc")
                );
                const modulesSnap = await getDocs(qModules);
                const modulesData = modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseModule));
                setModules(modulesData);
                if (modulesData.length > 0) setActiveModule(modulesData[0]);

                // 3. Fetch Announcements
                const qAnn = query(
                    collection(db, "announcements"),
                    where("courseId", "==", id),
                    orderBy("createdAt", "desc")
                );
                const annSnap = await getDocs(qAnn);
                setAnnouncements(annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 4. Fetch Attendance for this user
                const qAtt = query(
                    collection(db, "attendance"),
                    where("courseId", "==", id),
                    where("uid", "==", profile.uid),
                    orderBy("date", "desc")
                );
                const attSnap = await getDocs(qAtt);
                setAttendanceRecord(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 5. Fetch User Progress
                const qProg = query(
                    collection(db, "userProgress"),
                    where("uid", "==", profile.uid),
                    where("courseId", "==", id)
                );
                const progSnap = await getDocs(qProg);
                if (!progSnap.empty) {
                    const progData = progSnap.docs[0].data() as any;
                    setCompletedModules(progData.completedModules || []);
                } else {
                    // Initialize progress doc
                    await addDoc(collection(db, "userProgress"), {
                        uid: profile.uid,
                        courseId: id,
                        completedModules: [],
                        lastAccessedAt: new Date()
                    });
                    setCompletedModules([]);
                }

            } catch (error) {
                console.error("Error fetching course data:", error);
            } finally {
                setLoading(false);
                setProgressLoading(false);
            }
        };

        if (profile?.enrolledCourses?.includes(id as string) || profile?.role === "admin") {
            fetchCourseData();
        } else if (profile) {
            router.push(`/courses/${id}`);
        }
    }, [id, profile, router]);

    const handleMarkComplete = async () => {
        if (!activeModule || !profile?.uid || !id) return;

        try {
            const isCompleted = completedModules.includes(activeModule.id);
            const newCompleted = isCompleted
                ? completedModules.filter(mid => mid !== activeModule.id)
                : [...completedModules, activeModule.id];

            setCompletedModules(newCompleted);

            // Update Firestore
            const q = query(
                collection(db, "userProgress"),
                where("uid", "==", profile.uid),
                where("courseId", "==", id)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
                await updateDoc(doc(db, "userProgress", snap.docs[0].id), {
                    completedModules: newCompleted,
                    lastAccessedAt: new Date()
                });
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    const progressPercentage = modules.length > 0
        ? Math.round((completedModules.length / modules.length) * 100)
        : 0;

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <RoleGuard allowedRoles={["user", "trainer", "moderator", "admin"]}>
            <DashboardLayout>
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 min-h-[calc(100vh-160px)]">

                    {/* Video / Content Player (Left) */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="aspect-video bg-black rounded-[40px] overflow-hidden border border-border shadow-2xl relative group">
                            {activeModule?.videoUrl ? (
                                <iframe
                                    src={activeModule.videoUrl.replace("watch?v=", "embed/")}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/20 space-y-4">
                                    <Video size={64} strokeWidth={1} />
                                    <div className="text-center">
                                        <p className="font-robot text-[10px] uppercase tracking-[0.2em] font-bold">Signal Not Found / Processing</p>
                                        <p className="font-inter text-[9px] text-foreground/10 mt-1 uppercase">Awaiting encrypted transmission from trainer</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass p-10 rounded-[40px] border border-border">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-8 h-px bg-primary rounded-full" />
                                        <span className="font-robot text-[10px] uppercase tracking-[0.4em] text-primary font-bold block">
                                            Segment 0{activeModule?.order || 1}
                                        </span>
                                    </div>
                                    <h1 className="font-robot text-4xl font-bold uppercase tracking-tighter text-foreground leading-[0.85]">
                                        {activeModule?.title || "Project Initialization"}
                                    </h1>
                                </div>
                                <button
                                    onClick={handleMarkComplete}
                                    className={`flex items-center gap-2 px-6 py-4 rounded-xl font-robot text-[10px] uppercase tracking-widest font-bold border transition-all shadow-xl ${completedModules.includes(activeModule?.id || "")
                                        ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20"
                                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                                        }`}>
                                    <CheckCircle2 size={16} />
                                    {completedModules.includes(activeModule?.id || "") ? "Completed" : "Mark Complete"}
                                </button>
                            </div>

                            {/* Meeting Link */}
                            {activeModule?.meetingLink && (
                                <a
                                    href={activeModule.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mb-8 flex items-center gap-3 px-6 py-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl hover:bg-blue-500/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse">
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <p className="font-robot text-xs uppercase tracking-widest font-bold text-blue-500">Live Session Available</p>
                                        <p className="font-inter text-[10px] text-foreground/40 group-hover:text-foreground/60 transition-colors">Click to join the live class meeting</p>
                                    </div>
                                    <ChevronRight size={20} className="ml-auto text-blue-500 group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}

                            <div className="font-inter text-base text-foreground/50 leading-relaxed max-w-4xl">
                                {activeModule?.content || "No detailed dossier provided for this operation. Contact your trainer for specific logistical inquiries."}
                            </div>

                            {/* Resources Section */}
                            {activeModule?.resources && activeModule.resources.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-border">
                                    <h4 className="font-robot text-xs uppercase tracking-widest text-foreground/40 font-bold mb-4 flex items-center gap-2">
                                        <FileText size={14} className="text-primary" /> Downloadable Resources
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {activeModule.resources.map((res, i) => (
                                            <a
                                                key={i}
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-4 bg-foreground/5 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-robot text-xs uppercase tracking-widest font-bold text-foreground truncate">{res.name}</p>
                                                    <p className="font-inter text-[10px] text-foreground/30">Click to download</p>
                                                </div>
                                                <LinkIcon size={14} className="text-foreground/20 group-hover:text-primary transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Attendance Widget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass p-8 rounded-[40px] border border-border">
                                <h3 className="font-robot text-xs uppercase tracking-widest text-foreground/40 font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-500" /> Attendance Archive
                                </h3>
                                <div className="space-y-4">
                                    {attendanceRecord.slice(0, 3).map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-2xl border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${att.status === 'Present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <span className="font-inter text-xs text-foreground/60">{new Date(att.date.seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`font-robot text-[9px] uppercase font-bold tracking-widest ${att.status === 'Present' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {att.status}
                                            </span>
                                        </div>
                                    ))}
                                    {attendanceRecord.length === 0 && (
                                        <p className="text-center font-inter text-[10px] text-foreground/20 italic p-6">No participation records located.</p>
                                    )}
                                </div>
                            </div>

                            <div className="glass p-8 rounded-[40px] border border-border">
                                <h3 className="font-robot text-xs uppercase tracking-widest text-foreground/40 font-bold mb-6 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-primary" /> Sector Communication
                                </h3>
                                <div className="space-y-4">
                                    {announcements.slice(0, 2).map((ann) => (
                                        <div key={ann.id} className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <p className="font-robot text-[10px] uppercase font-bold text-primary mb-1">{ann.title}</p>
                                            <p className="font-inter text-[11px] text-foreground/50 line-clamp-2">{ann.content}</p>
                                        </div>
                                    ))}
                                    {announcements.length === 0 && (
                                        <p className="text-center font-inter text-[10px] text-foreground/20 italic p-6">Airwaves are currently silent.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Module List (Right) */}
                    <div className="lg:col-span-4 bg-background border border-border rounded-[32px] overflow-hidden flex flex-col h-full max-h-[calc(100vh-160px)] shadow-xl">
                        <div className="p-6 border-b border-border bg-foreground/[0.02]">
                            <h3 className="font-robot text-sm uppercase tracking-[0.2em] font-bold text-foreground">Mission Syllabus</h3>
                            <p className="font-robot text-[10px] text-foreground/30 mt-1 uppercase">{modules.length} Segments Identified</p>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {modules.length === 0 ? (
                                <div className="p-10 text-center space-y-4">
                                    <Lock size={32} className="mx-auto text-foreground/10" />
                                    <p className="font-inter text-xs text-foreground/30 italic">Curriculum is currently encrypted or pending deployment.</p>
                                </div>
                            ) : (
                                modules.map((m, i) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setActiveModule(m)}
                                        className={`w-full text-left p-6 border-b border-border transition-all flex gap-4 group ${activeModule?.id === m.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-foreground/[0.01]"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-robot text-xs font-bold transition-all ${activeModule?.id === m.id ? "bg-primary text-white" : "bg-foreground/5 text-foreground/20 group-hover:bg-foreground/10"
                                            }`}>
                                            0{m.order || i + 1}
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            <p className={`font-robot text-[11px] uppercase tracking-widest font-bold truncate transition-all ${activeModule?.id === m.id ? "text-primary" : "text-foreground/60"
                                                }`}>
                                                {m.title}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 font-inter text-[9px] text-foreground/30">
                                                    <Play size={8} /> 12:45
                                                </span>
                                                {completedModules.includes(m.id) && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                        <span className="font-inter text-[9px] text-emerald-500 uppercase font-bold">Completed</span>
                                                    </>
                                                )}
                                                {!completedModules.includes(m.id) && m.videoUrl && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-foreground/10" />
                                                        <span className="font-inter text-[9px] text-foreground/30 uppercase">Deployment</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-foreground/[0.03] border-t border-border">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-robot text-[9px] uppercase tracking-widest text-foreground/40 font-bold">Progression</span>
                                <span className="font-robot text-[9px] uppercase text-primary font-bold">{progressPercentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RoleGuard>
    );
}
