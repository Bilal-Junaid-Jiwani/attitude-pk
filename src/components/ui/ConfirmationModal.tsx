'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-50 text-red-600' :
                                    variant === 'warning' ? 'bg-amber-50 text-amber-600' :
                                        'bg-blue-50 text-blue-600'
                                }`}>
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>

                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                                        variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                                            'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
