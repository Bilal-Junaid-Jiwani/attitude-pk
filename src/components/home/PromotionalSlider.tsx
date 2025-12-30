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
        link: "/collections/baby/shampoo-wash",
        image: "/slider-images/slide-new-1.jpg", // New Uploaded: Green bottles (jpg)
        bgColor: "bg-[#F5F5F3]"
    },
    {
        id: 2,
        title: "Kids Conditioner",
        description: "Revitalizes kids’ delicate hair",
        buttonText: "Shop Now",
        link: "/collections/kids/conditioner",
        image: "/slider-images/slide-new-2.jpg", // New Uploaded: Baby & Purple Tube (jpg)
        bgColor: "bg-[#F5F5F3]"
    },

];

import { motion, AnimatePresence } from 'framer-motion';

const PromotionalSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-scroll effect
    React.useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, [currentSlide]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    const slide = SLIDES[currentSlide];

    return (
        <section className="py-8 w-full max-w-[95%] mx-auto px-0">
            <div className="relative rounded-3xl overflow-hidden shadow-sm group bg-[#F5F5F3] h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-full h-full absolute inset-0"
                    >
                        <Link href={slide.link} className="block w-full h-full cursor-pointer">
                            <div className="flex flex-col md:flex-row h-full">

                                {/* Text Side (Left) */}
                                <div className={`w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center items-start z-10 ${slide.bgColor} transition-colors duration-500`}>
                                    <motion.h2
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="text-4xl md:text-5xl font-heading font-bold text-[#1c524f] mb-4"
                                    >
                                        {slide.title}
                                    </motion.h2>
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="text-[#1c524f] mb-8 max-w-sm text-lg font-medium"
                                    >
                                        {slide.description}
                                    </motion.p>
                                    {/* Visual Button */}
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                        className="bg-[#1c524f] text-white px-8 py-3 rounded-md font-bold text-sm group-hover:bg-[#153e3c] transition-all shadow-md group-hover:shadow-lg inline-block pointer-events-none"
                                        tabIndex={-1}
                                    >
                                        {slide.buttonText}
                                    </motion.button>
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
                                    <div className="absolute inset-0 bg-black/5" />
                                </div>

                            </div>
                        </Link>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur pl-6 pr-2 py-2 rounded-full shadow-lg z-20 pointer-events-auto">
                    <div className="flex gap-1.5">
                        {SLIDES.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#1c524f] w-6' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-1 ml-4">
                        <button
                            onClick={(e) => { e.preventDefault(); prevSlide(); }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1c524f]"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextSlide(); }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1c524f]"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromotionalSlider;
