'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReviewFormModal from '@/components/shop/ReviewFormModal';
import { useToast } from '@/components/ui/ToastProvider';

interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export default function PublicReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [error, setError] = useState('');

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);

    // Fetch order ID form params
    const [orderId, setOrderId] = useState<string>('');

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setOrderId(resolvedParams.orderId);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/review/order/${orderId}`);
                if (!res.ok) throw new Error('Order not found');
                const data = await res.json();
                setOrderItems(data.items || []);
            } catch (err) {
                setError('Could not load order details. It may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleOpenReview = (item: OrderItem) => {
        setSelectedProduct({ id: item.product_id, name: item.name });
        setIsReviewModalOpen(true);
    };

    const handleReviewSubmit = async (data: { rating: number; title: string; body: string; productId?: string; name?: string }) => {
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c524f]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Oops!</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link href="/" className="text-[#1c524f] font-bold hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-500 hover:text-[#1c524f] mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Store
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-[#1c524f]">Review Your Purchase</h1>
                    <p className="text-gray-600 mt-2">We'd love to hear what you think about your items!</p>
                </div>

                {/* Order Items List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900">Order Items</h2>
                        <span className="text-sm font-mono text-gray-400">#{orderId.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {orderItems.map((item, idx) => (
                            <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/30 transition-colors">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                    <img
                                        src={item.imageUrl || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <button
                                    onClick={() => handleOpenReview(item)}
                                    className="px-6 py-2.5 bg-[#1c524f] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#1c524f]/20 hover:bg-[#153e3c] transition-all flex items-center justify-center gap-2"
                                >
                                    <Star size={16} />
                                    Write Review
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Review Modal */}
                <ReviewFormModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    onSubmit={handleReviewSubmit}
                    products={selectedProduct ? [selectedProduct] : undefined}
                    showNameInput={true} // Always show name input (or let logic handle session check if we expanded page to check auth)
                />
            </div>
        </div>
    );
}
