'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Search } from 'lucide-react';
import CoolLoader from '@/components/ui/CoolLoader';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    category?: { name: string };
    subCategory?: string;
    stock: number;
}

import { Suspense } from 'react';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // In a real large app, this should be a backend search API.
                // For now, we fetch all and filter client-side as per plan.
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();

                    const searchTerms = query.toLowerCase().split(' ');

                    const filtered = data.filter((p: any) => {
                        const nameMatch = p.name?.toLowerCase().includes(query.toLowerCase());
                        const catMatch = p.category?.name?.toLowerCase().includes(query.toLowerCase());
                        const subCatMatch = p.subCategory?.toLowerCase().includes(query.toLowerCase());
                        const descMatch = p.description?.toLowerCase().includes(query.toLowerCase());

                        return nameMatch || catMatch || subCatMatch || descMatch;
                    });

                    setProducts(filtered);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query]);

    if (loading) return <CoolLoader />;

    return (
        <section className="py-16 w-full px-4 sm:px-6 lg:px-12 bg-[#F5F5F7] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col items-center justify-center text-center mb-8">
                    <p className="text-gray-500 mb-2 uppercase tracking-widest text-xs">Search Results</p>
                    <h1 className="text-3xl font-heading font-bold text-[#1c524f]">
                        &quot;{query}&quot;
                    </h1>
                    <p className="text-gray-500 mt-2">{products.length} products found</p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-500">Try checking your spelling or using different keywords.</p>
                        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-[#1c524f] text-white rounded-full font-bold hover:bg-[#153e3c]">
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {products.map((product) => (
                            <div key={product._id} className="group flex flex-col items-center text-center bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                                {/* Image Area */}
                                <Link href={`/product/${product._id}`} className="block relative aspect-[3/4] w-full mb-6 overflow-hidden bg-transparent rounded-lg cursor-pointer">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                                    />
                                </Link>

                                {/* Details */}
                                <div className="flex-1 w-full flex flex-col items-center">
                                    <h3 className="font-heading font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                                        <Link href={`/product/${product._id}`} className="hover:text-[#1c524f] transition-colors">
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                                        {product.subCategory || product.category?.name || 'General'}
                                    </p>

                                    <div className="flex items-center gap-1.5 mb-4">
                                        <div className="flex text-[#1c524f]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" className="text-[#1c524f]" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">(5)</span>
                                    </div>

                                    <div className="w-full mt-auto">
                                        <button
                                            onClick={() => addToCart({
                                                _id: product._id,
                                                name: product.name,
                                                price: product.price,
                                                imageUrl: product.imageUrl,
                                                quantity: 1,
                                                subCategory: product.subCategory
                                            })}
                                            className="w-full bg-[#1c524f] text-white py-3 px-4 rounded-sm font-bold text-sm tracking-wide hover:bg-[#153e3c] transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-2"
                                        >
                                            <span>Add</span>
                                            <span>Rs. {product.price.toLocaleString()}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<CoolLoader />}>
            <SearchContent />
        </Suspense>
    );
}
