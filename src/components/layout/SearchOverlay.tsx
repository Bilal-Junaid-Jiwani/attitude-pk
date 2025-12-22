'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md animate-in fade-in duration-200">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center justify-center h-full px-4 max-w-4xl mx-auto w-full">
                <form onSubmit={handleSearch} className="w-full relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={32} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for products..."
                        className="w-full bg-transparent border-b-2 border-gray-200 px-20 py-6 text-2xl md:text-4xl font-heading font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#1c524f] transition-colors"
                    />
                    <button
                        type="submit"
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-[#1c524f] text-white rounded-full hover:bg-[#153e3c] transition-colors"
                    >
                        <ArrowRight size={24} />
                    </button>
                </form>

                <p className="mt-8 text-gray-400 text-sm tracking-widest uppercase">
                    Press Enter to Search
                </p>
            </div>
        </div>
    );
}
