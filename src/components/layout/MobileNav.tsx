'use client';

import { Home, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function MobileNav() {
    const pathname = usePathname();
    const { cartCount, openCart } = useCart();

    // Don't show on Admin or Checkout
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) return null;

    const navItems = [
        { label: 'Home', icon: Home, href: '/' },
        { label: 'Search', icon: Search, href: '/search' },
        {
            label: 'Cart',
            icon: ShoppingBag,
            href: '#', // Prevents nav, we use onClick
            onClick: (e: any) => {
                e.preventDefault();
                openCart();
            },
            badge: cartCount
        },
        { label: 'Profile', icon: User, href: '/profile' }, // Or /login if not auth
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 z-40 pb-safe">
            <div className="flex justify-between items-center">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        onClick={item.onClick}
                        className={`flex flex-col items-center gap-1 ${pathname === item.href ? 'text-[#008060]' : 'text-gray-500'}`}
                    >
                        <div className="relative">
                            <item.icon size={24} strokeWidth={pathname === item.href ? 2.5 : 2} />
                            {item.badge ? (
                                <span className="absolute -top-1 -right-2 bg-[#008060] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {item.badge}
                                </span>
                            ) : null}
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
