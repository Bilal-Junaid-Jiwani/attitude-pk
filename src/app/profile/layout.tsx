'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, LogOut, ChevronRight, Heart, MapPin, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

const SIDEBAR_LINKS = [
    { label: 'My Profile', href: '/profile', icon: User },
    { label: 'Order History', href: '/profile/orders', icon: Package },
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
    { label: 'Address Book', href: '/profile/addresses', icon: MapPin },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { addToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Checking auth status via profile endpoint
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            addToast('Logged out successfully', 'success');
            router.push('/login');
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed', error);
            router.push('/login');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c524f]"></div>
            </div>
        );
    }

    // Guest Layout (No Sidebar, No Header)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-[#6D6D6D] hover:text-[#1c524f] transition-colors gap-2 text-sm font-medium mb-8">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>
                    {children}
                </div>
            </div>
        );
    }

    // Authenticated Layout
    return (
        <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Mobile Header / Title */}
                <div className="mb-8 md:mb-12">
                    <Link href="/" className="inline-flex items-center text-[#6D6D6D] hover:text-[#1c524f] transition-colors gap-2 text-sm font-medium mb-4">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-[#1c524f]">My Account</h1>
                    <p className="text-gray-500 mt-2">Manage your details and view your orders.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <nav className="p-3 space-y-1">
                                {SIDEBAR_LINKS.map((link) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                                ? 'bg-[#1c524f]/10 text-[#1c524f]'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon size={20} className={isActive ? 'text-[#1c524f]' : 'text-gray-400'} />
                                            {link.label}
                                        </Link>
                                    );
                                })}

                                <hr className="my-2 border-gray-100" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
