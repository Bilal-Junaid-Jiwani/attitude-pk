'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import EmptyState from '../ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

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

    // Shipping & Tax Config State
    const [shippingConfig, setShippingConfig] = React.useState({ standardRate: 200, freeShippingThreshold: 5000 });
    const [taxConfig, setTaxConfig] = React.useState({ enabled: false, rate: 0 });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [shippingRes, taxRes] = await Promise.all([
                    fetch('/api/settings?key=shippingConfig'),
                    fetch('/api/settings?key=taxConfig')
                ]);

                if (shippingRes.ok) {
                    const data = await shippingRes.json();
                    if (data && data.value) setShippingConfig(data.value);
                }
                if (taxRes.ok) {
                    const data = await taxRes.json();
                    if (data && data.value) setTaxConfig(data.value);
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };
        fetchSettings();
        fetchSettings();
    }, []);

    // Fetch Recommendations
    // Fetch Recommendations immediately on mount (background)
    const [recommended, setRecommended] = React.useState<any[]>([]);
    useEffect(() => {
        fetch('/api/products?limit=4')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRecommended(data);
                else if (data.products) setRecommended(data.products);
            })
            .catch(err => console.error('Failed to load recommendations', err));
    }, []);

    const FREE_SHIPPING_THRESHOLD = shippingConfig?.freeShippingThreshold ?? 5000;
    const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingConfig?.standardRate ?? 200);

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
                                <div className="h-full flex flex-col items-center justify-center">
                                    <EmptyState
                                        icon={ShoppingBag}
                                        title="Your cart feels lonely"
                                        description="It looks like you haven't added anything to your cart yet. Browse our collections to find something you love."
                                        actionLabel="Start Shopping"
                                        actionLink="/"
                                    />
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
                                                <div className="flex flex-col items-end">
                                                    {item.originalPrice && item.originalPrice > item.price && (
                                                        <>
                                                            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Subscriber Discount</span>
                                                            <span className="text-xs text-gray-400 line-through mb-0.5">Rs. {item.originalPrice.toLocaleString()}</span>
                                                        </>
                                                    )}
                                                    <div className={`text-sm font-bold text-gray-900 ${item.originalPrice ? 'text-[#d72c0d]' : ''}`}>
                                                        Rs. {item.price.toLocaleString()}
                                                    </div>
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

                            {/* Recommendations */}
                            {recommended.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">You May Also Like</h3>
                                    <div className="space-y-4">
                                        {recommended.slice(0, 3).map((prod: any) => (
                                            <div key={prod._id} className="flex gap-4 group cursor-pointer">
                                                <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={prod.imageUrl}
                                                        alt={prod.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-[#1c524f] transition-colors">{prod.name}</h4>
                                                    <p className="text-sm text-gray-500 mb-1">Rs. {prod.price.toLocaleString()}</p>
                                                    <button
                                                        onClick={() => {
                                                            // Add to cart logic (simplified)
                                                            // Note: Real logic needs variant selection, but assuming base product for now
                                                            // Or redirect to product page
                                                            window.location.href = `/product/${prod._id}`;
                                                        }}
                                                        className="text-xs font-bold text-[#1c524f] hover:underline text-left"
                                                    >
                                                        View Product
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="space-y-2 mb-4">
                                {taxConfig.enabled && (
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Tax ({taxConfig.rate}%)</span>
                                        <span>Rs. {Math.round(cartTotal * (taxConfig.rate / 100)).toLocaleString()}</span>
                                    </div>
                                )}
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="w-full bg-[#1c524f] hover:bg-[#153e3c] text-white py-4 rounded-sm font-bold text-sm tracking-wide transition-colors flex justify-between px-6 items-center"
                                >
                                    <span>Rs. {(cartTotal + shippingCost + (taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0)).toLocaleString()}</span>
                                    <span>Checkout</span>
                                </Link>
                            </div>
                            <p className="text-xs text-center text-gray-400">
                                Shipping & taxes calculated at checkout
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
