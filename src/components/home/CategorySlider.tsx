'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
    {
        id: 1,
        name: "Baby Shampoo + Body Wash",
        image: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/BL_Shower_d4b8ecb5-0ebc-44f8-9535-695c77073ffb.jpg?v=1754313904&width=2000&height=2000&crop=center",
        link: "/collections/baby/shampoo-wash"
    },
    {
        id: 2,
        name: "Lotion & Creams",
        image: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/BL_Cream-Body_1.jpg?v=1754314515&width=2000&height=2000&crop=center",
        link: "/collections/baby/lotion"
    },
    {
        id: 3,
        name: "Baby Cleaning",
        image: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/BL-Home_Dishwashing-700ml_1.jpg?v=1754322598&width=2000&height=2000&crop=center",
        link: "/collections/baby/cleaning"
    },
    {
        id: 4,
        name: "Kids Shampoo + Body Wash",
        image: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/PDP-IS_LL_Bubblewash.jpg?v=1759286625&width=2000&height=2000&crop=center",
        link: "/collections/kids/shampoo-wash"
    },
    {
        id: 5,
        name: "Conditioner",
        image: "https://cdn.shopify.com/s/files/1/0785/4509/2921/files/PDP-IS_LL_conditioner.jpg?v=1759326472&width=2000&height=2000&crop=center",
        link: "/collections/kids/conditioner"
    },
];

const CategorySlider = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 420; // Card width + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-20 w-full bg-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 px-6 md:px-12">
                <div>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#1c524f] mb-3">
                        One-Stop Shop
                    </h2>
                    <p className="text-lg text-gray-500 font-medium">Everything your little ones need.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => scroll('left')}
                        className="p-3 rounded-full border border-gray-200 hover:bg-[#1c524f] hover:text-white hover:border-[#1c524f] text-gray-500 transition-all shadow-sm"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-3 rounded-full border border-gray-200 hover:bg-[#1c524f] hover:text-white hover:border-[#1c524f] text-gray-500 transition-all shadow-sm"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Scrolling Container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar pb-10 snap-x snap-mandatory px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {CATEGORIES.map((category) => (
                    <Link
                        key={category.id}
                        href={category.link}
                        className="min-w-[320px] md:min-w-[400px] h-[550px] relative rounded-[2.5rem] overflow-hidden group snap-start shadow-md hover:shadow-2xl transition-all duration-500 first:ml-5 md:first:ml-20 last:mr-5 md:last:mr-20"
                    >
                        <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c524f]/90 via-[#1c524f]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                            <h3 className="text-white font-bold text-3xl font-heading mb-2 leading-tight drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                {category.name}
                            </h3>

                            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
                                <span className="inline-flex items-center gap-2 text-white/90 text-sm font-bold uppercase tracking-wider mt-4">
                                    Shop Collection <ArrowRight size={16} />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategorySlider;
