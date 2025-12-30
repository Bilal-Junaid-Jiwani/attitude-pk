
'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    imageUrl: string;
}

interface CreateReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateReviewModal = ({ isOpen, onClose, onSuccess }: CreateReviewModalProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        productId: '',
        name: '',
        rating: 5,
        title: '',
        body: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            // Reset form on open
            setFormData({
                productId: '',
                name: '',
                rating: 5,
                title: '',
                body: ''
            });
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            // Using public products API for dropdown
            const res = await fetch('/api/products?limit=100'); // Assuming this fetches a list
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data.products) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId) {
            toast.error('Please select a product');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Review created successfully');
                onSuccess();
                onClose();
            } else {
                toast.error('Failed to create review');
            }
        } catch (error) {
            console.error('Error creating review:', error);
            toast.error('Error creating review');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Create Fake Review</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        {loadingProducts ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Loader2 className="animate-spin" size={16} /> Loading products...
                            </div>
                        ) : (
                            <select
                                className="w-full p-2 border rounded-md focus:ring-[#1c524f] focus:border-[#1c524f] outline-none"
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                required
                            >
                                <option value="">-- Choose a Product --</option>
                                {products.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Guest)</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md focus:ring-[#1c524f] focus:border-[#1c524f] outline-none"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className={`p-1 transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star size={24} fill="currentColor" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md focus:ring-[#1c524f] focus:border-[#1c524f] outline-none"
                            placeholder="e.g. Amazing product!"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Content</label>
                        <textarea
                            className="w-full p-2 border rounded-md h-24 focus:ring-[#1c524f] focus:border-[#1c524f] outline-none resize-none"
                            placeholder="Write the fake review here..."
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-[#1c524f] text-white rounded-md font-medium hover:bg-[#153e3c] transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="animate-spin" size={16} />}
                            Create Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReviewModal;
