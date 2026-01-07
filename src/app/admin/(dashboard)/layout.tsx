'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { Toaster } from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        // Double check auth & role on entry
        fetch('/api/admin/profile')
            .then(res => {
                if (res.status === 401) {
                    router.push('/admin/login');
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(user => {
                if (user.error) {
                    console.error("Profile fetch error:", user.error);
                    // Optionally set an error state here instead of authorized
                    return;
                }
                if (user.role !== 'admin' && user.role !== 'staff') {
                    router.push('/');
                } else {
                    setAuthorized(true);
                }
            })
            .catch((err) => {
                console.error("Profile fetch failed:", err);
            });
    }, [router]);

    // Heartbeat for Real-time Status
    useEffect(() => {
        if (!authorized) return;

        const beat = () => {
            fetch('/api/admin/heartbeat', { method: 'POST' }).catch(() => { });
        };

        // Beat immediately on load, then every 60s
        beat();
        const interval = setInterval(beat, 60000);
        return () => clearInterval(interval);
    }, [authorized]);

    if (!authorized) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar Skeleton */}
                <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen p-4 space-y-4">
                    <div className="h-8 w-32 bg-gray-100 rounded mb-8 animate-pulse" />
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-10 w-full bg-gray-50 rounded animate-pulse" />
                    ))}
                </div>
                {/* Content Skeleton */}
                <div className="flex-1 p-8 space-y-6">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-32 bg-white rounded-lg border border-gray-200 p-4 animate-pulse" />
                        <div className="h-32 bg-white rounded-lg border border-gray-200 p-4 animate-pulse" />
                        <div className="h-32 bg-white rounded-lg border border-gray-200 p-4 animate-pulse" />
                    </div>
                    <div className="h-96 bg-white rounded-lg border border-gray-200 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobileOpen={isMobileOpen}
                closeMobile={() => setIsMobileOpen(false)}
            />
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} w-full`}>

                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>
                        <h1 className="text-lg font-bold text-gray-800">
                            ATTITUDE <span className="text-[#1c524f]">PK</span>
                        </h1>
                    </div>
                </div>

                <Toaster position="top-right" />
                {children}
            </main>
        </div>
    );
}
