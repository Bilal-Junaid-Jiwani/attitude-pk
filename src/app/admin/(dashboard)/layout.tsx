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
            />
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} print:ml-0`}>
                <Toaster position="top-right" />
                {children}
            </main>
        </div>
    );
}
