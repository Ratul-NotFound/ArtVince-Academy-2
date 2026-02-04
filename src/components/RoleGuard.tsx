"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { UserRole } from "@/types";

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: UserRole[];
    redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo = "/login" }: RoleGuardProps) {
    const { userRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!userRole || !allowedRoles.includes(userRole)) {
                router.push(redirectTo);
            }
        }
    }, [userRole, loading, allowedRoles, redirectTo, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
            </div>
        );
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        return null;
    }

    return <>{children}</>;
}
