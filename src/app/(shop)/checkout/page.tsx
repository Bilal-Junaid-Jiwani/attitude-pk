'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, CreditCard, Lock, AlertCircle, Check, X, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import Skeleton from '@/components/ui/Skeleton';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const { addToast } = useToast();

    // Payment Confirmation State
    const [showPaymentCheck, setShowPaymentCheck] = useState<string | null>(null);

    useEffect(() => {
        const pendingOrder = localStorage.getItem('awaitingSafepay');
        if (pendingOrder) {
            setShowPaymentCheck(pendingOrder);
        }
    }, []);

    const handleSafepayPaymentConfirmed = () => {
        if (showPaymentCheck) {
            localStorage.removeItem('awaitingSafepay');
            clearCart(); // Optimistically clear cart here too
            router.push(`/checkout/success?orderId=${showPaymentCheck}`);
        }
    };

    const handleSafepayPaymentCancelled = () => {
        localStorage.removeItem('awaitingSafepay');
        setShowPaymentCheck(null);
    };

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
    });

    // Payment Method: COD, Safepay (Card/Bank), or JazzCash
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Safepay' | 'JazzCash'>('COD');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number; type: string } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // Shipping & Tax Config State
    const [shippingConfig, setShippingConfig] = useState({ standardRate: 200, freeShippingThreshold: 5000 });
    const [taxConfig, setTaxConfig] = useState({ enabled: false, rate: 0 });

    // Address Book State
    const [showAddressList, setShowAddressList] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    useEffect(() => {
        // Fetch Settings
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

    // Fetch user data for pre-fill
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setFormData({
                            fullName: data.user.name || '',
                            email: data.user.email || '',
                            phone: data.user.phone || '',
                            address: data.user.address || '',
                            city: '',
                            postalCode: data.user.postcode || '',
                        });
                    }
                }
            } catch {
                // Ignore error (guest)
            } finally {
                setInitialLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Abandoned Cart Capture
    const handleAbandonmentCapture = async () => {
        if (!formData.email && !formData.phone) return;
        try {
            await fetch('/api/checkout/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    phone: formData.phone,
                    name: formData.fullName,
                    cartItems: cart,
                    totalAmount: cartTotal
                })
            });
        } catch (e) { } // Silent fail
    };

    // Place Order for COD
    const placeCODOrder = async () => {
        try {
            let userId = null;
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    userId = data.user._id;
                }
            } catch { }

            const orderData = {
                user: userId,
                items: cart.map(item => ({
                    product_id: item.productId || item._id, // API expects Main Product ID
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subCategory: item.subCategory,
                    imageUrl: item.imageUrl,
                    variantId: item.variantId // Pass variantId for stock tracking
                })),
                shippingAddress: formData,
                paymentMethod: 'COD',
                couponCode: appliedCoupon?.code,
                discount: appliedCoupon?.amount || 0,
                subtotal: cartTotal,
                tax: taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0,
                shippingCost: cartTotal >= (shippingConfig?.freeShippingThreshold ?? 5000) ? 0 : (shippingConfig?.standardRate ?? 200),
                totalAmount: cartTotal + (taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0) + (cartTotal >= (shippingConfig?.freeShippingThreshold ?? 5000) ? 0 : (shippingConfig?.standardRate ?? 200)) - (appliedCoupon?.amount || 0)
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                router.push(`/checkout/success?orderId=${data.orderId}`);
            } else {
                addToast(data.message || 'Failed to place order', 'error');
            }
        } catch {
            addToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper: Create Pending Order
    const createPendingOrder = async (method: string) => {
        let userId = null;
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                userId = data.user._id;
            }
        } catch { }

        const orderData = {
            user: userId,
            items: cart.map(item => ({
                product_id: item.productId || item._id, // API expects Main Product ID
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subCategory: item.subCategory,
                imageUrl: item.imageUrl,
                variantId: item.variantId // Pass variantId for stock tracking
            })),
            shippingAddress: formData,
            paymentMethod: method,
            status: 'pending',
            couponCode: appliedCoupon?.code,
            discount: appliedCoupon?.amount || 0,
            subtotal: cartTotal,
            tax: taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0,
            shippingCost: cartTotal >= (shippingConfig?.freeShippingThreshold ?? 5000) ? 0 : (shippingConfig?.standardRate ?? 200),
            totalAmount: cartTotal + (taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0) + (cartTotal >= (shippingConfig?.freeShippingThreshold ?? 5000) ? 0 : (shippingConfig?.standardRate ?? 200)) - (appliedCoupon?.amount || 0)
        };

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to create order');
        }

        return res.json();
    };

    // Initiate Safepay Payment
    const handleSafepay = async () => {
        try {
            const orderJson = await createPendingOrder('Safepay');
            const orderId = orderJson.orderId;

            // 1. Initialize Safepay Payment Session
            const res = await fetch('/api/safepay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: cartTotal + (cartTotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.standardRate) - (appliedCoupon?.amount || 0),
                    currency: 'PKR',
                    orderId: orderId
                })
            });

            const data = await res.json();

            if (res.ok && data.url) {
                localStorage.setItem('awaitingSafepay', orderId);
                window.location.href = data.url;
            } else {
                addToast(data.error || 'Failed to initialize payment', 'error');
                setLoading(false);
            }
        } catch (error: any) {
            console.error(error);
            addToast(error.message || 'Connection error. Please try again.', 'error');
            setLoading(false);
        }
    };

    // Initiate JazzCash Payment
    const handleJazzCash = async () => {
        try {
            const orderJson = await createPendingOrder('JazzCash');
            const orderId = orderJson.orderId;
            const finalAmount = cartTotal + (cartTotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.standardRate) - (appliedCoupon?.amount || 0);

            const res = await fetch('/api/jazzcash/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalAmount,
                    orderId: orderId
                })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.mode === 'simulation') {
                    // Direct redirect for simulation
                    clearCart();
                    window.location.href = data.url;
                } else if (data.fields) {
                    // POST Form Submit for Production
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = data.url;

                    for (const key in data.fields) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = data.fields[key];
                        form.appendChild(input);
                    }

                    document.body.appendChild(form);
                    form.submit();
                } else {
                    addToast('Invalid response from payment server', 'error');
                    setLoading(false);
                }
            } else {
                addToast(data.error || 'Failed to initialize JazzCash payment', 'error');
                setLoading(false);
            }
        } catch (error: any) {
            console.error(error);
            addToast(error.message || 'Connection error', 'error');
            setLoading(false);
        }
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (paymentMethod === 'Safepay') {
            await handleSafepay();
        } else if (paymentMethod === 'JazzCash') {
            await handleJazzCash();
        } else {
            await placeCODOrder();
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-10 w-48 mb-8 mx-auto md:mx-0" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Skeleton */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-12 w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-48">
                                <Skeleton className="h-8 w-48 mb-6" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                        {/* Right Skeleton */}
                        <div className="lg:col-span-5">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                <Skeleton className="h-8 w-40" />
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-16 h-16 rounded-md" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="w-16 h-16 rounded-md" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <Skeleton className="h-1 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-14 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FAF9F6]">
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <Link href="/" className="px-6 py-3 bg-[#1c524f] text-white rounded-md font-bold hover:bg-[#153e3c] transition-colors">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">

            {/* Payment Confirmation Modal */}
            {showPaymentCheck && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Completing Payment?</h3>
                            <p className="text-gray-600">
                                We noticed you just returned from Safepay. Did you complete your payment successfully?
                            </p>
                            <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                <button
                                    onClick={handleSafepayPaymentCancelled}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <X size={20} />
                                    No, Cancelled
                                </button>
                                <button
                                    onClick={handleSafepayPaymentConfirmed}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1c524f] text-white rounded-xl font-bold hover:bg-[#153e3c] transition-colors"
                                >
                                    <Check size={20} />
                                    Yes, Paid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-heading font-bold text-[#1c524f] mb-8 text-center md:text-left">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#1c524f] text-white flex items-center justify-center text-sm">1</span>
                                Shipping Information
                            </h2>

                            {/* Address Book Selector */}
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (showAddressList) {
                                            setShowAddressList(false);
                                            return;
                                        }

                                        setLoadingAddresses(true);
                                        try {
                                            const res = await fetch('/api/user/address');
                                            if (res.ok) {
                                                const data = await res.json();
                                                if (data.addresses && data.addresses.length > 0) {
                                                    setSavedAddresses(data.addresses);
                                                    setShowAddressList(true);
                                                } else {
                                                    addToast('No saved addresses found. Go to Profile to add one.', 'info');
                                                }
                                            }
                                        } catch {
                                            addToast('Failed to load addresses', 'error');
                                        } finally {
                                            setLoadingAddresses(false);
                                        }
                                    }}
                                    className="text-sm font-bold text-[#1c524f] hover:underline flex items-center gap-1 mb-2"
                                >
                                    {showAddressList ? 'Hide Address Book' : 'Select from Address Book'}
                                    {loadingAddresses && <Loader2 size={12} className="animate-spin" />}
                                </button>

                                {showAddressList && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {savedAddresses.map((addr: any) => (
                                            <div
                                                key={addr._id}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        fullName: addr.fullName,
                                                        phone: addr.phone,
                                                        address: addr.address,
                                                        city: addr.city,
                                                        postalCode: addr.postalCode,
                                                    });
                                                    setShowAddressList(false);
                                                    addToast('Address auto-filled!', 'success');
                                                }}
                                                className="border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-[#1c524f] hover:bg-[#1c524f]/5 transition-all group"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="font-bold text-gray-800 flex items-center gap-2">
                                                        {addr.label}
                                                        {addr.isDefault && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Default</span>}
                                                    </span>
                                                    <span className="text-[#1c524f] opacity-0 group-hover:opacity-100 text-xs font-bold">Select</span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{addr.address}</p>
                                                <p className="text-xs text-gray-500">{addr.city}</p>
                                            </div>
                                        ))}
                                        <Link href="/profile/addresses" className="border border-dashed border-gray-300 rounded-xl p-3 flex items-center justify-center text-sm font-bold text-gray-500 hover:text-[#1c524f] hover:border-[#1c524f] transition-all">
                                            + Manage Addresses
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                        placeholder="Ali Khan"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleAbandonmentCapture}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                            placeholder="ali@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleAbandonmentCapture}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                            placeholder="0300 1234567"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            required
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                            placeholder="House #123, Street 4, Block A"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                                placeholder="Karachi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code (Optional)</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                                placeholder="75500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#1c524f] text-white flex items-center justify-center text-sm">2</span>
                                Payment Method
                            </h2>

                            <div className="space-y-3">
                                <label
                                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#1c524f] bg-[#f0fdf9]' : 'border-gray-200 hover:border-[#1c524f]/50'}`}
                                    onClick={() => setPaymentMethod('COD')}
                                >
                                    <span className="flex items-center gap-3 font-bold text-gray-900">
                                        <span className={`w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#1c524f]' : ''}`}>
                                            {paymentMethod === 'COD' && <div className="w-3 h-3 bg-[#1c524f] rounded-full" />}
                                        </span>
                                        Cash on Delivery (COD)
                                    </span>
                                </label>

                                <div className="relative opacity-60 cursor-not-allowed">
                                    <div className="flex flex-col p-4 border border-gray-200 rounded-xl bg-gray-50">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="flex items-center gap-3 font-bold text-gray-500">
                                                <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"></span>
                                                Pay with Safepay
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-full tracking-wider">Coming Soon</span>
                                                <Lock size={16} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative opacity-60 cursor-not-allowed">
                                    <div className="flex flex-col p-4 border border-gray-200 rounded-xl bg-gray-50">
                                        <div className="flex items-center justify-between w-full">
                                            <span className="flex items-center gap-3 font-bold text-gray-500">
                                                <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"></span>
                                                Pay with JazzCash
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-full tracking-wider">Coming Soon</span>
                                                <Lock size={16} className="text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="max-h-96 overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                        <div className="relative w-16 h-16 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                                            <p className="text-xs text-gray-500 mb-1">{item.subCategory}</p>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Qty: {item.quantity}</span>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-baseline gap-2">
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="text-xs text-gray-500 line-through">Rs. {(item.originalPrice * item.quantity).toLocaleString()}</span>
                                                        )}
                                                        <span className="font-bold text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rs. {cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    {cartTotal >= (shippingConfig?.freeShippingThreshold ?? 5000) ? (
                                        <span className="text-green-600 font-bold">Free</span>
                                    ) : (
                                        <span className="font-medium text-gray-900">Rs. {(shippingConfig?.standardRate ?? 200).toLocaleString()}</span>
                                    )}
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
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center gap-1">
                                            Discount <span className="text-xs bg-green-100 px-1 rounded uppercase">({appliedCoupon.code})</span>
                                        </span>
                                        <span>- Rs. {(appliedCoupon.amount || 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Coupon Input */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Discount Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedCoupon}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1c524f] outline-none uppercase disabled:bg-gray-100 disabled:text-gray-400"
                                    />
                                    {appliedCoupon ? (
                                        <button
                                            onClick={() => {
                                                setAppliedCoupon(null);
                                                setCouponCode('');
                                                addToast('Coupon removed', 'success');
                                            }}
                                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                if (!couponCode) return;
                                                setCouponLoading(true);
                                                try {
                                                    const res = await fetch('/api/coupons/validate', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ code: couponCode, cartTotal })
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok && data.valid) {
                                                        setAppliedCoupon({ code: data.code, amount: data.discountAmount, type: data.discountType });
                                                        addToast(data.message, 'success');
                                                    } else {
                                                        addToast(data.message || 'Invalid coupon', 'error');
                                                    }
                                                } catch {
                                                    addToast('Failed to validate coupon', 'error');
                                                } finally {
                                                    setCouponLoading(false);
                                                }
                                            }}
                                            disabled={couponLoading || !couponCode}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-xl text-[#1c524f]">
                                    Rs. {(cartTotal + (taxConfig.enabled ? Math.round(cartTotal * (taxConfig.rate / 100)) : 0) + (cartTotal >= (shippingConfig?.freeShippingThreshold ?? 5000) ? 0 : (shippingConfig?.standardRate ?? 200)) - (appliedCoupon?.amount || 0)).toLocaleString()}
                                </span>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full mt-8 bg-[#1c524f] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#153e3c] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" />}
                                {loading ? 'Processing...' : (paymentMethod === 'Safepay' || paymentMethod === 'JazzCash' ? 'Proceed to Pay' : 'Place Order')}
                            </button>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>

                            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-100">
                                <div className="flex flex-col items-center text-center gap-1 text-gray-500">
                                    <ShieldCheck size={18} className="text-[#1c524f]" />
                                    <span className="text-[10px] font-medium leading-tight">Secure Payment</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1 text-gray-500">
                                    <RefreshCw size={18} className="text-[#1c524f]" />
                                    <span className="text-[10px] font-medium leading-tight">Easy Returns</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1 text-gray-500">
                                    <Truck size={18} className="text-[#1c524f]" />
                                    <span className="text-[10px] font-medium leading-tight">Fast Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
