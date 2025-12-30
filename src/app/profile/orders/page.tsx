'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, ShoppingBag, FileText, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewFormModal from '@/components/shop/ReviewFormModal';
import { useToast } from '@/components/ui/ToastProvider';

interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface Order {
    _id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    items: OrderItem[];
    trackingId?: string;
    courierCompany?: string;
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { addToast } = useToast();

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewProducts, setReviewProducts] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleOpenReview = (order: Order) => {
        const products = order.items.map(item => ({
            id: item.product_id,
            name: item.name
        }));
        setReviewProducts(products);
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = async (data: { rating: number; title: string; body: string; productId?: string }) => {
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                addToast('Review submitted successfully!', 'success');
                setIsReviewModalOpen(false);
            } else {
                const err = await res.json();
                addToast(err.error || 'Failed to submit review', 'error');
            }
        } catch (error) {
            console.error('Review error:', error);
            addToast('Something went wrong', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c524f]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>

                {orders.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c524f] text-white rounded-full font-bold hover:bg-[#153e3c] transition-colors shadow-lg shadow-[#1c524f]/20"
                        >
                            <ShoppingBag size={20} /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#1c524f]/20 transition-all duration-300 bg-white">
                                {/* Order Header */}
                                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                                    <div className="flex flex-wrap gap-8 items-center">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-extrabold text-[#1c524f] tracking-wide">Order Placed</p>
                                            <p className="text-sm font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-extrabold text-[#1c524f] tracking-wide">Total Amount</p>
                                            <p className="text-sm font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-extrabold text-[#1c524f] tracking-wide">Order ID</p>
                                            <p className="text-sm font-mono font-medium text-gray-600">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            {/* Status Badge */}
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                                                ${order.status === 'Delivered' ? 'bg-green-100/80 text-green-700 border border-green-200' :
                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/orders/${order._id}/invoice`}
                                            target="_blank"
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:text-[#1c524f] hover:border-[#1c524f] hover:shadow-sm transition-all"
                                        >
                                            <FileText size={14} />
                                            Invoice
                                        </Link>

                                        {order.status === 'Delivered' && (
                                            <button
                                                onClick={() => handleOpenReview(order)}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1c524f] text-white rounded-xl text-xs font-bold hover:bg-[#153e3c] shadow-lg shadow-[#1c524f]/20 transition-all"
                                            >
                                                <Star size={14} />
                                                Write a Review
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tracking Info Bar (Visible if tracking exists) */}
                                {(order.trackingId || order.courierCompany) && (
                                    <div className="px-6 py-4 bg-[#F5F5F7] border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#1c524f] shadow-sm">
                                                <Package size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Courier Partner</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900">{order.courierCompany || 'Assigned'}</p>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {order.trackingId && (
                                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-dashed border-gray-300 hover:border-[#1c524f] transition-colors group/track">
                                                <div>
                                                    <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Tracking ID</p>
                                                    <p className="font-mono text-sm font-bold text-[#1c524f] tracking-wide">{order.trackingId}</p>
                                                </div>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(order.trackingId!)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-[#1c524f] hover:text-white transition-all ml-2"
                                                    title="Copy Tracking ID"
                                                >
                                                    <div className="w-4 h-4"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg></div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Order Body */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group/item">
                                                <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 border border-gray-100 overflow-hidden relative">
                                                    <img src={item.imageUrl || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" />
                                                </div>
                                                <div className="flex-1 min-w-0 py-1">
                                                    <h4 className="font-bold text-gray-900 truncate mb-1">{item.name}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Qty: {item.quantity}</span>
                                                        <span>Rs. {item.price.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ReviewFormModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                products={reviewProducts}
            />
        </div>
    );
}
