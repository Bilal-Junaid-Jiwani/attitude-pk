'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import ReviewFormModal from './ReviewFormModal';
import CoolLoader from '@/components/ui/CoolLoader';

interface Review {
    id: string | number;
    name: string;
    verified: boolean;
    rating: number;
    title: string;
    body: string;
    date: string;
}



export default function ReviewsSection({ productId }: { productId?: string }) {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'recent' | 'rating-high' | 'rating-low'>('recent');
    const [showRatingMenu, setShowRatingMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Fetch Reviews
    const fetchReviews = async () => {
        try {
            const url = productId ? `/api/reviews?productId=${productId}` : '/api/reviews';
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                const formattedReviews = data.map((r: any) => ({
                    id: r._id,
                    name: r.name,
                    verified: r.verified,
                    rating: r.rating,
                    title: r.title,
                    body: r.body,
                    date: new Date(r.date).toISOString().split('T')[0]
                }));
                setReviews(formattedReviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();

        // Also pre-fetch user name if possible
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUserName(data.user.name);
                }
            } catch (e) {
                // Ignore if not logged in
            }
        };
        checkUser();
    }, []);

    const filteredReviews = reviews
        .filter(review => {
            const matchesSearch =
                (review.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (review.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (review.body?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            const matchesRating = filterRating ? review.rating === filterRating : true;
            return matchesSearch && matchesRating;
        })
        .sort((a, b) => {
            if (sortBy === 'rating-high') return b.rating - a.rating;
            if (sortBy === 'rating-low') return a.rating - b.rating;
            // distinct default to recent
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

    const handleWriteReview = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUserName(data.user.name);
                setIsModalOpen(true);
            } else {
                addToast('Please login to write a review', 'error');
                router.push('/login');
            }
        } catch (error) {
            console.error('Auth check failed', error);
            addToast('Something went wrong. Please try again.', 'error');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (data: { rating: number; title: string; body: string }) => {
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: data.rating,
                    title: data.title,
                    review: data.body, // API expects 'review' key for body
                    productId // Include productId explicitly
                }),
            });

            if (res.ok) {
                addToast('Review submitted successfully!', 'success');
                setIsModalOpen(false);
                fetchReviews(); // Refresh list
            } else {
                const err = await res.json();
                addToast(err.error || 'Failed to submit review', 'error');
            }
        } catch (error) {
            console.error('Submit review error', error);
            addToast('Something went wrong', 'error');
        }
    };

    return (
        <div className="mt-20 border-t border-gray-100 pt-16">
            {/* Top Summary Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <span className="text-5xl font-heading font-medium text-[#1c524f]">
                        {reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : "5.0"
                        }
                    </span>
                    <div className="flex flex-col">
                        <div className="flex text-[#1c524f] mb-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} fill="currentColor" />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">Based on {reviews.length} reviews</span>
                    </div>
                </div>

                <div className="flex-1 w-full md:w-auto flex justify-center md:justify-end">
                    <button
                        onClick={handleWriteReview}
                        disabled={loading}
                        className="bg-[#1c524f] text-white px-8 py-3 rounded-full font-bold hover:bg-[#153e3c] transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Checking...' : 'Write A Review'}
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 border-b border-gray-100 pb-4 relative z-10">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search reviews"
                        className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#1c524f]"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowRatingMenu(!showRatingMenu)}
                        className={`flex items-center justify-between w-full md:w-40 px-4 py-2 border rounded-full text-sm transition-colors ${filterRating ? 'border-[#1c524f] text-[#1c524f] bg-green-50' : 'border-gray-200 text-gray-700 bg-white'}`}
                    >
                        <span>{filterRating ? `${filterRating} Stars` : 'Rating'}</span>
                        <ChevronDown size={16} className={`transition-transform ${showRatingMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showRatingMenu && (
                        <div className="absolute top-12 left-0 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 z-20">
                            <button onClick={() => { setFilterRating(null); setShowRatingMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">All Ratings</button>
                            {[5, 4, 3, 2, 1].map(r => (
                                <button key={r} onClick={() => { setFilterRating(r); setShowRatingMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                    <span>{r} Stars</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:ml-auto flex items-center gap-2 text-sm text-gray-500 relative">
                    <span>Sort by:</span>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-1 font-medium text-gray-900"
                    >
                        {sortBy === 'recent' ? 'Most recent' : sortBy === 'rating-high' ? 'Highest Rating' : 'Lowest Rating'} <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showSortMenu && (
                        <div className="absolute top-8 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 z-20">
                            <button onClick={() => { setSortBy('recent'); setShowSortMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Most recent</button>
                            <button onClick={() => { setSortBy('rating-high'); setShowSortMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Highest Rating</button>
                            <button onClick={() => { setSortBy('rating-low'); setShowSortMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Lowest Rating</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-8">
                {initialLoading ? (
                    <CoolLoader />
                ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No reviews match your filters.
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                {/* Avatar */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gray-200" />
                                        <svg className="w-6 h-6 z-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <div className="absolute bottom-0 right-0">
                                            {/* Verify icon overlay could go here if design needed simpler avatar */}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900">{review.name}</h4>
                                            {review.verified && (
                                                <div className="flex items-center gap-0.5 text-xs text-[#1c524f]">
                                                    <CheckCircle2 size={12} fill="currentColor" className="text-white" stroke="#1c524f" />
                                                    <span>Verified Reviewer</span>
                                                    {/* Note: The design uses "Verified Reviewer" or "Verified Buyer" */}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex text-[#D4AF37] mb-2"> {/* Gold/Yellow stars */}
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" className={i < review.rating ? "text-[#D4AF37]" : "text-gray-300"} />
                                            ))}
                                        </div>

                                        <h5 className="font-bold text-gray-900 mb-2">{review.title}</h5>
                                        <p className="text-gray-600 leading-relaxed mb-2">{review.body}</p>
                                        <span className="text-xs text-gray-400">{review.date}</span>
                                    </div>
                                </div>

                                <div className="ml-auto">
                                    {/* Optional: Upvote/Helpful icons could go here */}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ReviewFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitReview}
            />
        </div >
    );
}
