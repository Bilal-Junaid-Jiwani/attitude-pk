'use client';

import React from 'react';
import { Truck, Leaf, ShieldCheck, Banknote } from 'lucide-react';

const FEATURES = [
    {
        icon: Truck,
        title: "Free Shipping",
        subtitle: "On all orders over Rs. 5000"
    },
    {
        icon: Leaf,
        title: "100% Organic",
        subtitle: "Natural & Hypoallergenic ingredients"
    },
    {
        icon: Banknote,
        title: "Cash on Delivery",
        subtitle: "Pay when you receive your order"
    },
    {
        icon: ShieldCheck,
        title: "Secure Payment",
        subtitle: "100% Secure Checkout process"
    }
];

const FeaturesBanner = () => {
    return (
        <section className="w-full bg-[#1c524f] text-white py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            <div className="mb-4 p-3 rounded-full border border-white/20 group-hover:bg-white/10 transition-colors">
                                <feature.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold font-heading mb-1">{feature.title}</h3>
                            <p className="text-white/80 text-sm">{feature.subtitle}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesBanner;
