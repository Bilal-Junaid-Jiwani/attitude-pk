'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Payment Form Component
const StripePaymentForm = ({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: (paymentResult: any) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        setLoading(false);

        if (error) {
            addToast(error.message || 'Payment failed', 'error');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent);
        }
    };

    return (
        <form id="stripe-form" onSubmit={handleSubmit} className="mt-4">
            <PaymentElement />
        </form>
    );
};

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const { addToast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Card'>('COD');
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

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

    // Create Payment Intent when Card is selected
    useEffect(() => {
        if (paymentMethod === 'Card' && !clientSecret && cartTotal > 0) {
            fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: cartTotal, currency: 'pkr' }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [paymentMethod, cartTotal, clientSecret]);

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Main Order Placement Logic
    const placeOrder = async (paymentResult: any = {}) => {
        setLoading(true);
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
                    product_id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    subCategory: item.subCategory,
                    imageUrl: item.imageUrl
                })),
                totalAmount: cartTotal,
                shippingAddress: formData,
                paymentMethod: paymentMethod,
                paymentResult: paymentMethod === 'Card' ? {
                    id: paymentResult.id,
                    status: paymentResult.status,
                    email_address: paymentResult.receipt_email
                } : undefined
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

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === 'Card') {
            // Note: We need to ensure shipping info is valid first.
            const form = document.getElementById('checkout-form') as HTMLFormElement;
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // If valid, submit stripe form
            const stripeForm = document.getElementById('stripe-form');
            if (stripeForm) {
                stripeForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }

        } else {
            // COD
            placeOrder();
        }
    };

    if (initialLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

                                <label
                                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-[#1c524f] bg-white ring-1 ring-[#1c524f]' : 'border-gray-200 hover:border-[#1c524f]/50'}`}
                                    onClick={() => setPaymentMethod('Card')}
                                >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="flex items-center gap-3 font-bold text-gray-900">
                                            <span className={`w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center ${paymentMethod === 'Card' ? 'border-[#1c524f]' : ''}`}>
                                                {paymentMethod === 'Card' && <div className="w-3 h-3 bg-[#1c524f] rounded-full" />}
                                            </span>
                                            Credit / Debit Card
                                        </span>
                                        <CreditCard size={20} className="text-gray-500" />
                                    </div>

                                    {paymentMethod === 'Card' && (
                                        <div className="pl-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {clientSecret ? (
                                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                    <StripePaymentForm clientSecret={clientSecret} onSuccess={placeOrder} />
                                                </Elements>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Initializing secure payments...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </label>
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
                                                <span className="font-bold text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</span>
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
                                    <span className="font-medium text-[#1c524f]">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-xl text-[#1c524f]">Rs. {cartTotal.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                // If card is selected, we want the form submit to be handled by our special handler
                                // If COD, standard handler.
                                // We can just use onClick on this button to trigger the unified handler in JS 
                                // instead of creating a complex form association.
                                onClick={handleSubmit}
                                disabled={loading || (paymentMethod === 'Card' && !clientSecret)}
                                className="w-full mt-8 bg-[#1c524f] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#153e3c] transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" />}
                                {loading ? 'Processing...' : (paymentMethod === 'Card' ? 'Pay Now' : 'Place Order')}
                            </button>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                By placing your order, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
