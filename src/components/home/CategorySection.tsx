'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CategorySection = () => {
    return (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-heading font-bold text-[#1c524f]"
                >
                    Browse by Category
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-4 text-gray-600 max-w-2xl mx-auto"
                >
                    Discover our specialized care collections designed tailored for your little ones.
                </motion.p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Baby Category */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <Link href="/collections/baby" className="group relative block h-[28rem] md:h-[40rem] w-full rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="absolute inset-0 bg-gray-200">
                            <Image
                                src="https://cdn.shopify.com/s/files/1/0785/4509/2921/files/Promocard_Bebe.jpg?v=1760646714&width=1200&height=1200&crop=center"
                                alt="Baby Collection"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c524f]/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14 text-white z-10 transition-all">
                            <h3 className="text-5xl md:text-7xl font-heading font-bold mb-3 md:mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Baby</h3>
                            <p className="text-lg md:text-xl opacity-90 font-medium mb-6 md:mb-8 max-w-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                Gentle care for delicate skin.
                            </p>

                            <span className="inline-flex items-center gap-3 bg-white text-[#1c524f] rounded-full px-6 py-3 md:px-8 md:py-4 w-fit text-xs md:text-sm font-bold tracking-wider uppercase hover:bg-[#1c524f] hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-500 delay-150">
                                Shop Baby
                                <ArrowRight size={18} />
                            </span>
                        </div>
                    </Link>
                </motion.div>

                {/* Kids Category - Offset for masonry feel */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:mt-20" // Vertical Offset
                >
                    <Link href="/collections/kids" className="group relative block h-[28rem] md:h-[40rem] w-full rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="absolute inset-0 bg-gray-200">
                            <Image
                                src="https://cdn.shopify.com/s/files/1/0785/4509/2921/files/Promocard_Enfants_2d60b4bd-176e-46ac-b040-7723fad8c2c9.jpg?v=1760646767&width=1200&height=1200&crop=center"
                                alt="Kids Collection"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c524f]/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14 text-white z-10 transition-all">
                            <h3 className="text-5xl md:text-7xl font-heading font-bold mb-3 md:mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Kids</h3>
                            <p className="text-lg md:text-xl opacity-90 font-medium mb-6 md:mb-8 max-w-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                Fun & safe for growing explorers.
                            </p>

                            <span className="inline-flex items-center gap-3 bg-white text-[#1c524f] rounded-full px-6 py-3 md:px-8 md:py-4 w-fit text-xs md:text-sm font-bold tracking-wider uppercase hover:bg-[#1c524f] hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-500 delay-150">
                                Shop Kids
                                <ArrowRight size={18} />
                            </span>
                        </div>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CategorySection;
