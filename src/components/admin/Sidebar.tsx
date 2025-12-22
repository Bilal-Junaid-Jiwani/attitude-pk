'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, ListOrdered, Droplets, Scale } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const MENU_ITEMS = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Products', icon: Package, href: '/admin/products' },
        { name: 'Categories', icon: ListOrdered, href: '/admin/categories' },
        { name: 'Fragrances', icon: Droplets, href: '/admin/fragrances' },
        { name: 'Formats', icon: Scale, href: '/admin/formats' },
        { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
        { name: 'Customers', icon: Users, href: '/admin/customers' },
        { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <aside className="w-64 bg-[#F5F6FA] border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0 h-full print:hidden">
            {/* Logo */}
            <div className="p-8">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                    ATTITUDE PK
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-[#6B9E78] text-white shadow-md shadow-green-900/10' // Active: Green with soft shadow
                                : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 mt-auto">
                <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                    <LogOut size={20} strokeWidth={1.5} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
