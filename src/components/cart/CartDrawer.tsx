'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
    const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, closeCart } = useCart();

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    const FREE_SHIPPING_THRESHOLD = 5000; // Example threshold
    const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 250;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900">
                            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                                Your cart
                                <span className="text-sm font-normal text-gray-500 mt-1">{cart.length} ITEM(S)</span>
                            </h2>
                            <button onClick={closeCart} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Free Shipping Progress */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                            <p className="text-sm text-gray-600 mb-2 font-medium">
                                {progress === 100
                                    ? <span className="text-green-600 font-bold">You are eligible for free shipping</span>
                                    : <span>Spend <span className="font-bold text-gray-900">Rs. {Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal).toLocaleString()}</span> more for free shipping</span>
                                }
                            </p>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-900 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                    <p className="text-lg">Your cart is empty.</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                        {/* Image */}
                                        <div className="relative w-20 h-24 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm leading-tight pr-4">{item.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{item.subCategory || 'General'}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-end justify-between mt-2">
                                                <div className="text-sm font-bold text-gray-900">
                                                    Rs. {item.price.toLocaleString()}
                                                </div>

                                                {/* Qty Control */}
                                                <div className="flex items-center border border-gray-300 rounded-full h-8 px-2 gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, -1)}
                                                        className="text-gray-500 hover:text-gray-900 disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-sm font-medium w-3 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, 1)}
                                                        className="text-gray-500 hover:text-gray-900"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="space-y-2 mb-4">
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="w-full bg-[#1c524f] hover:bg-[#153e3c] text-white py-4 rounded-sm font-bold text-sm tracking-wide transition-colors flex justify-between px-6 items-center"
                                >
                                    <span>Rs. {(cartTotal + shippingCost).toLocaleString()}</span>
                                    <span>Checkout</span>
                                </Link>
                            </div>
                            <p className="text-xs text-center text-gray-400">
                                Taxes and shipping calculated at checkout
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
