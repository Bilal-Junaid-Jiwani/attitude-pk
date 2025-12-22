'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);
    const { cartCount } = useCart();

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleMobileSubMenu = (label: string) => {
        setMobileSubMenu(mobileSubMenu === label ? null : label);
    }

    return (
        <nav className="sticky top-0 z-50 w-full glass transition-all duration-300 border-y-[4px] border-[#1c524f]">
            {/* Top Banner */}
            <div className="bg-primary text-white text-xs font-medium py-2 text-center tracking-wider">
                FREE SHIPPING ON ORDERS OVER RS. 5000 | PURE & NATURAL
            </div>

            <div className="w-full px-6 lg:px-12">
                <div className="flex justify-between items-center h-20"> {/* Increased height for premium feel */}
                    {/* Data Order: 1. Hamburger (Mobile) 2. Logo 3. Desktop Links 4. Icons */}

                    {/* Mobile Hamburger */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-600 hover:text-primary p-2 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
                        <Link href="/" className="text-3xl font-heading font-bold tracking-tight text-gray-900 group">
                            ATTITUDE <span className="text-primary group-hover:text-green-700 transition-colors">PK</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8 items-center justify-center flex-1">
                        {NAV_LINKS.map((link) => (
                            <div key={link.label} className="relative group">
                                <Link
                                    href={link.href}
                                    className="flex items-center text-sm font-bold text-gray-700 hover:text-primary tracking-wide transition-colors py-2"
                                >
                                    {link.label}
                                    {link.isDropdown && <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform duration-200" />}
                                </Link>

                                {/* Desktop Dropdown */}
                                {link.isDropdown && link.subCategories && (
                                    <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-b-md opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                                        <div className="py-2">
                                            {link.subCategories.map((sub) => (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-600 hover:text-primary transition-colors p-2">
                            <Search size={22} className="stroke-[1.5]" />
                        </button>
                        <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors p-2 hidden sm:block">
                            <User size={22} className="stroke-[1.5]" />
                        </Link>
                        <Link href="/cart" className="text-gray-600 hover:text-primary transition-colors p-2 relative">
                            <ShoppingBag size={22} className="stroke-[1.5]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto z-50">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {NAV_LINKS.map((link) => (
                            <div key={link.label}>
                                <div className="flex justify-between items-center">
                                    <Link
                                        href={link.href}
                                        className="block px-3 py-4 text-base font-medium text-gray-700 hover:text-primary transition-colors flex-1"
                                        onClick={() => !link.isDropdown && setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                    {link.isDropdown && (
                                        <button
                                            onClick={() => toggleMobileSubMenu(link.label)}
                                            className="p-3 text-gray-500 hover:text-primary focus:outline-none"
                                        >
                                            <ChevronDown
                                                size={18}
                                                className={`transition-transform duration-200 ${mobileSubMenu === link.label ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Mobile Submenu Accordion */}
                                {link.isDropdown && mobileSubMenu === link.label && link.subCategories && (
                                    <div className="pl-6 bg-gray-50/50 rounded-md">
                                        {link.subCategories.map((sub) => (
                                            <Link
                                                key={sub.label}
                                                href={sub.href}
                                                className="block px-3 py-3 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <Link
                            href="/profile"
                            className="block px-3 py-4 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors border-t border-gray-100 mt-2"
                            onClick={() => setIsOpen(false)}
                        >
                            My Profile
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
