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
    category?: { name: string };
    subCategory?: string;
    stock: number;
}

export default function CategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();

                    // Filter by category
                    const filtered = data.filter((p: any) =>
                        p.category?.name?.toLowerCase() === categorySlug.toLowerCase()
                    );

                    setProducts(filtered);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categorySlug]);

    if (loading) return <CoolLoader />;

    return (
        <section className="py-16 w-full px-4 sm:px-6 lg:px-12 bg-[#F5F5F7] min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col items-center justify-center text-center mb-12">
                    <h1 className="text-4xl font-heading font-bold text-[#1c524f] uppercase tracking-wide">
                        {categorySlug} Collection
                    </h1>
                    <div className="w-24 h-1 bg-[#D4AF37] mt-4 rounded-full"></div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 text-lg">
                        No products found in this category.
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
