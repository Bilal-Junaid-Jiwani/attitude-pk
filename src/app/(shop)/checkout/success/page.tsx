'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Copy, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/ToastProvider';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCart();
    const { addToast } = useToast();

    const [isGuest, setIsGuest] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);

    const itemsClearedRef = React.useRef(false);

    useEffect(() => {
        if (orderId && !itemsClearedRef.current) {
            clearCart();
            itemsClearedRef.current = true;
        }

        // Check if guest
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    setIsGuest(true);
                    setShowModal(true);
                } else {
                    const data = await res.json();
                    if (!data.user) {
                        setIsGuest(true);
                        setShowModal(true);
                    }
                }
            } catch {
                setIsGuest(true);
                setShowModal(true);
            }
        };
        checkUser();

    }, [orderId, clearCart]);

    const copyToClipboard = () => {
        if (orderId) {
            navigator.clipboard.writeText(orderId);
            addToast('Order ID copied to clipboard!', 'success');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">

            {/* Guest Warning Modal */}
            {showModal && orderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-4">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Guest Account</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">Save Your Order ID!</h3>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            Since you are checking out as a guest, this order will <strong>disappear</strong> from this page if you refresh. Please save your Order ID to track it later.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-center justify-between group">
                            <code className="text-lg font-mono font-bold text-[#1c524f]">{orderId}</code>
                        </div>

                        <div className="flex gap-3 justify-center mb-6">
                            <button
                                onClick={copyToClipboard}
                                className="bg-[#1c524f] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#153e3c] transition-colors shadow-lg shadow-[#1c524f]/20 active:scale-95 duration-200 flex items-center gap-2 text-sm"
                            >
                                <Copy size={16} />
                                Copy ID
                            </button>
                            <Link
                                href={`/orders/${orderId}/invoice`}
                                target="_blank"
                                className="bg-white border-2 border-[#1c524f] text-[#1c524f] px-4 py-2 rounded-lg font-medium hover:bg-[#1c524f]/5 transition-colors active:scale-95 duration-200 flex items-center gap-2 text-sm"
                            >
                                <span className="text-lg">📄</span>
                                Invoice
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <Link
                                href="/track-order"
                                className="block w-full text-center bg-[#1c524f] text-white py-3 rounded-xl font-bold hover:bg-[#153e3c] transition-colors"
                            >
                                Go to Track Order Page
                            </Link>
                            <button
                                onClick={() => setShowModal(false)}
                                className="block w-full text-center text-gray-500 font-medium hover:text-gray-700 text-sm"
                            >
                                I have saved it, close popup
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="flex items-center gap-3 justify-center">
                        <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
                        <button onClick={copyToClipboard} className="text-gray-400 hover:text-[#1c524f] transition-colors">
                            <Copy size={18} />
                        </button>
                    </div>
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
