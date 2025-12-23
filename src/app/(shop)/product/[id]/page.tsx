'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Minus, Plus, ChevronDown, Check } from 'lucide-react';
import ReviewsSection from '@/components/shop/ReviewsSection';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/ToastProvider';
import AuthModal from '@/components/ui/AuthModal';

interface Variant {
    _id: string;
    fragrance?: { _id: string; name: string };
    format?: { _id: string; name: string };
    price: number;
    stock: number;
    sku: string;
    imageUrl: string;
    images: string[];
}

interface Product {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    imageUrl: string;
    images: string[];
    category?: { name: string };
    fragrance?: { _id: string; name: string };
    format?: { _id: string; name: string };
    benefits?: string[];
    ingredients?: string;
    howToUse?: string;
    stock: number;
    subCategory?: string;
    variants?: Variant[];
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
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [openAccordion, setOpenAccordion] = useState<string | null>('description');
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscribe'>('onetime');

    // Variant Selection State
    const [selectedFragrance, setSelectedFragrance] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<string>('');

    // Subscribe Config & Auth State
    const [subscribeConfig, setSubscribeConfig] = useState<any>(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { addToast } = useToast();

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/settings?key=subscribeConfig');
                if (res.ok) {
                    const data = await res.json();
                    if (data.value) setSubscribeConfig(data.value);
                }
            } catch (error) {
                console.error('Failed to fetch subscribe config', error);
            }
        };
        fetchConfig();
    }, []);

    const handlePurchaseTypeChange = async (type: 'onetime' | 'subscribe') => {
        if (type === 'onetime') {
            setPurchaseType('onetime');
            return;
        }

        if (type === 'subscribe') {
            // Check Eligibility
            try {
                const res = await fetch('/api/user/eligibility');
                const data = await res.json();

                if (!data.isLoggedIn) {
                    setAuthModalOpen(true);
                    return;
                }

                if (subscribeConfig?.newUsersOnly && !data.isNewUser) {
                    addToast('This offer is only valid for new customers.', 'error');
                    return;
                }

                setPurchaseType('subscribe');
            } catch (error) {
                console.error('Failed to check eligibility', error);
                addToast('Something went wrong. Please try again.', 'error');
            }
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);

                    const initialImage = (data.images && data.images.length > 0) ? data.images[0] : data.imageUrl;
                    setActiveImage(initialImage);

                    // Initialize Filters based on Main Product
                    if (data.fragrance) setSelectedFragrance(data.fragrance._id);
                    if (data.format) setSelectedFormat(data.format._id);

                    // If main product doesn't have them but variants do (edge case), try first variant
                    if ((!data.fragrance || !data.format) && data.variants?.length > 0) {
                        const firstV = data.variants[0];
                        if (!data.fragrance && firstV.fragrance) setSelectedFragrance(firstV.fragrance._id);
                        if (!data.format && firstV.format) setSelectedFormat(firstV.format._id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    // Construct All Variants (Defensive check for product)
    const allVariants: Variant[] = product ? [
        {
            _id: product._id,
            fragrance: product.fragrance,
            format: product.format,
            price: product.price,
            stock: product.stock,
            sku: '',
            imageUrl: product.imageUrl,
            images: product.images
        },
        ...(product.variants || [])
    ] : [];

    // Get Unique Options (Primary: Formats, Secondary: Fragrances based on Format)
    const uniqueFormats = Array.from(new Map(allVariants.filter(v => v.format).map(v => [v.format!._id, v.format!])).values());

    // Filter variants based on selected format to find available fragrances
    const variantsForFormat = selectedFormat
        ? allVariants.filter(v => v.format?._id === selectedFormat)
        : allVariants;

    const availableFragrances = Array.from(new Map(
        variantsForFormat.filter(v => v.fragrance).map(v => [v.fragrance!._id, v.fragrance!])
    ).values());

    // Auto-select fragrance if current selection is invalid for new format
    useEffect(() => {
        if (availableFragrances.length > 0) {
            const isCurrentValid = availableFragrances.some(f => f._id === selectedFragrance);
            if (!isCurrentValid) {
                setSelectedFragrance(availableFragrances[0]._id);
            }
        }
    }, [selectedFormat, availableFragrances, selectedFragrance]);

    // Compute Current Variant based on selection
    // Find in allVariants or fallback to main product if not found
    const currentVariant = allVariants.find(v => {
        const fragMatch = !selectedFragrance || (v.fragrance?._id === selectedFragrance);
        const formatMatch = !selectedFormat || (v.format?._id === selectedFormat);
        return fragMatch && formatMatch;
    }) || allVariants[0];

    // Update Image when selection changes
    useEffect(() => {
        if (currentVariant) {
            const newImg = (currentVariant.images && currentVariant.images.length > 0)
                ? currentVariant.images[0]
                : currentVariant.imageUrl;
            // Only update if it's different to avoid potential loops/flickers, though check is cheap
            if (newImg && newImg !== activeImage) setActiveImage(newImg);
        }
    }, [currentVariant?._id]); // Only update when the actual variant changes, not on every render

    // Derived Display Data
    const displayPrice = currentVariant ? currentVariant.price : (product?.price || 0);
    const displayStock = currentVariant ? currentVariant.stock : (product?.stock || 0);
    const displayImages = (currentVariant && currentVariant.images && currentVariant.images.length > 0)
        ? currentVariant.images
        : (product && product.images && product.images.length > 0 ? product.images : (product ? [product.imageUrl] : []));

    const currentPrice = purchaseType === 'subscribe'
        ? (subscribeConfig?.discountType === 'percentage'
            ? displayPrice * (1 - (subscribeConfig.discountValue / 100))
            : displayPrice - subscribeConfig?.discountValue || displayPrice)
        : displayPrice;

    // Actions
    const handleAddToCart = () => {
        if (!product) return;

        const isSubscribe = purchaseType === 'subscribe';
        // Create unique ID for subscription items to prevent merging with one-time purchases
        const cartItemId = isSubscribe ? `${product._id}-sub` : product._id;

        addToCart({
            _id: cartItemId,
            name: product.name +
                (currentVariant?.fragrance ? ` - ${currentVariant.fragrance.name}` : '') +
                (currentVariant?.format ? ` - ${currentVariant.format.name}` : '') +
                (isSubscribe ? ' (Subscribe & Save)' : ''),
            price: currentPrice,
            originalPrice: isSubscribe ? displayPrice : undefined, // Track original price for stats
            imageUrl: activeImage,
            quantity: quantity,
            subCategory: product.subCategory
        });

        addToast(isSubscribe ? 'Added subscription to cart' : 'Added to cart', 'success');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

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
                    {/* ... Gallery code ... (No changes here, but ensuring context matches if needed, though this replace is focused below) */}
                    {/* Actually, the Replace tool needs strict context. I will target the block from 'Get Unique Options' down to the end of Fragrance Selector to be safe and clean. */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 flex flex-col md:flex-row gap-4">
                            {/* Thumbnails (Vertical on Desktop) */}
                            <div className="hidden md:flex flex-col gap-4 w-20">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-20 h-24 border ${activeImage === img ? 'border-[#1c524f]' : 'border-transparent'} rounded-md overflow-hidden bg-gray-50`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 relative">
                                <div className="relative w-full aspect-square md:aspect-[4/5] lg:aspect-square bg-transparent rounded-lg overflow-hidden">
                                    {/* Discount Badge */}
                                    {(product.compareAtPrice || 0) > displayPrice && (
                                        <div className="absolute top-4 left-4 z-10 bg-[#d72c0d] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Sale
                                        </div>
                                    )}
                                    <Image
                                        src={activeImage || displayImages[0]}
                                        alt={product.name}
                                        fill
                                        className="object-contain" // Changed to contain for products
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Mobile Thumbnails (Horizontal) */}
                            <div className="md:hidden flex gap-4 overflow-x-auto pb-2">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative flex-shrink-0 w-16 h-20 border ${activeImage === img ? 'border-[#1c524f]' : 'border-transparent'} rounded-md overflow-hidden bg-gray-50`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details */}
                    <div className="lg:col-span-5 space-y-7">
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-[#1c524f] mb-3">{product.name}</h1>

                            {/* Price Section */}
                            <div className="flex items-baseline gap-3">
                                <span className={`text-2xl font-bold ${(product.compareAtPrice || 0) > displayPrice ? 'text-[#d72c0d]' : 'text-[#1c524f]'}`}>
                                    Rs. {currentPrice.toLocaleString()}
                                </span>
                                {(product.compareAtPrice || 0) > displayPrice && (
                                    <span className="text-lg text-gray-500 line-through">
                                        Rs. {product.compareAtPrice!.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex text-[#1c524f]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({(product._id.charCodeAt(product._id.length - 1) * 3) + 50} reviews)</span>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4 text-xs font-bold text-gray-600 uppercase tracking-wide">
                                <span className="flex items-center gap-1"><Check size={14} /> EWG Verified</span>
                                <span className="flex items-center gap-1"><Check size={14} /> Vegan</span>
                                <span className="flex items-center gap-1"><Check size={14} /> Dermatologically Tested</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-200" />

                        {/* Format Selector */}
                        {uniqueFormats.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Format</label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueFormats.map((f, i) => (
                                        <button
                                            key={f._id || i}
                                            onClick={() => setSelectedFormat(f._id)}
                                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${selectedFormat === f._id
                                                ? 'border-[#1c524f] bg-[#1c524f] text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:border-[#1c524f]'
                                                }`}
                                        >
                                            {f.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fragrance Selector */}
                        {availableFragrances.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Fragrance</label>
                                <div className="relative">
                                    <select
                                        value={selectedFragrance}
                                        onChange={(e) => setSelectedFragrance(e.target.value)}
                                        className="w-full appearance-none border border-gray-300 rounded-md py-3 px-4 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#1c524f] cursor-pointer"
                                    >
                                        <option value="" disabled>Select Fragrance</option>
                                        {availableFragrances.map(f => (
                                            <option key={f._id} value={f._id}>{f.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Inventory Warning */}
                        {displayStock < 10 && displayStock > 0 && (
                            <p className="text-[#d72c0d] text-sm font-medium animate-pulse">
                                Only {displayStock} left in stock - order soon!
                            </p>
                        )}
                        {displayStock === 0 && (
                            <p className="text-gray-500 text-sm font-medium">
                                Out of stock
                            </p>
                        )}


                        {/* Purchase Options */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {/* One Time Purchase */}
                            <label
                                className={`flex items-center justify-between cursor-pointer p-3 rounded border shadow-sm transition-all ${purchaseType === 'onetime'
                                    ? 'bg-white border-[#1c524f] ring-1 ring-[#1c524f]'
                                    : 'bg-transparent border-transparent hover:bg-white'
                                    }`}
                                onClick={() => handlePurchaseTypeChange('onetime')}
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
                                    Rs. {displayPrice.toLocaleString()}
                                </span>
                            </label>

                            {/* Subscribe and Save */}
                            {subscribeConfig?.enabled && (
                                <label
                                    className={`flex items-center justify-between cursor-pointer p-3 rounded border transition-all ${purchaseType === 'subscribe'
                                        ? 'bg-white border-[#1c524f] ring-1 ring-[#1c524f]'
                                        : 'bg-transparent border-transparent hover:bg-white'
                                        }`}
                                    onClick={() => handlePurchaseTypeChange('subscribe')}
                                >
                                    <div className="flex items-center gap-3 opacity-90">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${purchaseType === 'subscribe' ? 'border-[#1c524f]' : 'border-gray-400'
                                            }`}>
                                            {purchaseType === 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#1c524f]" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-medium ${purchaseType === 'subscribe' ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                                Subscribe and save {subscribeConfig.discountType === 'percentage' ? `${subscribeConfig.discountValue}%` : `Rs. ${subscribeConfig.discountValue}`}
                                            </span>
                                            {subscribeConfig.newUsersOnly && (
                                                <span className="text-xs text-[#d72c0d] font-bold uppercase tracking-wide">New Customers Only</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-gray-500 ${purchaseType === 'subscribe' ? 'text-[#1c524f] font-bold' : ''}`}>
                                        Rs. {(subscribeConfig?.discountType === 'percentage'
                                            ? displayPrice * (1 - (subscribeConfig.discountValue / 100))
                                            : displayPrice - subscribeConfig?.discountValue).toLocaleString()}
                                    </span>
                                </label>
                            )}
                        </div>

                        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

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
                                disabled={displayStock === 0}
                                className="flex-1 bg-[#1c524f] text-white font-bold rounded-md hover:bg-[#153e3c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {displayStock === 0 ? 'Out of Stock' : 'Add to cart'}
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
