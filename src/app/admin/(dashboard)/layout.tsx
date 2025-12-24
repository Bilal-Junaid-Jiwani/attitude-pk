'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import CoolLoader from '@/components/ui/CoolLoader'; // Assuming this exists or use simple loader
import { Toaster } from 'react-hot-toast';

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
        fetch('/api/user/profile')
            .then(res => {
                if (res.status === 401) {
                    router.push('/admin/login');
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(user => {
                if (user.role !== 'admin') {
                    router.push('/'); // Kick non-admins out to home
                    // or router.push('/admin/login') with error?
                } else {
                    setAuthorized(true);
                }
            })
            .catch(() => {
                // Error handling moved inside fetch block for redirect
            });
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c524f]"></div>
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
