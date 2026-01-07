'use client';

import React from 'react';
import { Check, Package, Truck, Home, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderTimelineProps {
    status: string;
    cancelled?: boolean;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, cancelled }) => {
    const steps = [
        { id: 'pending', label: 'Order Placed', date: 'Step 1', icon: Package },
        { id: 'processing', label: 'Processing', date: 'Step 2', icon: Home },
        { id: 'shipped', label: 'Shipped', date: 'Step 3', icon: Truck },
        { id: 'delivered', label: 'Delivered', date: 'Step 4', icon: Check },
    ];

    let currentStepIndex = 0;
    switch (status.toLowerCase()) {
        case 'pending': currentStepIndex = 0; break;
        case 'processing': currentStepIndex = 1; break;
        case 'shipped': currentStepIndex = 2; break;
        case 'delivered': currentStepIndex = 3; break;
        default: currentStepIndex = 0;
    }

    if (cancelled) {
        return (
            <div className="w-full bg-red-50 p-6 rounded-xl flex flex-col items-center justify-center text-red-600 border border-red-100 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <X size={24} />
                </div>
                <span className="font-bold text-lg">Order Cancelled</span>
                <span className="text-sm opacity-80">Please contact support if you need help.</span>
            </div>
        );
    }

    // Progress percentage for the bar
    const progress = (currentStepIndex / (steps.length - 1)) * 100;

    return (
        <div className="w-full py-8 px-2">
            <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
                {/* Track Background */}
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -z-10 transform -translate-y-1/2 rounded-full" />

                {/* Animated Progress Bar */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-[#1c524f] to-[#2a7a75] -z-10 transform -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(28,82,79,0.3)]"
                />

                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative group">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 z-10 bg-white relative
                                    ${isActive
                                        ? 'border-[#1c524f] text-[#1c524f] shadow-lg'
                                        : 'border-gray-200 text-gray-300'
                                    }
                                    ${isCompleted ? '!bg-[#1c524f] !text-white !border-[#1c524f]' : ''}
                                    ${isCurrent ? 'ring-4 ring-[#1c524f]/10 scale-110' : ''}
                                `}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Check size={20} strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <Icon size={20} strokeWidth={isCurrent ? 2.5 : 2} />
                                )}

                                {/* Pulse Effect for Current Step */}
                                {isCurrent && status !== 'delivered' && (
                                    <span className="absolute inset-0 rounded-full animate-ping bg-[#1c524f] opacity-20" />
                                )}
                            </motion.div>

                            <div className="absolute top-full mt-4 flex flex-col items-center text-center">
                                <span className={`text-xs sm:text-sm font-bold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#1c524f]' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <motion.span
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mt-1 border border-green-100"
                                    >
                                        Current Status
                                    </motion.span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Spacing for labels */}
            <div className="h-12 sm:h-16" />
        </div>
    );
};

export default OrderTimeline;
