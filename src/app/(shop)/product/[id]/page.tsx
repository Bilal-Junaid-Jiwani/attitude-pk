'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Minus, Plus, ChevronDown, Check } from 'lucide-react';
import ReviewsSection from '@/components/shop/ReviewsSection';
import { useCart } from '@/context/CartContext';

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    images: string[];
    category?: { name: string };
    fragrance?: { name: string };
    format?: { name: string };
    benefits?: string[];
    ingredients?: string;
    howToUse?: string;
    stock: number;
    subCategory?: string;
}

// Accordion Component Helper
const AccordionItem = ({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) => (
    <div className="border border-[#1c524f] rounded-lg mb-4 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-[#1c524f] bg-white hover:bg-gray-50 transition-colors"
        >
            <span className="text-lg">{title}</span>
            {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </button>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm">
                {children}
            </div>
        </div>
    </div>
);

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [openAccordion, setOpenAccordion] = useState<string | null>('description');
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscribe'>('onetime');
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            _id: product._id,
            name: product.name,
            price: currentPrice,
            imageUrl: activeImage,
            quantity: quantity,
            subCategory: product.subCategory
        });
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { id } = await params;
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                    // Set initial active image (prioritize array 0, or main imageUrl)
                    const initialImage = (data.images && data.images.length > 0) ? data.images[0] : data.imageUrl;
                    setActiveImage(initialImage);

                    // Fetch related products (just fetching all and picking 4 random ones)
                    const relatedRes = await fetch('/api/products');
                    if (relatedRes.ok) {
                        const allProducts: Product[] = await relatedRes.json();
                        // Filter out current product, shuffle, and take 4
                        const others = allProducts
                            .filter(p => p._id !== id)
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 4);
                        setRelatedProducts(others);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    const currentPrice = purchaseType === 'subscribe' ? product.price * 0.9 : product.price;

    return (
        <div className="min-h-screen bg-white pb-20 pt-10 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
                    <Link href="/" className="hover:text-[#1c524f]">Home</Link>
                    <span>/</span>
                    <Link href="/" className="hover:text-[#1c524f]">{product.category?.name || 'Shop'}</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </div>

                {/* LEFT COLUMN: Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 flex flex-col md:flex-row gap-4">
                            {/* Thumbnails (Vertical on Desktop) */}
                            <div className="hidden md:flex flex-col gap-4 w-20">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-20 h-24 border ${activeImage === img ? 'border-[#1c524f]' : 'border-transparent'} rounded-md overflow-hidden`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 relative">
                                <div className="relative w-full aspect-square md:aspect-[4/5] lg:aspect-square bg-transparent rounded-lg overflow-hidden">
                                    <Image
                                        src={activeImage}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Mobile Thumbnails (Horizontal) */}
                            <div className="md:hidden flex gap-4 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative flex-shrink-0 w-16 h-20 border ${activeImage === img ? 'border-[#1c524f]' : 'border-transparent'} rounded-md overflow-hidden`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-[#1c524f] mb-2">{product.name}</h1>
                            <p className="text-2xl font-bold text-gray-900">Rs. {currentPrice.toLocaleString()}</p>

                            {/* Stars */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex text-[#1c524f]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">(154 reviews)</span>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                <span className="flex items-center gap-1"><Check size={14} /> EWG Verified</span>
                                <span className="flex items-center gap-1"><Check size={14} /> Vegan</span>
                                <span className="flex items-center gap-1"><Check size={14} /> Dermatologically Tested</span>
                            </div>
                        </div>

                        {/* Fragrance Selector */}
                        {product.fragrance && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fragrance</label>
                                <div className="border border-gray-300 rounded-md p-3 text-gray-700 bg-white shadow-sm flex justify-between items-center cursor-pointer">
                                    <span>{product.fragrance.name}</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        )}

                        {/* Format Selector */}
                        {product.format && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Format</label>
                                <button className="border border-[#1c524f] bg-[#e8f5e9] text-[#1c524f] px-4 py-2 rounded-md text-sm font-bold">
                                    {product.format.name}
                                </button>
                            </div>
                        )}

                        {/* Purchase Options */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {/* One Time Purchase */}
                            <label
                                className={`flex items-center justify-between cursor-pointer p-3 rounded border shadow-sm transition-all ${purchaseType === 'onetime'
                                    ? 'bg-white border-[#1c524f] ring-1 ring-[#1c524f]'
                                    : 'bg-transparent border-transparent hover:bg-white'
                                    }`}
                                onClick={() => setPurchaseType('onetime')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${purchaseType === 'onetime' ? 'border-[#1c524f]' : 'border-gray-400'
                                        }`}>
                                        {purchaseType === 'onetime' && <div className="w-2 h-2 rounded-full bg-[#1c524f]" />}
                                    </div>
                                    <span className={`font-bold ${purchaseType === 'onetime' ? 'text-gray-900' : 'text-gray-700'}`}>
                                        One time purchase
                                    </span>
                                </div>
                                <span className={`font-bold ${purchaseType === 'onetime' ? 'text-[#1c524f]' : 'text-gray-900'}`}>
                                    Rs. {product.price.toLocaleString()}
                                </span>
                            </label>

                            {/* Subscribe and Save */}
                            <label
                                className={`flex items-center justify-between cursor-pointer p-3 rounded border transition-all ${purchaseType === 'subscribe'
                                    ? 'bg-white border-[#1c524f] ring-1 ring-[#1c524f]'
                                    : 'bg-transparent border-transparent hover:bg-white'
                                    }`}
                                onClick={() => setPurchaseType('subscribe')}
                            >
                                <div className="flex items-center gap-3 opacity-90">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${purchaseType === 'subscribe' ? 'border-[#1c524f]' : 'border-gray-400'
                                        }`}>
                                        {purchaseType === 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#1c524f]" />}
                                    </div>
                                    <span className={`font-medium ${purchaseType === 'subscribe' ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                        Subscribe and save -10%
                                    </span>
                                </div>
                                <span className={`text-gray-500 ${purchaseType === 'subscribe' ? 'text-[#1c524f] font-bold' : ''}`}>
                                    Rs. {(product.price * 0.9).toLocaleString()}
                                </span>
                            </label>
                        </div>

                        {/* Add to Cart Actions */}
                        <div className="flex gap-4">
                            <div className="flex items-center bg-white border border-gray-300 rounded-md">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center hover:bg-gray-50">
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-12 flex items-center justify-center hover:bg-gray-50">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#1c524f] text-white font-bold rounded-md hover:bg-[#153e3c] transition-colors flex items-center justify-center gap-2"
                            >
                                Add to cart
                            </button>
                        </div>

                        {/* Accordions (Boxed Style) */}
                        <div className="mt-8 flex flex-col gap-[-1px]">
                            {/* Description */}
                            <AccordionItem
                                title="Description"
                                isOpen={openAccordion === 'description'}
                                onClick={() => toggleAccordion('description')}
                            >
                                <p>{product.description}</p>
                            </AccordionItem>

                            {/* Benefits */}
                            {product.benefits && product.benefits.length > 0 && (
                                <AccordionItem
                                    title="Benefits"
                                    isOpen={openAccordion === 'benefits'}
                                    onClick={() => toggleAccordion('benefits')}
                                >
                                    <ul className="list-disc pl-5 space-y-1">
                                        {product.benefits.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </AccordionItem>
                            )}

                            {/* Ingredients */}
                            {product.ingredients && (
                                <AccordionItem
                                    title="Ingredients"
                                    isOpen={openAccordion === 'ingredients'}
                                    onClick={() => toggleAccordion('ingredients')}
                                >
                                    <p>{product.ingredients}</p>
                                </AccordionItem>
                            )}

                            {/* How to Use */}
                            {product.howToUse && (
                                <AccordionItem
                                    title="How to Use"
                                    isOpen={openAccordion === 'howToUse'}
                                    onClick={() => toggleAccordion('howToUse')}
                                >
                                    <p>{product.howToUse}</p>
                                </AccordionItem>
                            )}
                        </div>
                    </div>
                </div>

                {/* Frequently Bought With Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 pt-16">
                        <h3 className="text-2xl font-bold text-[#1c524f] mb-8">Frequently bought with</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((related) => (
                                <div key={related._id} className="flex flex-col items-center text-center group">
                                    <Link href={`/product/${related._id}`} className="block relative w-full aspect-[3/4] mb-4 bg-transparent rounded-lg overflow-hidden">
                                        <Image
                                            src={related.imageUrl}
                                            alt={related.name}
                                            fill
                                            className="object-contain group-hover:scale-105 transition-all duration-500"
                                        />
                                    </Link>
                                    <Link href={`/product/${related._id}`} className="font-bold text-gray-900 hover:text-[#1c524f] mb-2 line-clamp-2 min-h-[48px]">
                                        {related.name}
                                    </Link>
                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex text-[#1c524f]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill="currentColor" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">(50)</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart({
                                            _id: related._id,
                                            name: related.name,
                                            price: related.price,
                                            imageUrl: related.imageUrl,
                                            quantity: 1,
                                            subCategory: related.subCategory
                                        })}
                                        className="w-full bg-[#1c524f] text-white font-bold py-2.5 rounded-md hover:bg-[#153e3c] transition-colors text-sm"
                                    >
                                        Add Rs. {related.price.toLocaleString()}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <ReviewsSection />

            </div>
        </div>
    );
}
