'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, RefreshCw, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateReviewModal from '@/components/admin/CreateReviewModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import AdminTableSkeleton from '@/components/ui/AdminTableSkeleton';

interface Review {
    _id: string;
    product: {
        _id: string;
        name: string;
        imageUrl: string;
    } | null;
    user?: string | null;
    name: string;
    rating: number;
    title: string;
    body: string;
    date: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDeleteClick = (id: string) => {
        setReviewToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!reviewToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewToDelete}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Review deleted');
                setReviews(prev => prev.filter(r => r._id !== reviewToDelete));
                setIsDeleteModalOpen(false);
            } else {
                toast.error('Failed to delete review');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Error deleting review');
        } finally {
            setIsDeleting(false);
            setReviewToDelete(null);
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reviews Management</h1>
                    <p className="text-gray-500">View, create, and manage customer reviews</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#1c524f] text-white px-4 py-2 rounded-lg hover:bg-[#153e3c] transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Fake Review
                </button>
            </div>

            {loading ? (
                <AdminTableSkeleton />
            ) : reviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        Wait for customers to submit reviews or create a fake one to get started.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Review</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {review.product ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                        <img src={review.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="font-medium text-gray-800 text-sm line-clamp-1 max-w-[150px]" title={review.product.name}>
                                                        {review.product.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-red-500 text-sm">Product Deleted</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {review.name || 'Guest'}
                                            {!review.user && (
                                                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
                                                    Fake
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                        stroke="currentColor"
                                                        className={i < review.rating ? "" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="font-medium text-gray-800 text-sm">{review.title}</p>
                                            <p className="text-gray-500 text-sm line-clamp-2 mt-0.5">{review.body}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(review.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(review._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CreateReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchReviews}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                isLoading={isDeleting}
                confirmText="Delete Review"
            />
        </div>
    );
}
