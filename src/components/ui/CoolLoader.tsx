'use client';

import { motion } from 'framer-motion';
import React from 'react';

export default function CoolLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-4 h-4 rounded-full bg-[#1c524f]"
                        animate={{
                            y: ["0%", "-100%", "0%"],
                            opacity: [1, 0.5, 1],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
            {/* Minimalist text or none at all - User said "change loader", usually simpler is better */}
        </div>
    );
}
