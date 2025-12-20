'use client';

import React from 'react';

const MARQUEE_ITEMS = [
    "High Performance",
    "EWG Verified®",
    "Vegan & Cruelty Free",
    "High Performance",
    "EWG Verified®",
    "Vegan & Cruelty Free",
    "High Performance",
    "EWG Verified®",
    "Vegan & Cruelty Free",
];

const Marquee = () => {
    // Duplicate the items enough times to ensure they fill wide screens, then double that block for the loop.
    // We already have a good list. Let's make "one set" be the current list repeated twice (to be safe on wide screens), 
    // and then render that "set" twice in the DOM for the 50% loop.

    const ONE_SET = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]; // 2x original list = ~18 items. Should cover any screen.

    return (
        <div className="w-full bg-white border-y border-primary py-4 overflow-hidden relative">
            <div className="flex animate-marquee hover:[animation-play-state:paused]">
                {/* SET 1 */}
                <div className="flex gap-16 px-8 items-center">
                    {ONE_SET.map((item, idx) => (
                        <span key={`s1-${idx}`} className="text-sm md:text-base font-bold tracking-widest uppercase text-primary whitespace-nowrap">
                            {item}
                        </span>
                    ))}
                </div>
                {/* SET 2 (Identical for loop) */}
                <div className="flex gap-16 px-8 items-center">
                    {ONE_SET.map((item, idx) => (
                        <span key={`s2-${idx}`} className="text-sm md:text-base font-bold tracking-widest uppercase text-primary whitespace-nowrap">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Marquee;
