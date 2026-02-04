export type UserRole = "user" | "trainer" | "moderator" | "admin";

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    enrolledCourses?: string[]; // Course IDs
    bio?: string;
    studio?: string;
    location?: string;
    website?: string;
    createdAt: any;
    updatedAt?: any;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    trainerId: string;
    moderatorId?: string;
    category: string;
    thumbnail: string;
    duration: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    status: "Draft" | "Published";
    enrolledCount: number;
    createdAt: any;
}

export interface CourseModule {
    id: string;
    courseId: string;
    title: string;
    videoUrl?: string; // Link to video (YouTube/Vimeo/Google Drive)
    content?: string; // Markdown/HTML content
    resources?: { name: string, url: string }[];
    meetingLink?: string;
    order: number;
}

export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface EnrollmentRequest {
    id: string;
    uid: string;
    courseId: string;
    courseName: string;
    coursePrice: number;
    studentName: string;
    mobileNumber: string;
    email: string;
    paymentMethod: "bKash" | "Nagad" | "Rocket";
    transactionId: string;
    sendingNumber: string;
    screenshotUrl?: string;
    status: EnrollmentStatus;
    requestedAt: any;
    processedAt?: any;
    processedBy?: string; // Admin/Moderator UID
}

export interface Attendance {
    id: string;
    uid: string;
    courseId: string;
    moduleId: string;
    status: "Present" | "Absent";
    date: any;
}

export interface Announcement {
    id: string;
    courseId: string | "global";
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    targetRole?: UserRole;
    createdAt: any;
}
export interface UserProgress {
    id?: string;
    uid: string;
    courseId: string;
    completedModules: string[]; // Array of CourseModule IDs
    lastAccessedAt: any;
}

export type NotificationType = "enrollment_approved" | "enrollment_rejected" | "announcement" | "module_added" | "course_update";

export interface Notification {
    id: string;
    uid: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: any;
}

