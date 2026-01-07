'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface CookieState {
    necessary: boolean;
    functional: boolean;
    performance: boolean;
    advertising: boolean;
    social: boolean;
    unclassified: boolean;
}

const Footer = () => {
    const [showCookieModal, setShowCookieModal] = useState(false);

    // Cookie State
    const [cookiePreferences, setCookiePreferences] = useState<CookieState>({
        necessary: true, // Always true
        functional: true,
        performance: true,
        advertising: true,
        social: true,
        unclassified: true
    });

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('attitude_cookie_preferences');
        if (saved) {
            try {
                setCookiePreferences(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cookie preferences");
            }
        }
    }, []);

    const handleToggle = (key: keyof CookieState) => {
        if (key === 'necessary') return; // Cannot toggle necessary
        setCookiePreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleConfirm = () => {
        localStorage.setItem('attitude_cookie_preferences', JSON.stringify(cookiePreferences));
        toast.success("Cookie preferences saved!");
        setShowCookieModal(false);
    };

    const handleRejectAll = () => {
        const rejectedState = {
            necessary: true,
            functional: false,
            performance: false,
            advertising: false,
            social: false,
            unclassified: false
        };
        setCookiePreferences(rejectedState);
        localStorage.setItem('attitude_cookie_preferences', JSON.stringify(rejectedState));
        toast.success("All non-essential cookies rejected.");
        setShowCookieModal(false);
    };

    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-center md:text-left">
                    {/* Brand */}
                    <div className="flex flex-col space-y-4 items-center md:items-start">
                        <h2 className="text-2xl font-bold tracking-tight text-[#1c524f]">
                            ATTITUDE <span className="text-[#1c524f] text-sm ml-0.5">PK</span>
                        </h2>
                        <p className="text-[#1c524f] text-sm font-medium">
                            Live consciously. Clean products for your family and home.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-bold text-[#1c524f] tracking-wider uppercase mb-4">Shop</h3>
                        <ul className="space-y-3">
                            <li><Link href="/collections/baby" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Baby</Link></li>
                            <li><Link href="/collections/kids" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Kids</Link></li>
                            <li><Link href="/" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Home</Link></li>
                            <li><Link href="/trending" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Trending</Link></li>
                        </ul>
                    </div>

                    {/* Help Center */}
                    <div>
                        <h3 className="text-sm font-bold text-[#1c524f] tracking-wider uppercase mb-4">Help Center</h3>
                        <ul className="space-y-3">
                            <li><Link href="/faq" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">FAQ</Link></li>
                            <li><Link href="/contact" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Contact Us</Link></li>
                            <li><Link href="/shipping" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Shipping & Refund</Link></li>
                            <li><Link href="/conditions" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Conditions of Promotions</Link></li>
                            <li><Link href="/terms" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Terms and Conditions</Link></li>
                            <li><Link href="/privacy" className="text-sm text-[#1c524f] hover:text-[#153e3c] transition-colors font-medium">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-sm font-bold text-[#1c524f] tracking-wider uppercase mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-[#1c524f] hover:text-[#153e3c] transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-[#1c524f] hover:text-[#153e3c] transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-[#1c524f] hover:text-[#153e3c] transition-colors">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center bg-gray-50 text-center md:text-left gap-4 md:gap-0">
                    {/* Legal Links (Left Side) - Adjusted for mobile center */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 order-2 md:order-1">
                        <Link href="/terms" className="text-sm text-[#004C45] hover:underline font-medium">Terms and Conditions</Link>
                        <Link href="/privacy" className="text-sm text-[#004C45] hover:underline font-medium">Privacy Policy</Link>
                        <button
                            onClick={() => setShowCookieModal(true)}
                            className="text-sm text-[#004C45] hover:underline font-medium focus:outline-none"
                        >
                            Cookie management
                        </button>
                    </div>

                    {/* Copyright (Right Side) */}
                    <p className="text-sm text-[#1c524f] order-1 md:order-2 font-medium">
                        &copy; {new Date().getFullYear()} Attitude PK. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Cookie Drawer (Sidebar) */}
            <div
                className={`fixed inset-0 z-50 flex justify-start transition-visibility duration-300 ${showCookieModal ? 'visible' : 'invisible'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${showCookieModal ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setShowCookieModal(false)}
                />

                {/* Sidebar */}
                <div
                    className={`relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${showCookieModal ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-2xl font-bold tracking-tight text-[#1c524f]">
                            ATTITUDE
                        </h2>
                        <button
                            onClick={() => setShowCookieModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-1.5 rounded-full shadow-sm border border-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">We value your privacy.</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We use cookies to help you navigate efficiently and to perform certain functions. You will find detailed information about all cookies under each consent category below.
                                <Link href="/privacy" className="text-[#1c524f] hover:underline ml-1 block mt-1">Privacy Policy</Link>
                            </p>
                        </div>

                        <div className="space-y-1">
                            <h4 className="font-semibold text-gray-900 mb-4 block">Customize your consent preferences</h4>

                            {/* Items */}
                            <CookieItem
                                title="Necessary Cookies"
                                description="These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. They are essential for the website to function properly."
                                required
                                isEnabled={cookiePreferences.necessary}
                                onToggle={() => handleToggle('necessary')}
                            />
                            <CookieItem
                                title="Functional Cookies"
                                description="These cookies allow the website to remember choices you make (such as your user name, language or the region you are in) and provide enhanced, more personal features."
                                isEnabled={cookiePreferences.functional}
                                onToggle={() => handleToggle('functional')}
                            />
                            <CookieItem
                                title="Performance Cookies"
                                description="These cookies collect information about how you use our website, e.g. which pages you usually visit or if you get error messages from our pages. These cookies don't collect information that identifies you. All information these cookies collect is aggregated and therefore anonymous."
                                isEnabled={cookiePreferences.performance}
                                onToggle={() => handleToggle('performance')}
                            />
                            <CookieItem
                                title="Advertising Cookies"
                                description="These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests."
                                isEnabled={cookiePreferences.advertising}
                                onToggle={() => handleToggle('advertising')}
                            />
                            <CookieItem
                                title="Social Media Cookies"
                                description="These cookies are set by a range of social media services that we have added to the site to enable you to share our content with your friends and networks. They are capable of tracking your browser across other sites and building up a profile of your interests."
                                isEnabled={cookiePreferences.social}
                                onToggle={() => handleToggle('social')}
                            />
                            <CookieItem
                                title="Unclassified Cookies"
                                description="Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies."
                                isEnabled={cookiePreferences.unclassified}
                                onToggle={() => handleToggle('unclassified')}
                            />
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                        <button
                            onClick={handleConfirm}
                            className="w-full py-3 bg-[#1c524f] text-white rounded-md font-bold text-sm hover:bg-[#15403d] transition-colors shadow-sm"
                        >
                            Confirm My Choices
                        </button>
                        <button
                            onClick={handleRejectAll}
                            className="w-full py-2.5 bg-white text-gray-700 border border-gray-300 rounded-md font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Reject All
                        </button>
                    </div>

                    <div className="px-6 py-2 bg-white text-[10px] text-gray-400 text-right border-t border-gray-50">
                        Powered by Attitude PK
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Helper Component for the Toggles
const CookieItem = ({
    title,
    description,
    required = false,
    isEnabled,
    onToggle
}: {
    title: string,
    description: string,
    required?: boolean,
    isEnabled: boolean,
    onToggle: () => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="py-3 border-b border-gray-100 last:border-0 group">
            <div className="flex items-center justify-between mb-1">
                <button
                    className="flex items-center text-sm font-medium text-gray-700 hover:text-[#1c524f] transition-colors flex-1 text-left"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="mr-3 text-[#1c524f] font-bold text-lg leading-none">{isExpanded ? '-' : '+'}</span> {title}
                </button>

                {required ? (
                    <span className="text-xs text-[#1c524f] font-bold ml-4">Always Active</span>
                ) : (
                    <button
                        onClick={onToggle}
                        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out ml-4 flex-shrink-0 focus:outline-none ${isEnabled ? 'bg-[#1c524f]' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                )}
            </div>
            {isExpanded && (
                <p className="mt-2 text-xs text-gray-500 pl-6 pr-4 animate-in slide-in-from-top-1">
                    {description}
                </p>
            )}
        </div>
    );
}

export default Footer;
