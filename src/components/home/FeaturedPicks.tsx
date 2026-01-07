'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Link from 'next/link';
import CoolLoader from '../ui/CoolLoader';
import { useCart } from '@/context/CartContext';

import ProductCard from '@/components/shop/ProductCard';
import ProductCardSkeleton from '../ui/ProductCardSkeleton';

interface Product {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    imageUrl: string;
    images?: string[];
    subCategory?: string;
    category?: { name: string };
    stock: number;
}

const FeaturedPicks = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<string>('');
    const { addToCart } = useCart();
    const [tabs, setTabs] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data: Product[] = await res.json();
                    setProducts(data);

                    // Generate Dynamic Tabs from SubCategories or Categories
                    const uniqueSubCats = new Set<string>();

                    data.forEach(p => {
                        // Use SubCategory if available, otherwise Category Name, otherwise fallback
                        const tabName = p.subCategory || p.category?.name || 'General';
                        if (tabName) uniqueSubCats.add(tabName);
                    });

                    // Define Preferred Order (matching partial strings)
                    const PREFERRED_ORDER = ['Shampoo', 'Conditioner', 'Lotion', 'Cleaning', 'Household'];

                    const sortedTabs = Array.from(uniqueSubCats).sort((a, b) => {
                        const indexA = PREFERRED_ORDER.findIndex(order => a.toLowerCase().includes(order.toLowerCase()) || order.toLowerCase().includes(a.toLowerCase()));
                        const indexB = PREFERRED_ORDER.findIndex(order => b.toLowerCase().includes(order.toLowerCase()) || order.toLowerCase().includes(b.toLowerCase()));

                        // If both are found in preferred order, sort by index
                        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                        // If A is found but B is not, A comes first
                        if (indexA !== -1) return -1;
                        // If B is found but A is not, B comes first
                        if (indexB !== -1) return 1;
                        // Otherwise sort alphabetically
                        return a.localeCompare(b);
                    });

                    setTabs(sortedTabs);
                    if (sortedTabs.length > 0) {
                        setActiveTab(sortedTabs[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch featured products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter products based on active tab
    const filteredProducts = products.filter(p => {
        const tabName = p.subCategory || p.category?.name || 'General';
        return tabName === activeTab;
    });

    const isLoading = loading;

    return (
        <section id="featured-picks" className="py-16 w-full px-4 sm:px-6 lg:px-12 bg-white shadow-sm my-16">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-heading font-bold text-[#1c524f]">Featured Picks</h2>
                </div>

                {/* Tabs */}
                {!isLoading && tabs.length > 0 && (
                    <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 no-scrollbar items-center">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2.5 rounded-sm text-sm font-bold tracking-wide transition-all whitespace-nowrap border ${activeTab === tab
                                    ? "bg-[#1c524f] text-white border-[#1c524f]"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-[#1c524f] hover:text-[#1c524f]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 min-h-[400px]">
                {isLoading ? (
                    // Skeleton Loading
                    Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-[400px]">
                            <ProductCardSkeleton />
                        </div>
                    ))
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        // @ts-ignore - ProductCard expects a compatible interface
                        <ProductCard key={product._id} product={product as any} />
                    ))
                ) : (
                    <div className="col-span-full h-64 flex items-center justify-center text-gray-400 italic">
                        No products available in this category.
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedPicks;
