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

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }

        // Prefetch products for search
        if (isOpen && !hasFetched) {
            setLoading(true);
            fetch('/api/products')
                .then(res => res.json())
                .then(data => {
                    setProducts(data);
                    setHasFetched(true);
                })
                .catch(err => console.error('Search fetch error', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, hasFetched]);

    // Filter products
    useEffect(() => {
        if (!query.trim()) {
            setFilteredProducts([]);
            return;
        }

        const lowerQ = query.toLowerCase();
        const results = products.filter(p =>
            p.name.toLowerCase().includes(lowerQ) ||
            p.category?.name?.toLowerCase().includes(lowerQ) ||
            p.subCategory?.toLowerCase().includes(lowerQ)
        ).slice(0, 4); // Limit to 4 for visual preview

        setFilteredProducts(results);
    }, [query, products]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            // Close on Enter if query is empty to avoid accidental navigation (optional)
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
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-900 transition-colors z-10"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center pt-24 pb-12 px-4 max-w-4xl mx-auto w-full min-h-screen">
                <form onSubmit={handleSearch} className="w-full relative mb-12">
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

                {/* Visual Results */}
                <div className="w-full">
                    {query.trim() && (
                        <>
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="bg-gray-100 h-64 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div>
                                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 px-1">Top Results</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                        {filteredProducts.map(product => (
                                            <div
                                                key={product._id}
                                                onClick={() => { router.push(`/product/${product._id}`); onClose(); }}
                                                className="group cursor-pointer"
                                            >
                                                <div className="bg-gray-50 rounded-xl overflow-hidden mb-3 border border-gray-100 relative pt-[100%]">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                                <h4 className="font-bold text-gray-900 leading-tight group-hover:text-[#1c524f] transition-colors line-clamp-2">{product.name}</h4>
                                                <p className="text-sm text-gray-500 mt-1">Rs. {product.price.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 text-center md:hidden">
                                        <button onClick={handleSearch} className="text-[#1c524f] font-bold text-sm">View all results &rarr;</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-lg">No products found for "{query}"</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!query.trim() && (
                    <p className="mt-8 text-gray-400 text-sm tracking-widest uppercase text-center">
                        Start typing to see products
                    </p>
                )}
            </div>
        </div>
    );
}
