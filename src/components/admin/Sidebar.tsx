'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, ListOrdered, Droplets, Scale, ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileOpen: boolean;
    closeMobile: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, closeMobile }: SidebarProps) => {
    const pathname = usePathname();

    const MENU_ITEMS = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
        { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
        { name: 'Products', icon: Package, href: '/admin/products' },
        { name: 'Customers', icon: Users, href: '/admin/customers' },
        { name: 'Reviews', icon: Star, href: '/admin/reviews' },
        { name: 'Categories', icon: ListOrdered, href: '/admin/categories' },
        { name: 'Fragrances', icon: Droplets, href: '/admin/fragrances' },
        { name: 'Formats', icon: Scale, href: '/admin/formats' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
        { name: 'Staff Management', icon: Users, href: '/admin/staff' }, // Changed Icon manually if needed, Users is fine or Shield
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobile}
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 h-full bg-[#F5F6FA] border-r border-gray-100 flex flex-col transition-all duration-300 z-50 print:hidden
                    /* Desktop Styles */
                    hidden lg:flex
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    
                    /* Mobile Styles (Override hidden) */
                    ${isMobileOpen ? '!flex w-64 translate-x-0' : 'flex -translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header & Toggle */}
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {(!isCollapsed || isMobileOpen) && (
                        <h1 className="text-xl font-bold whitespace-nowrap text-gray-800">
                            ATTITUDE <span className="text-[#1c524f] hover:text-[#153e3c] transition-colors cursor-pointer text-sm ml-0.5">PK</span>
                        </h1>
                    )}

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    {/* Mobile Close Button */}
                    <button
                        onClick={closeMobile}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeMobile} // Close on mobile click
                                title={isCollapsed && !isMobileOpen ? item.name : ''}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-[#1c524f] text-white shadow-lg shadow-[#1c524f]/20'
                                    : 'text-gray-500 hover:bg-[#1c524f]/10 hover:text-[#1c524f]'
                                    } ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
                            >
                                <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                                {(!isCollapsed || isMobileOpen) && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 mt-auto border-t border-gray-100">
                    <button
                        onClick={async () => {
                            try {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/admin/login';
                            } catch (error) {
                                console.error('Logout failed', error);
                            }
                        }}
                        className={`flex items-center gap-3 px-3 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}
                        title={isCollapsed && !isMobileOpen ? "Logout" : ""}
                    >
                        <LogOut size={22} strokeWidth={1.5} className="flex-shrink-0" />
                        {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
