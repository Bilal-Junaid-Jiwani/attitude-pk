'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

interface WishlistContextType {
    wishlist: any[];
    loading: boolean;
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Fetch wishlist on mount
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await fetch('/api/user/wishlist');
                if (res.ok) {
                    const data = await res.json();
                    setWishlist(data.wishlist || []);
                }
            } catch (error) {
                console.error("Failed to load wishlist", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const toggleWishlist = async (productId: string) => {
        try {
            // Optimistic update
            const startInWishlist = isInWishlist(productId);

            if (startInWishlist) {
                setWishlist(prev => prev.filter(item => (typeof item === 'string' ? item : item._id) !== productId));
                addToast('Removed from wishlist', 'info');
            } else {
                // We can't immediately add the full object without details, so we wait for API or assume success if we had object
                // For valid optimistic UI, we just need the ID.
                // But the wishlist state holds objects. 
                // Let's just do API call first for simplicity or handle mix.
            }

            const res = await fetch('/api/user/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            if (res.ok) {
                const data = await res.json();
                // The API returns the UPDATED wishlist (IDs only? or populated?).
                // My API route: `return NextResponse.json({ message, wishlist: user.wishlist });` 
                // The model has `ref: 'Product'`. If I don't populate in POST, it returns IDs.
                // If I want objects, I should re-fetch or populate in POST.
                // For now, let's just re-fetch to be safe and get full objects.

                // Better approach:
                // The context should prefer consistency. 
                // Let's re-fetch for now to ensure we have full objects (image, price etc) for the Wishlist Page.

                const res2 = await fetch('/api/user/wishlist');
                const data2 = await res2.json();
                setWishlist(data2.wishlist || []);

                if (!startInWishlist) addToast('Added to wishlist', 'success');
            } else {
                if (res.status === 401) {
                    addToast('Please login to use wishlist', 'error');
                } else {
                    addToast('Failed to update wishlist', 'error');
                }
                // Revert optimistic if needed (not implemented here for simplicity)
            }
        } catch (error) {
            console.error(error);
            addToast('Something went wrong', 'error');
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => {
            const id = typeof item === 'string' ? item : item._id;
            return id === productId;
        });
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
