'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import { Product } from '@/types/product';

const TrendingPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchTrending = async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const res = await fetch(`/api/products/trending?page=${pageNum}&limit=8`);
            if (res.ok) {
                const data = await res.json();

                if (pageNum === 1) {
                    setProducts(data.products);
                } else {
                    setProducts(prev => {
                        const existingIds = new Set(prev.map(p => p._id));
                        const newProducts = data.products.filter((p: Product) => !existingIds.has(p._id));
                        return [...prev, ...newProducts];
                    });
                }

                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch trending products', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchTrending(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTrending(nextPage);
    };

    if (loading) {
        return (
            <div className="bg-[#FAF9F6] min-h-screen py-16 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#1c524f] mb-4 text-center">
                        Trending Products
                    </h1>
                    <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        Discover our most loved products, rated highly by customers like you.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {[...Array(8)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-16 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#1c524f] mb-4 text-center">
                    Trending Products
                </h1>
                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                    Discover our most loved products, rated highly by customers like you.
                </p>

                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            {products.map((product) => (
                                // @ts-ignore
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="bg-[#1c524f] text-white px-8 py-3 rounded-md font-bold hover:bg-[#153e3c] transition-colors disabled:opacity-70 flex items-center gap-2"
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-20">
                        <p>No trending products found yet. Be the first to review!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingPage;
