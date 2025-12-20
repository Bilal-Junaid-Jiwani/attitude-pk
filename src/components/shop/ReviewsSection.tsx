'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import ReviewFormModal from './ReviewFormModal';

interface Review {
    id: number;
    name: string;
    verified: boolean;
    rating: number;
    title: string;
    body: string;
    date: string;
}

const INITIAL_REVIEWS: Review[] = [
    {
        id: 1,
        name: 'Ayesha Khan',
        verified: true,
        rating: 5,
        title: 'Been using for a while now, love it',
        body: 'I love the smell of this body wash for my kids and how wonderful it works. Highly recommended for sensitive skin!',
        date: '2025-12-07'
    },
    {
        id: 2,
        name: 'Muhammad Rafay',
        verified: true,
        rating: 5,
        title: 'Safe shampoo for kids',
        body: 'Finally found a shampoo that doesn\'t irritate my son\'s eyes. The blueberry scent is amazing and refreshing.',
        date: '2025-12-07'
    },
    {
        id: 3,
        name: 'Fatima Bilal',
        verified: true,
        rating: 5,
        title: 'Best purchase ever!',
        body: 'My daughter has eczema and this is the only product that suits her. Thank you Attitude for such safe products.',
        date: '2025-12-06'
    },
    {
        id: 4,
        name: 'Zainab Ahmed',
        verified: true,
        rating: 4,
        title: 'Good but pricey',
        body: 'Quality is top notch, no doubt. Just wish it was a bit more affordable. But worth it for the peace of mind.',
        date: '2025-12-05'
    }
];

export default function ReviewsSection() {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [userName, setUserName] = useState('');

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

    const handleSubmitReview = (data: { rating: number; title: string; body: string }) => {
        const newReview: Review = {
            id: Date.now(),
            name: userName || 'Attitude User',
            verified: true, // Assuming logged in users are verified for now
            rating: data.rating,
            title: data.title,
            body: data.body,
            date: new Date().toISOString().split('T')[0]
        };

        setReviews([newReview, ...reviews]);
        setIsModalOpen(false);
        addToast('Review submitted successfully!', 'success');
    };

    return (
        <div className="mt-20 border-t border-gray-100 pt-16">
            {/* Top Summary Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <span className="text-5xl font-heading font-medium text-[#1c524f]">4.9</span>
                    <div className="flex flex-col">
                        <div className="flex text-[#1c524f] mb-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} fill="currentColor" />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500">Based on 324 reviews</span>
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
            <div className="flex flex-col md:flex-row gap-4 mb-8 border-b border-gray-100 pb-4">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search reviews"
                        className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#1c524f]"
                    />
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                </div>

                <div className="relative">
                    <button className="flex items-center justify-between w-full md:w-40 px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 bg-white">
                        <span>Rating</span>
                        <ChevronDown size={16} />
                    </button>
                </div>

                <div className="md:ml-auto flex items-center gap-2 text-sm text-gray-500">
                    <span>Sort by:</span>
                    <button className="flex items-center gap-1 font-medium text-gray-900">
                        Most recent <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-8">
                {reviews.map((review) => (
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
                ))}
            </div>

            <ReviewFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitReview}
            />
        </div>
    );
}
