'use client';

import React from 'react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/shop/ProductCard';
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
    const { wishlist, loading } = useWishlist();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] py-16 px-4 sm:px-6 lg:px-12">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-heading font-bold text-[#1c524f] mb-8">My Wishlist</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-[400px]">
                                <ProductCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F5F5F7] px-4">
                <EmptyState
                    icon={Heart}
                    title="Your wishlist is empty"
                    description="Save items you love to your wishlist and revisit them later. Browse our collections to find your favorites!"
                    actionLabel="Explore Collections"
                    actionLink="/"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] py-16 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-[#1c524f] fill-[#1c524f]" size={32} />
                    <h1 className="text-3xl font-heading font-bold text-[#1c524f]">My Wishlist ({wishlist.length})</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {wishlist.map((item) => (
                        // Handle potential mixed state (ID vs Object) though context tries to refetch
                        typeof item === 'object' ? (
                            // @ts-ignore
                            <ProductCard key={item._id} product={item} />
                        ) : null
                    ))}
                </div>
            </div>
        </div>
    );
}
