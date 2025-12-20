import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            ATTITUDE <span className="text-primary">PK</span>
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Live consciously. Clean products for your family and home.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Shop</h3>
                        <ul className="space-y-3">
                            <li><Link href="/baby" className="text-sm text-gray-500 hover:text-primary transition-colors">Baby</Link></li>
                            <li><Link href="/kids" className="text-sm text-gray-500 hover:text-primary transition-colors">Kids</Link></li>
                            <li><Link href="/home" className="text-sm text-gray-500 hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/trending" className="text-sm text-gray-500 hover:text-primary transition-colors">Trending</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-sm text-gray-500 hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="text-sm text-gray-500 hover:text-primary transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Attitude PK. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
