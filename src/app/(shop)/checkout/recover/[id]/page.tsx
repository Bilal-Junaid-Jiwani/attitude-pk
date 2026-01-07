'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Loader2 } from 'lucide-react';

export default function RecoveryPage() {
    const { id } = useParams();
    const router = useRouter();
    const { restoreCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const recoverCart = async () => {
            try {
                const res = await fetch(`/api/checkout/recover/${id}`);
                const data = await res.json();

                if (res.ok) {
                    if (data.cartItems && data.cartItems.length > 0) {
                        restoreCart(data.cartItems);
                        // Store recovery ID for conversion tracking
                        localStorage.setItem('recovery_id', id as string);

                        // Small delay to let toast show and storage persist
                        setTimeout(() => {
                            router.push('/checkout');
                        }, 1000);
                    } else {
                        throw new Error('No items found in this recovery link.');
                    }
                } else {
                    throw new Error(data.error || 'Invalid recovery link');
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (id) recoverCart();
    }, [id]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <h1 className="text-xl font-bold text-red-600 mb-2">Recovery Failed</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-[#1c524f] text-white rounded hover:bg-[#143d3b]"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <Loader2 className="animate-spin text-[#1c524f] mb-4" size={48} />
            <h1 className="text-xl font-bold text-[#1a1a1a]">Restoring your cart...</h1>
            <p className="text-gray-500">Please wait while we recover your items.</p>
        </div>
    );
}
