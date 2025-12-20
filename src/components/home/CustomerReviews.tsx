'use client';

import React, { useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';

const REVIEWS = [
    {
        id: 1,
        name: "Ayesha K.",
        verified: true,
        date: "12/12/25",
        rating: 5,
        title: "fresh",
        text: "after brushing my teeth, feels great!",
        productName: "Fluoride Toothpaste - Fresh Breath",
        productImage: "/slider-images/product1.webp"
    },
    {
        id: 2,
        name: "Bilal Ahmed",
        verified: true,
        date: "10/11/25",
        rating: 5,
        title: "great",
        text: "It makes my laundry very soft.",
        productName: "Fabric Softener - Wildflowers",
        productImage: "/slider-images/product2.webp"
    },
    {
        id: 3,
        name: "Moiz Siddiqui",
        verified: true,
        date: "08/12/25",
        rating: 5,
        title: "best hand soap",
        text: "love this hand soap, can't compare any other product.",
        productName: "Hand Soap - Olive Leaves",
        productImage: "/slider-images/product3.webp"
    },
    {
        id: 4,
        name: "Noor Muhammad",
        verified: true,
        date: "15/12/25",
        rating: 5,
        title: "great",
        text: "I've used this one for long time, I feel my hair getting very thick and healthy.",
        productName: "Rich Moisturizing Conditioner",
        productImage: "/slider-images/product4.webp"
    },
    {
        id: 5,
        name: "Mohib Khan",
        verified: true,
        date: "20/11/25",
        rating: 5,
        title: "best shampoo",
        text: "works great and smells good.",
        productName: "Rich Moisturizing Shampoo",
        productImage: "/slider-images/product1.webp"
    },
    {
        id: 6,
        name: "Hafsa Z.",
        verified: true,
        date: "05/12/25",
        rating: 5,
        title: "Love it!",
        text: "My kids love the bubble bath. Very gentle.",
        productName: "Bubble Wash - Pear Nectar",
        productImage: "/slider-images/product2.webp"
    }
];

const CustomerReviews = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

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
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#1c524f]">
                    See Why Customers Love Us
                </h2>

                <div className="flex items-center gap-4">
                    <button className="bg-[#1c524f] text-white px-6 py-2.5 rounded-md font-bold text-sm hover:bg-[#153e3c] transition-colors">
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
                {REVIEWS.map((review) => (
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
                            <h4 className="font-bold text-[#1c524f] text-lg mb-2">{review.title}</h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {review.text}
                            </p>
                        </div>

                        {/* Product Footer */}
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                <Image
                                    src={review.productImage}
                                    alt={review.productName}
                                    fill
                                    className="object-contain p-0.5"
                                />
                            </div>
                            <span className="text-xs text-gray-400 hover:text-[#1c524f] cursor-pointer truncate">
                                {review.productName}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CustomerReviews;
