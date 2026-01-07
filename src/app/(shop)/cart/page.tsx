'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import EmptyState from '@/components/ui/EmptyState';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
    const [shippingConfig, setShippingConfig] = React.useState({ standardRate: 200, freeShippingThreshold: 5000 });
    const [taxConfig, setTaxConfig] = React.useState({ enabled: false, rate: 0 });

    React.useEffect(() => {
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
    }, []);

    const FREE_SHIPPING_THRESHOLD = shippingConfig?.freeShippingThreshold ?? 5000;
    const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const shippingCost = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingConfig?.standardRate ?? 200);
    const finalTotal = cartTotal + shippingCost;

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <EmptyState
                    icon={Trash2}
                    title="Your cart is empty"
                    description="Looks like you haven't added anything to your cart yet. Explore our products and find something you love!"
                    actionLabel="Start Shopping"
                    actionLink="/"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-heading font-bold text-[#1c524f] mb-8">Shopping Cart ({cart.length} items)</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Cart Items */}
                    <div className="flex-1 space-y-4">
                        {/* Free Shipping Progress */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className={progress === 100 ? "text-green-600" : "text-gray-600"}>
                                    {progress === 100 ? "You've unlocked FREE Shipping!" : `Spend Rs. ${Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal).toLocaleString()} more for FREE Shipping`}
                                </span>
                                <span className="text-gray-400">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#1c524f] transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {cart.map((item) => (
                            <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 sm:gap-6 items-center">
                                {/* Image */}
                                <div className="relative w-20 h-24 sm:w-24 sm:h-32 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg sm:text-lg mb-1">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mb-1">{item.subCategory || 'General'}</p>
                                        {item.originalPrice && item.originalPrice > item.price ? (
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Subscriber Discount</span>
                                                <span className="text-sm text-gray-400 line-through">Rs. {item.originalPrice.toLocaleString()}</span>
                                                <span className="font-bold text-[#d72c0d]">Rs. {item.price.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <p className="font-bold text-[#1c524f]">Rs. {item.price.toLocaleString()}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-6">
                                        {/* Quantity Control */}
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md h-10">
                                            <button
                                                onClick={() => updateQuantity(item._id, -1)}
                                                className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, 1)}
                                                className="w-8 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-900">Rs. {cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={shippingCost === 0 ? "text-green-600 font-bold" : "font-bold text-gray-900"}>
                                        {shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost.toLocaleString()}`}
                                    </span>
                                </div>
                                {taxConfig.enabled && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax ({taxConfig.rate}%)</span>
                                        <span>Rs. {Math.round(cartTotal * (taxConfig.rate / 100)).toLocaleString()}</span>
                                    </div>
                                )}
                                {cart.some(item => item.originalPrice && item.originalPrice > item.price) && (
                                    <div className="flex justify-between text-[#1c524f]">
                                        <span>Subscription Savings</span>
                                        <span>- Rs. {cart.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity, 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-lg font-bold text-[#1c524f] mb-6">
                                <span>Total</span>
                                <span>Rs. {(finalTotal + (taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0)).toLocaleString()}</span>
                            </div>

                            <Link href="/checkout" className="w-full bg-[#1c524f] text-white py-4 rounded-md font-bold text-lg hover:bg-[#153e3c] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1c524f]/20">
                                <span>Checkout</span>
                                <ArrowRight size={20} />
                            </Link>

                            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Secure Checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
