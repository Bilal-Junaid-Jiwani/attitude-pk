'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ReviewFormModal from '@/components/shop/ReviewFormModal';

// Static Fallback Reviews
const STATIC_REVIEWS = [
    {
        id: 1,
        name: "Ayesha K.",
        verified: true,
        date: "12/12/25",
        rating: 5,
        title: "Gentle & Safe",
        text: "Using this shampoo for my newborn. It's so gentle and tear-free. Absolutely love it!",
        productName: "2-in-1 Baby Shampoo & Body Wash",
        productImage: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/626232166156_FT_09.jpg?v=1717620678&width=2000&height=2000&crop=center"
    },
    {
        id: 2,
        name: "Bilal Ahmed",
        verified: true,
        date: "10/11/25",
        rating: 5,
        title: "Smells Amazing",
        text: "The vanilla pear scent is just heavenly. My kids actually enjoy bath time now.",
        productName: "2-in-1 Kids Shampoo & Body Wash",
        productImage: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/626232110173_FT_13.jpg?v=1756304881&width=2000&height=2000&crop=center"
    },
    {
        id: 3,
        name: "Moiz Siddiqui",
        verified: true,
        date: "08/12/25",
        rating: 5,
        title: "Softest Skin",
        text: "This lotion is a lifesaver for dry winters. Keeps my baby's skin super soft and hydrated.",
        productName: "Baby Body Lotion",
        productImage: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/baby-leaves-body-lotion-unscented-16625.jpg?v=1717620671&width=2000&height=2000&crop=center"
    },
    {
        id: 4,
        name: "Noor Muhammad",
        verified: true,
        date: "15/12/25",
        rating: 5,
        title: "Tangle Free",
        text: "Works wonders on my daughter's curly hair. No more tears while combing!",
        productName: "Kids Conditioner",
        productImage: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/626232111170_FT_08.jpg?v=1756406829&width=2000&height=2000&crop=center"
    },
    {
        id: 5,
        name: "Mohib Khan",
        verified: true,
        date: "20/11/25",
        rating: 5,
        title: "Perfect for Daily Use",
        text: "My baby's hair feels so clean and soft. Highly recommend!",
        productName: "2-in-1 Baby Shampoo & Body Wash",
        productImage: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/body_soap_shampoo_baby_16613_3b6f7192-c053-4701-aa2f-fba280286b6b.jpg?v=1717620678&width=2000&height=2000&crop=center"
    },
    {
        id: 6,
        name: "Hafsa Z.",
        verified: true,
        date: "05/12/25",
        rating: 5,
        title: "Kid's Favorite",
        text: "They ask for the 'special shampoo' every night. Smells great!",
        productName: "2-in-1 Kids Shampoo & Body Wash",
        productImage: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/626232110173_FT_13.jpg?v=1756304881&width=2000&height=2000&crop=center"
    }
];

const CustomerReviews = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [reviews, setReviews] = useState(STATIC_REVIEWS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Reviews
                const resReviews = await fetch('/api/reviews');
                if (resReviews.ok) {
                    const data = await resReviews.json();
                    const validReviews = data.filter((r: any) => r.product && (r.product.imageUrl || (r.product.images && r.product.images.length > 0)));
                    if (validReviews.length > 0) {
                        const formatted = validReviews.map((r: any) => ({
                            id: r._id,
                            name: r.name,
                            verified: r.verified,
                            date: new Date(r.date).toLocaleDateString('en-GB'),
                            rating: r.rating,
                            title: r.title,
                            text: r.body,
                            productName: r.product.name,
                            productImage: (r.product.images && r.product.images.length > 0) ? r.product.images[0] : r.product.imageUrl,
                            productId: r.product._id
                        }));
                        setReviews(formatted);
                    }
                }

                // Fetch Products for Dropdown
                const resProducts = await fetch('/api/products');
                if (resProducts.ok) {
                    const productData = await resProducts.json();
                    setProducts(productData.map((p: any) => ({ id: p._id, name: p.name })));
                }
            } catch (error) {
                console.error('Failed to fetch data.', error);
            }
        };

        fetchData();
    }, []);

    const handleReviewSubmit = async (data: { rating: number; title: string; body: string; productId?: string }) => {
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, name: "Verified Customer" }),
            });

            if (res.ok) {
                alert('Review submitted successfully!');
                setIsModalOpen(false);
                // Optionally refetch reviews here
            } else {
                alert('Failed to submit review.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        }
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { current } = scrollRef;
                const maxScrollLeft = current.scrollWidth - current.clientWidth;

                if (current.scrollLeft >= maxScrollLeft - 10) {
                    current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    current.scrollBy({ left: 350, behavior: 'smooth' });
                }
            }
        }, 3000); // Auto scroll every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 350;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-16 w-full px-6 lg:px-12 bg-white mb-16">
            <ReviewFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleReviewSubmit}
                products={products}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#1c524f]">
                    See Why Customers Love Us
                </h2>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#1c524f] text-white px-6 py-2.5 rounded-md font-bold text-sm hover:bg-[#153e3c] transition-colors"
                    >
                        Leave a Review
                    </button>
                    {/* Arrows only visible on larger screens if desired, or always */}
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Slider Container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory"
            >
                {reviews.map((review: any) => (
                    <div
                        key={review.id}
                        className="min-w-[300px] md:min-w-[350px] bg-white border border-gray-100 rounded-lg p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow snap-start"
                    >
                        {/* Reviewer Header */}
                        <div className="flex justify-between items-start mb-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-900 text-sm">{review.name}</span>
                                {review.verified && (
                                    <span className="flex items-center gap-0.5 text-gray-400">
                                        <CheckCircle size={10} fill="currentColor" className="text-gray-400" /> Verified Buyer
                                    </span>
                                )}
                            </div>
                            <span>{review.date}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex text-[#D0D434] mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" className={i < review.rating ? "text-[#D4DF4E]" : "text-gray-200"} />
                            ))}
                        </div>

                        {/* Content */}
                        <div className="mb-8">
                            <h4 className="font-bold text-[#1c524f] text-lg mb-2 line-clamp-1">{review.title}</h4>
                            <p className="text-gray-600 leading-relaxed text-sm line-clamp-3">
                                {review.text}
                            </p>
                        </div>

                        {/* Product Footer */}
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                <Image
                                    src={review.productImage || '/placeholder.png'}
                                    alt={review.productName}
                                    fill
                                    className="object-contain p-0.5"
                                />
                            </div>
                            <Link href={review.productId ? `/product/${review.productId}` : '#'} className="text-xs text-gray-400 hover:text-[#1c524f] cursor-pointer truncate font-medium">
                                {review.productName}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CustomerReviews;
