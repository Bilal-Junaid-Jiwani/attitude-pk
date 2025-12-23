'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, ListOrdered, Droplets, Scale, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
    const pathname = usePathname();

    const MENU_ITEMS = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
        { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
        { name: 'Products', icon: Package, href: '/admin/products' },
        { name: 'Customers', icon: Users, href: '/admin/customers' },
        { name: 'Categories', icon: ListOrdered, href: '/admin/categories' },
        { name: 'Fragrances', icon: Droplets, href: '/admin/fragrances' },
        { name: 'Formats', icon: Scale, href: '/admin/formats' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <aside
            className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#F5F6FA] border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0 h-full transition-all duration-300 z-50 print:hidden`}
        >
            {/* Header & Toggle */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
                    <h1 className="text-xl font-bold whitespace-nowrap text-gray-800">
                        ATTITUDE <span className="text-[#1c524f] hover:text-[#153e3c] transition-colors cursor-pointer">PK</span>
                    </h1>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-2 mt-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-[#1c524f] text-white shadow-lg shadow-[#1c524f]/20'
                                : 'text-gray-500 hover:bg-[#1c524f]/10 hover:text-[#1c524f]'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 mt-auto border-t border-gray-100">
                <button
                    className={`flex items-center gap-3 px-3 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut size={22} strokeWidth={1.5} className="flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
