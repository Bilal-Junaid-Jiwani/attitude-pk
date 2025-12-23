'use client';

import { useState } from 'react';
import { Search, Package, Clock, MapPin, CreditCard, ArrowRight, FileText } from 'lucide-react';
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

                {/* Order Details - Shopify Style */}
                {order && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row gap-8 items-start">

                            {/* Left Column: Status & Timeline */}
                            <div className="w-full md:w-7/12 space-y-6">
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Status</h2>
                                            <p className="text-gray-500">Updated: {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}</p>

                                            {(order.trackingId || order.courierCompany) && (
                                                <div className="mt-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1c524f] animate-pulse"></div>
                                                            Shipment Details
                                                        </h3>
                                                        {order.courierCompany && (
                                                            <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-gray-500 shadow-sm">
                                                                {order.courierCompany}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {order.trackingId ? (
                                                        <div className="relative group">
                                                            <div className="flex items-center justify-between bg-white rounded-xl border-2 border-dashed border-gray-200 p-3 transition-all duration-300 hover:border-[#1c524f] hover:shadow-md">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Tracking Number</span>
                                                                    <span className="font-mono text-base font-bold text-[#1c524f] tracking-wide">{order.trackingId}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(order.trackingId)}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-[#1c524f] hover:text-white transition-all shadow-sm group-hover:scale-105"
                                                                    title="Copy to Clipboard"
                                                                >
                                                                    <div className="w-5 h-5"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg></div>
                                                                </button>
                                                            </div>
                                                            <div className="absolute inset-x-0 -bottom-2 mx-auto w-3/4 h-2 bg-gray-200 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">Tracking ID not available yet.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Timeline */}
                                    <div className="relative pl-4 border-l-2 border-gray-200 space-y-8 ml-2 my-8">
                                        {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                                            const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                                            const currentIdx = steps.indexOf(order.status);
                                            const stepIdx = steps.indexOf(step);
                                            const isCompleted = stepIdx <= currentIdx && order.status !== 'Cancelled';
                                            const isCurrent = stepIdx === currentIdx && order.status !== 'Cancelled';

                                            return (
                                                <div key={step} className="relative">
                                                    {/* Dot */}
                                                    <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 transition-all duration-500 ${isCompleted ? 'bg-[#1c524f] border-[#1c524f]' :
                                                        isCurrent ? 'bg-white border-[#1c524f] shadow-[0_0_0_4px_rgba(28,82,79,0.2)]' :
                                                            'bg-gray-100 border-gray-300'
                                                        }`}>
                                                        {isCompleted && <div className="w-full h-full flex items-center justify-center text-white text-[8px] font-bold">✓</div>}
                                                    </div>

                                                    <div className={`${isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                                                        <h3 className="font-bold text-gray-900 text-lg leading-none mb-1">{step}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {isCurrent ? 'Current Status' :
                                                                isCompleted ? 'Completed' : 'Pending'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <MapPin size={18} className="text-[#1c524f]" />
                                            Shipping Address
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed">
                                            <p className="font-bold text-gray-900 mb-1">{order.shippingAddress?.fullName}</p>
                                            <p>{order.shippingAddress?.address}</p>
                                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                            <p className="mt-2 text-gray-500">{order.shippingAddress?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="w-full md:w-5/12">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                                    <div className="p-6 bg-[#fafafa] border-b border-gray-100 flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Order Summary</h3>
                                            <p className="text-sm text-gray-500 mt-1">ID: #{order._id?.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <Link
                                            href={`/orders/${order._id}/invoice`}
                                            target="_blank"
                                            className="flex items-center gap-1.5 text-xs font-bold text-[#1c524f] bg-white border border-[#1c524f]/20 px-3 py-1.5 rounded-lg hover:bg-[#1c524f] hover:text-white transition-all shadow-sm"
                                        >
                                            <FileText size={14} />
                                            Invoice
                                        </Link>
                                    </div>

                                    <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                                    {/* Fallback for image */}
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                    <span className="absolute top-0 right-0 bg-[#1c524f] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Rs. {item.price.toLocaleString()}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    Rs. {(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>Rs. {order.subtotal?.toLocaleString() ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span>{order.shippingCost === 0 ? 'Free' : `Rs. ${order.shippingCost}`}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>- Rs. {order.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200 mt-2">
                                            <span>Total</span>
                                            <span>Rs. {order.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
