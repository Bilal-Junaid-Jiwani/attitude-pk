'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const SLIDES = [
    {
        id: 1,
        title: "2-in-1 Kids Shampoo & Body Wash",
        description: "Gently cleanses kids’ delicate hair and skin",
        buttonText: "Shop Now",
        link: "/shop",
        image: "/slider-images/slide-new-1.jpg", // New Uploaded: Green bottles (jpg)
        bgColor: "bg-[#F5F5F3]"
    },
    {
        id: 2,
        title: "Kids Conditioner",
        description: "Revitalizes kids’ delicate hair",
        buttonText: "Shop Now",
        link: "/baby",
        image: "/slider-images/slide-new-2.jpg", // New Uploaded: Baby & Purple Tube (jpg)
        bgColor: "bg-[#F5F5F3]"
    },

];

const PromotionalSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    const slide = SLIDES[currentSlide];

    return (
        <section className="py-8 w-full max-w-[95%] mx-auto px-0">
            <div className="relative w-full h-[500px] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">

                {/* Text Side (Left) */}
                {/* Text Side (Left) */}
                <div className={`w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center items-start z-10 ${slide.bgColor} transition-colors duration-500`}>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#1c524f] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700" key={`title-${currentSlide}`}>
                        {slide.title}
                    </h2>
                    <p className="text-[#1c524f] mb-8 max-w-sm text-lg font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" key={`desc-${currentSlide}`}>
                        {slide.description}
                    </p>
                    <Link
                        href={slide.link}
                        className="bg-[#1c524f] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-[#153e3c] transition-all shadow-md hover:shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
                        key={`btn-${currentSlide}`}
                    >
                        {slide.buttonText}
                    </Link>
                </div>

                {/* Image Side (Right) */}
                <div className="relative w-full md:w-1/2 h-full">
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/5" /> {/* Subtle contrast overlay */}
                </div>

                {/* Navigation Controls (Centered Floating Pill) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur pl-6 pr-2 py-2 rounded-full shadow-lg z-20">
                    <div className="flex gap-1.5">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#1c524f] w-6' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-1 ml-4">
                        <button onClick={prevSlide} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1c524f]">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextSlide} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1c524f]">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PromotionalSlider;
