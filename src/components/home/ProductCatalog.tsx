'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    category?: { name: string };
    subCategory?: string;
    stock: number;
}

interface GroupedProducts {
    [category: string]: {
        [subCategory: string]: Product[];
    };
}

export default function ProductCatalog() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Group Products Logic
    const groupedProducts: GroupedProducts = {};
    products.forEach((product) => {
        const catName = product.category?.name || 'Uncategorized';
        const subCatName = product.subCategory || 'General';

        if (!groupedProducts[catName]) {
            groupedProducts[catName] = {};
        }
        if (!groupedProducts[catName][subCatName]) {
            groupedProducts[catName][subCatName] = [];
        }
        groupedProducts[catName][subCatName].push(product);
    });

    if (loading) {
        return <div className="py-20 text-center text-gray-500">Loading full catalog...</div>;
    }

    if (products.length === 0) {
        return null; // Don't show anything if no products
    }

    return (
        <section className="py-16 w-full px-4 sm:px-6 lg:px-12 bg-[#F5F5F7]">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-heading font-bold text-[#1c524f]">Our Complete Collection</h2>
                    <p className="text-gray-500 mt-2">Explore all our products organized by category</p>
                </div>

                {Object.keys(groupedProducts).map((categoryName) => (
                    <div key={categoryName} className="space-y-8 animate-in fade-in duration-700">
                        {/* Category Header */}
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-heading font-bold text-gray-900">{categoryName}</h3>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {/* Subcategories */}
                        {Object.keys(groupedProducts[categoryName]).map((subCategoryName) => (
                            <div key={subCategoryName} className="pl-0 md:pl-4">
                                <h4 className="text-xl font-bold text-gray-600 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c524f]"></span>
                                    {subCategoryName}
                                </h4>

                                {/* Product Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                                    {groupedProducts[categoryName][subCategoryName].map((product) => (
                                        <div key={product._id} className="group flex flex-col items-center text-center bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                                            {/* Image Area */}
                                            <div className="relative aspect-[3/4] w-full mb-6 overflow-hidden bg-transparent rounded-lg">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 w-full flex flex-col items-center">
                                                <h3 className="font-heading font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                                                    <Link href={`/product/${product._id}`} className="hover:text-[#1c524f] transition-colors">
                                                        {product.name}
                                                    </Link>
                                                </h3>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                                                    {product.subCategory || categoryName}
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
                                                    <button className="w-full bg-[#1c524f] text-white py-3 px-4 rounded-sm font-bold text-sm tracking-wide hover:bg-[#153e3c] transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-2">
                                                        <span>Add</span>
                                                        <span>Rs. {product.price.toLocaleString()}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
