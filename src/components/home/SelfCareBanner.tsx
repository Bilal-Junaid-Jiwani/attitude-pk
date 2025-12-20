'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SelfCareBanner = () => {
    return (
        <section className="w-full py-16">
            <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
                {/* Background Image */}
                <Image
                    src="/slider-images/banner.png" // User provided banner
                    alt="Bubble Washes"
                    fill
                    className="object-cover object-right"
                />

                {/* Gradient Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent md:w-1/2" />

                {/* Content Container */}
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-lg">
                            {/* Pill Badge */}
                            <div className="inline-block px-4 py-1.5 rounded-full border border-[#1c524f] text-[#1c524f] text-sm font-medium tracking-wide mb-6">
                                Baby
                            </div>

                            <h2 className="text-5xl md:text-6xl font-heading font-bold text-[#1c524f] mb-4">
                                2-in-1 Kids Shampoo & Body Wash
                            </h2>

                            <p className="text-gray-600 text-lg mb-8 font-medium">
                                Gently cleanses kids’ delicate hair and skin
                            </p>

                            <Link
                                href="/shop"
                                className="bg-[#1c524f] text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide hover:bg-[#153e3c] transition-colors shadow-lg hover:shadow-xl inline-block"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SelfCareBanner;
