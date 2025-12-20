'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1544126566-47a324331d51?q=80&w=1920&auto=format&fit=crop', // Mum and baby natural
        title: 'Pure Love, Pure Care',
        subtitle: 'Hypoallergenic essentials crafted for your little one\'s delicate skin.',
        cta: 'Shop Baby',
        link: '/baby',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1920&auto=format&fit=crop', // Kids playing
        title: 'Adventures in Nature',
        subtitle: 'Safe, eco-friendly products that let kids explore worry-free.',
        cta: 'Shop Kids',
        link: '/kids',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1920&auto=format&fit=crop', // Clean home
        title: 'A Healthy Home',
        subtitle: 'Plant-based cleaning power for a safer living environment.',
        cta: 'Shop Home',
        link: '/home',
    },
];

const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[85vh] overflow-hidden bg-gray-900">
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover transition-transform duration-[10000ms] ease-linear transform scale-105" // Slow zoom effect
                        />
                        <div className="absolute inset-0 bg-black/30 md:bg-black/20" /> {/* Dimmer overlay */}
                    </div>

                    {/* Content */}
                    <div className="relative z-20 h-full flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
                        <div className={`max-w-3xl space-y-6 transition-all duration-1000 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}>
                            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg font-heading">
                                {slide.title}
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-100 font-light max-w-2xl mx-auto drop-shadow-md">
                                {slide.subtitle}
                            </p>
                            <div className="pt-4">
                                <Link
                                    href={slide.link}
                                    className="inline-flex items-center px-8 py-4 bg-primary text-white text-lg font-semibold rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                                >
                                    {slide.cta}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
