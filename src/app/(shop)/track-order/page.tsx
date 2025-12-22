'use client';

import { useState } from 'react';
import { Search, Package, Clock, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const res = await fetch('/api/orders/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: orderId.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setOrder(data.order);
            } else {
                setError(data.message || 'Failed to find order');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-heading font-bold text-[#1c524f]">Track Your Order</h1>
                    <p className="text-gray-600">Enter your Order ID to see the current status.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Paste your Order ID (e.g., 6767...)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#1c524f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#153e3c] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-4 text-center font-medium">{error}</p>}
                </div>

                {/* Order Details */}
                {order && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Header */}
                        <div className="bg-[#1c524f]/5 p-6 border-b border-[#1c524f]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Status</p>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' :
                                        order.status === 'Cancelled' ? 'bg-red-500' :
                                            'bg-yellow-500'
                                        }`} />
                                    {order.status}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 font-medium">Order Placed</p>
                                <p className="text-gray-900 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-6 flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">Estimated Delivery</p>
                                    <p className="font-bold text-gray-900">3-5 Business Days</p>
                                </div>
                            </div>
                            <div className="p-6 flex items-start gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">City</p>
                                    <p className="font-bold text-gray-900">{order.shippingAddress?.city || 'Pakistan'}</p>
                                </div>
                            </div>
                            <div className="p-6 flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">Payment & Total</p>
                                    <p className="font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</p>
                                    <p className="text-xs text-[#1c524f] font-bold mt-1 bg-green-50 inline-block px-2 py-1 rounded-md border border-green-100">
                                        via {order.paymentMethod === 'Card' ? 'Credit/Debit Card' : order.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Preview */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package size={18} />
                                Package Contents
                            </h3>
                            <div className="space-y-3">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">
                                            <span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}
                                        </span>
                                        <span className="text-gray-900 font-medium">Rs. {item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
