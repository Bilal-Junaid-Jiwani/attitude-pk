'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import CoolLoader from '@/components/ui/CoolLoader';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/shop/ProductCard';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    images?: string[];
    category?: { name: string };
    subCategory?: string;
    stock: number;
}

export default function SubCategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const subCategorySlug = params.subcategory as string; // from url, e.g. "shampoo-wash"

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();

                    // Filter by category AND subcategory
                    // Normalize slug to match potential subCategory names
                    const normalizedSub = subCategorySlug.replace(/-/g, ' ').toLowerCase(); // "shampoo wash"

                    const filtered = data.filter((p: any) => {
                        const catMatch = p.category?.name?.toLowerCase() === categorySlug.toLowerCase();

                        // Check subCategory
                        // We need to match "Shampoo + Wash" with "shampoo-wash"
                        // Or "Lotion" with "lotion"
                        const pSub = (p.subCategory || '').toLowerCase();

                        // Heuristic match: check if all parts of slug exist in product subCategory logic or vice versa
                        // For "shampoo-wash", split -> ["shampoo", "wash"]
                        const slugParts = subCategorySlug.split('-');
                        const subMatch = slugParts.every(part => pSub.includes(part));

                        return catMatch && subMatch;
                    });

                    setProducts(filtered);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categorySlug, subCategorySlug]);

    if (loading) return <CoolLoader />;

    // Title Formatting
    const title = subCategorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <section className="py-16 w-full px-4 sm:px-6 lg:px-12 bg-[#F5F5F7] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col items-center justify-center text-center mb-12">
                    <h1 className="text-4xl font-heading font-bold text-[#1c524f] uppercase tracking-wide">
                        {title}
                    </h1>
                    <p className="text-gray-500 mt-2 capitalize">{categorySlug} Collection</p>
                    <div className="w-24 h-1 bg-[#D4AF37] mt-4 rounded-full"></div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 text-lg">
                        No products found for {title}.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map((product) => (
                            // @ts-ignore - ProductCard expects a compatible interface
                            <ProductCard key={product._id} product={product as any} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
