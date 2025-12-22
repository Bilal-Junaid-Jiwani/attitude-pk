'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import React, { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce-slow">
                <CheckCircle className="w-12 h-12 text-[#1c524f]" />
            </div>

            <h1 className="text-4xl font-heading font-bold text-[#1c524f] mb-4">
                Order Placed Successfully!
            </h1>

            <p className="text-gray-600 text-lg max-w-md mb-8">
                Thank you for your purchase. Your order has been received and is now being processed.
            </p>

            {orderId && (
                <div className="bg-white px-6 py-4 rounded-lg border border-gray-200 shadow-sm mb-8">
                    <p className="text-gray-500 text-sm uppercase tracking-wide font-bold mb-1">Order ID</p>
                    <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
                </div>
            )}

            <div className="flex gap-4">
                <Link
                    href="/profile"
                    className="px-8 py-3 bg-white text-[#1c524f] border-2 border-[#1c524f] rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                    View Order
                </Link>
                <Link
                    href="/"
                    className="px-8 py-3 bg-[#1c524f] text-white rounded-full font-bold hover:bg-[#153e3c] transition-colors flex items-center gap-2"
                >
                    <ShoppingBag size={20} />
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
