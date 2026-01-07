'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, ShoppingBag, FileText, Star, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReviewFormModal from '@/components/shop/ReviewFormModal';
import { useToast } from '@/components/ui/ToastProvider';
import OrderTimeline from '@/components/ui/OrderTimeline';
import Skeleton from '@/components/ui/Skeleton';

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
                // Determine API URL based on user role (assuming customer for this page)
                // Actually /api/orders handles auth internally
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
                // Artificial delay for smooth skeleton transition if needed, or remove for speed
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
            <div className="space-y-6">
                {/* Skeleton Header */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
                    <Skeleton className="h-7 w-48 mb-6" />
                    <div className="space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <Skeleton className="h-20 w-full rounded-none border-b border-gray-100" />
                                <div className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-16 h-16 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-heading font-bold text-[#1c524f]">Order History</h1>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <Package size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders placed yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">Once you place an order, you can track its journey from our warehouse to your doorstep right here.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#1c524f] text-white rounded-full font-bold hover:bg-[#153e3c] transition-all hover:scale-105 shadow-xl shadow-[#1c524f]/20"
                    >
                        <ShoppingBag size={20} /> Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                            {/* Order Header */}
                            <div className="bg-[#fcfcfd] border-b border-gray-100 p-6 flex flex-wrap gap-6 items-center justify-between relative overflow-hidden">
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#1c524f]"></div>

                                <div className="flex flex-wrap gap-8 md:gap-12">
                                    <div>
                                        <p className="text-[11px] uppercase font-extrabold text-[#1c524f] tracking-wider mb-1">Order ID</p>
                                        <p className="font-mono text-sm font-bold text-gray-700">#{order._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-extrabold text-[#1c524f] tracking-wider mb-1">Date</p>
                                        <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase font-extrabold text-[#1c524f] tracking-wider mb-1">Total</p>
                                        <p className="text-sm font-bold text-gray-900">Rs. {order.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2
                                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                                'bg-blue-50 text-blue-700'}`}>
                                        <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' :
                                            order.status === 'Cancelled' ? 'bg-red-500' :
                                                'bg-blue-500 animate-pulse'
                                            }`}></span>
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Section */}
                            {!['Cancelled', 'Refunded'].includes(order.status) && (
                                <div className="bg-white px-2 sm:px-8 border-b border-gray-50">
                                    <OrderTimeline status={order.status} />
                                </div>
                            )}

                            {/* Courier Tracking Info */}
                            {(order.trackingId || order.courierCompany) && (
                                <div className="bg-[#f0fdf9] px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2 text-[#1c524f]">
                                        <Truck size={18} />
                                        <span className="font-bold text-sm">Tracking Info</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                                        {order.courierCompany && (
                                            <p className="flex items-center gap-1">
                                                <span className="text-gray-500 font-medium">Courier:</span>
                                                <span className="font-bold">{order.courierCompany}</span>
                                            </p>
                                        )}
                                        {order.trackingId && (
                                            <p className="flex items-center gap-1">
                                                <span className="text-gray-500 font-medium">Tracking ID:</span>
                                                <span className="font-mono font-bold select-all bg-white px-2 py-0.5 rounded border border-gray-200 text-[#1c524f]">{order.trackingId}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Cancelled State */}
                            {order.status === 'Cancelled' && (
                                <div className="p-8 text-center bg-red-50/30 border-b border-red-50">
                                    <p className="text-red-600 font-medium text-sm">This order has been cancelled.</p>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="p-6 md:p-8">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Items Ordered</h4>
                                <div className="space-y-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-start sm:items-center gap-4 sm:gap-6">
                                            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#F5F5F7] rounded-xl flex-shrink-0 border border-gray-100 overflow-hidden relative group/img">
                                                <img
                                                    src={item.imageUrl || '/placeholder.png'}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover/img:scale-110 mix-blend-multiply"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{item.name}</h5>
                                                <p className="text-sm text-gray-500 mb-2">Variant: Default</p>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">Qty: {item.quantity}</span>
                                                    <span className="text-[#1c524f] font-bold text-sm">Rs. {item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            {order.status === 'Delivered' && (
                                                <button
                                                    onClick={() => handleOpenReview(order)}
                                                    className="hidden sm:flex text-gray-400 hover:text-[#1c524f] transition-colors items-center gap-1.5 text-xs font-bold border border-gray-200 hover:border-[#1c524f] px-3 py-1.5 rounded-lg"
                                                >
                                                    <Star size={14} /> Review Item
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-gray-50/50 p-4 sm:p-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                                    <span className="flex items-center gap-1"><Package size={14} /> Securely Packed</span>
                                    <span className="hidden sm:inline text-gray-300">|</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {order.status === 'Delivered' ? 'Delivered on Time' : 'Estimating Delivery'}</span>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Link
                                        href={`/orders/${order._id}/invoice`}
                                        target="_blank"
                                        className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                    >
                                        Invoice
                                    </Link>

                                    {order.status === 'Delivered' && (
                                        <button
                                            onClick={() => handleOpenReview(order)}
                                            className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#1c524f] text-white font-bold text-xs rounded-xl hover:bg-[#153e3c] transition-all shadow-lg shadow-[#1c524f]/20"
                                        >
                                            Write a Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ReviewFormModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                products={reviewProducts}
            />
        </div>
    );
}
