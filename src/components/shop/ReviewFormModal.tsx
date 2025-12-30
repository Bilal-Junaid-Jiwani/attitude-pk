'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface ReviewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { rating: number; title: string; body: string; productId?: string; name?: string }) => void;
    products?: { id: string; name: string }[];
    showNameInput?: boolean;
}

export default function ReviewFormModal({ isOpen, onClose, onSubmit, products, showNameInput = false }: ReviewFormModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [name, setName] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return; // Validate rating
        if (products && products.length > 0 && !selectedProductId) return; // Validate product selection if required
        if (showNameInput && !name.trim()) return; // Validate name if required

        onSubmit({ rating, title, body, productId: selectedProductId, name: showNameInput ? name : undefined });

        // Reset form
        setRating(0);
        setTitle('');
        setBody('');
        setName('');
        setSelectedProductId('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Name Input (Guest Only) */}
                            {showNameInput && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            )}

                            {/* Product Selection (Only needed if products provided) */}
                            {products && products.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Select Product</label>
                                    <select
                                        required
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="" disabled>Choose a product...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Rating */}
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">How would you rate this product?</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={32}
                                                fill={(hoverRating || rating) >= star ? '#1c524f' : 'transparent'}
                                                className={(hoverRating || rating) >= star ? 'text-[#1c524f]' : 'text-gray-300'}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500 h-4">
                                    {rating > 0 ? (rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Fair' : 'Poor') : ''}
                                </span>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Review Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Summarize your experience"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Body */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Review</label>
                                <textarea
                                    required
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="What did you like or dislike? How was the quality?"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rating === 0 || (!!products && products.length > 0 && !selectedProductId) || (showNameInput && !name.trim())}
                                    className="flex-1 py-3 rounded-lg bg-[#1c524f] text-white font-bold hover:bg-[#153e3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
