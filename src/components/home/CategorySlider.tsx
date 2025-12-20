'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
    {
        id: 1,
        name: "Home Care",
        image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=800&auto=format&fit=crop",
        link: "/shop/home-care"
    },
    {
        id: 2,
        name: "Hair Care",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
        link: "/shop/hair-care"
    },
    {
        id: 3,
        name: "Body Care",
        image: "https://images.unsplash.com/photo-1556228578-8d84fdd64eb2?q=80&w=800&auto=format&fit=crop", // Soapy hands/body
        link: "/shop/body-care"
    },
    {
        id: 4,
        name: "Skincare",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop", // Orange bottles (Oceanly style)
        link: "/shop/skincare"
    },
    {
        id: 5,
        name: "Baby",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
        link: "/baby"
    },
    {
        id: 6,
        name: "Sun Care",
        image: "https://images.unsplash.com/photo-1532413992378-f169ac26fff0?q=80&w=800&auto=format&fit=crop",
        link: "/shop/sun-care"
    },
];

const CategorySlider = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 320; // Approx card width + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-16 w-full px-6 lg:px-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1c524f]">
                    One-Stop Shop for All Your Needs
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Scrolling Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory"
            >
                {CATEGORIES.map((category) => (
                    <Link
                        key={category.id}
                        href={category.link}
                        className="min-w-[280px] md:min-w-[320px] h-[400px] relative rounded-2xl overflow-hidden group snap-start bg-gray-100"
                    >
                        <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                        {/* Text */}
                        <div className="absolute bottom-6 left-6 z-10">
                            <h3 className="text-white font-bold text-2xl font-heading">{category.name}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategorySlider;
