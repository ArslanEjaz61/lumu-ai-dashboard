"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isLoading } = useAuth();
    const pathname = usePathname();

    // Public routes that don't need sidebar
    const isPublicRoute = pathname === '/login';

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Public route - no sidebar/header
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Protected route - show sidebar/header only if logged in
    if (!isLoggedIn) {
        return null; // AuthContext will redirect to login
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:ml-64">
                <Header />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
    );
}
