'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Link from 'next/link';
import CoolLoader from '../ui/CoolLoader';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
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

                    console.log('Unique SubCats found:', Array.from(uniqueSubCats));

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

    if (loading) return <CoolLoader />;
    if (products.length === 0) return null;

    return (
        <section className="py-16 w-full px-4 sm:px-6 lg:px-12 bg-white shadow-sm my-16">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-heading font-bold text-[#1c524f]">Featured Picks</h2>
                </div>

                {/* Tabs */}
                {tabs.length > 0 && (
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
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="group flex flex-col items-center text-center animate-in fade-in duration-500">
                            {/* Image Area */}
                            <Link href={`/product/${product._id}`} className="block relative aspect-[3/4] w-full mb-6 overflow-hidden bg-transparent rounded-lg cursor-pointer">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Example of a condition for badges (DB doesn't have rating yet, so just an example logic or remove) */}
                                {product.stock < 5 && (
                                    <span className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                                        Low Stock
                                    </span>
                                )}
                            </Link>

                            {/* Details */}
                            <div className="flex-1 w-full flex flex-col items-center">
                                <h3 className="font-heading font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                                    <Link href={`/product/${product._id}`} className="hover:text-[#1c524f] transition-colors">
                                        {product.name}
                                    </Link>
                                </h3>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{activeTab}</p>

                                {/* Stars (Static for now since DB might not have ratings yet) */}
                                <div className="flex items-center gap-1.5 mb-4">
                                    <div className="flex text-[#1c524f]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill="currentColor" className="text-[#1c524f]" />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">(5)</span>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => addToCart({
                                        _id: product._id,
                                        name: product.name,
                                        price: product.price,
                                        imageUrl: product.imageUrl,
                                        quantity: 1,
                                        subCategory: product.subCategory
                                    })}
                                    className="w-full bg-[#1c524f] text-white py-3 px-4 rounded-sm font-bold text-sm tracking-wide hover:bg-[#153e3c] transition-all mt-auto shadow-sm hover:shadow-md flex justify-center items-center gap-2"
                                >
                                    <span>Add</span>
                                    <span>Rs. {product.price.toLocaleString()}</span>
                                </button>
                            </div>
                        </div>
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
