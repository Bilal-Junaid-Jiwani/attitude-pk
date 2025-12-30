'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export interface Product {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    imageUrl: string;
    images?: string[];
    category?: { name: string };
    subCategory?: string;
    stock: number;
}

const ProductCard = ({ product }: { product: Product }) => {
    const { addToCart } = useCart();
    const secondImage = product.images?.[1];

    const hasDiscount = (product.compareAtPrice || 0) > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
        : 0;

    const discountAmount = hasDiscount
        ? product.compareAtPrice! - product.price
        : 0;

    return (
        <div className="group flex flex-col items-center text-center bg-white p-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in zoom-in duration-500 relative border border-transparent hover:border-gray-100">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                {product.stock < 5 && product.stock > 0 && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm border border-red-100 shadow-sm">
                        Low Stock
                    </span>
                )}
                {product.stock === 0 && (
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm border border-gray-200">
                        Out of Stock
                    </span>
                )}
                {hasDiscount && (
                    <span className="bg-[#d72c0d] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm shadow-sm animate-pulse">
                        {discountPercentage}% OFF
                    </span>
                )}
            </div>

            {/* Image Area */}
            <Link href={`/product/${product._id}`} className="block relative aspect-[4/5] w-full mb-3 overflow-hidden bg-transparent rounded-lg cursor-pointer">
                {/* Main Image */}
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={`object-contain transition-all duration-700 group-hover:scale-105 ${secondImage ? 'group-hover:opacity-0' : ''}`}
                />

                {/* Second Image (Hover) */}
                {secondImage && (
                    <Image
                        src={secondImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="absolute inset-0 object-contain transition-all duration-700 group-hover:scale-105 opacity-0 group-hover:opacity-100"
                    />
                )}
            </Link>

            {/* Details */}
            <div className="flex-1 w-full flex flex-col items-center">
                <h3 className="font-heading font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-[#1c524f] transition-colors">
                    <Link href={`/product/${product._id}`}>
                        {product.name}
                    </Link>
                </h3>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">
                    {product.subCategory || product.category?.name}
                </p>

                {/* Stars */}
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex text-[#1c524f]">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" className="text-[#1c524f]" />
                        ))}
                    </div>
                    {/* Deterministic fake review count based on ID to avoid hydration mismatch */}
                    <span className="text-[10px] text-gray-400 font-medium">
                        ({(product._id.charCodeAt(product._id.length - 1) * 3) + 50})
                    </span>
                </div>

                {/* Price Display */}
                <div className="mb-3 h-6 flex items-center justify-center gap-2">
                    {hasDiscount ? (
                        <>
                            <span className="text-gray-400 line-through text-xs font-medium">
                                Rs. {product.compareAtPrice!.toLocaleString()}
                            </span>
                            <span className="text-[#d72c0d] font-bold text-base">
                                Rs. {product.price.toLocaleString()}
                            </span>
                        </>
                    ) : (
                        <span className="font-bold text-[#1c524f] text-base">
                            Rs. {product.price.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Button */}
                <div className="w-full mt-auto">
                    <button
                        onClick={() => addToCart({
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            quantity: 1,
                            subCategory: product.subCategory
                        })}
                        disabled={product.stock === 0}
                        className="w-full bg-[#1c524f] text-white py-2.5 px-3 rounded-sm font-bold text-xs tracking-wide hover:bg-[#153e3c] transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-hover:translate-y-0 translate-y-0"
                    >
                        <ShoppingCart size={14} />
                        <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
