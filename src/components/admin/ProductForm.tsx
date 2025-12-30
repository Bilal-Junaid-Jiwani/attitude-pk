'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Category { _id: string; name: string; subCategories: { name: string }[] }
interface Fragrance { _id: string; name: string }
interface Format { _id: string; name: string }

interface Variant {
    id: string;
    fragranceId: string;
    formatId: string;
    price: number;
    stock: number;
    sku: string;
    imageUrl: string;
    images: string[];
}

interface ProductFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Data Sources
    const [categories, setCategories] = useState<Category[]>([]);
    const [fragrances, setFragrances] = useState<Fragrance[]>([]);
    const [formats, setFormats] = useState<Format[]>([]);

    // Form State
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([]);

    // Modal State for Variant Images
    const [variantModal, setVariantModal] = useState<{ isOpen: boolean, variantId: string | null }>({
        isOpen: false,
        variantId: null
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        compareAtPrice: 0,
        costPerItem: 0,
        stock: 0,
        sku: '',
        barcode: '',
        category: '',
        subCategory: '',
        fragrance: '',
        format: '',
        imageUrl: '',
        images: [] as string[],
        benefits: [] as string[],
        ingredients: '',
        howToUse: '',
        isActive: false,
        vendor: 'Attitude',
        tags: ''
    });

    // Initialize Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cRes, fRes, formRes] = await Promise.all([
                    fetch('/api/admin/categories'),
                    fetch('/api/admin/fragrances'),
                    fetch('/api/admin/formats')
                ]);
                if (cRes.ok) setCategories(await cRes.json());
                if (fRes.ok) setFragrances(await fRes.json());
                if (formRes.ok) setFormats(await formRes.json());
            } catch (error) {
                console.error('Error fetching dropdowns:', error);
            }
        };
        fetchData();
    }, []);

    // Populate Form with Initial Data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price || 0,
                compareAtPrice: initialData.compareAtPrice || 0,
                costPerItem: initialData.costPerItem || 0,
                stock: initialData.stock || 0,
                sku: initialData.sku || '',
                barcode: initialData.barcode || '',
                category: initialData.category?._id || initialData.category || '',
                subCategory: initialData.subCategory || '',
                fragrance: initialData.fragrance?._id || initialData.fragrance || '',
                format: initialData.format?._id || initialData.format || '',
                imageUrl: initialData.imageUrl || '',
                images: initialData.images || [],
                benefits: initialData.benefits || [],
                ingredients: initialData.ingredients || '',
                howToUse: initialData.howToUse || '',
                isActive: initialData.isActive ?? false,
                vendor: initialData.vendor || 'Attitude',
                tags: initialData.tags || ''
            });

            if (initialData.variants && initialData.variants.length > 0) {
                setHasVariants(true);
                setVariants(initialData.variants.map((v: any) => ({
                    id: v._id || Math.random().toString(36).substr(2, 9),
                    fragranceId: v.fragrance?._id || v.fragrance || '',
                    formatId: v.format?._id || v.format || '',
                    price: v.price || 0,
                    stock: v.stock || 0,
                    sku: v.sku || '',
                    imageUrl: v.imageUrl || '',
                    images: v.images || []
                })));
            }
        }
    }, [initialData]);

    const addVariant = () => {
        setVariants([
            ...variants,
            {
                id: Math.random().toString(36).substr(2, 9),
                fragranceId: '',
                formatId: '',
                price: formData.price || 0,
                stock: 0,
                sku: '',
                imageUrl: '',
                images: []
            }
        ]);
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async () => {
        if (!formData.name) return addToast('Title is required', 'error');

        setLoading(true);
        try {
            const payload = {
                ...formData,
                variants: hasVariants ? variants.map(v => ({
                    fragrance: v.fragranceId,
                    format: v.formatId,
                    price: v.price,
                    stock: v.stock,
                    sku: v.sku,
                    imageUrl: v.imageUrl || (v.images.length > 0 ? v.images[0] : ''),
                    images: v.images
                })) : []
            };

            const url = isEdit ? `/api/admin/products/${initialData._id}` : '/api/admin/products';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                addToast(isEdit ? 'Product updated' : 'Product created', 'success');
                router.push('/admin/products');
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to save product', 'error');
            }
        } catch (error) {
            addToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/products/${initialData._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                addToast('Product deleted', 'success');
                router.push('/admin/products');
            } else {
                addToast('Failed to delete product', 'error');
            }
        } catch (error) {
            addToast('Error deleting product', 'error');
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    // Component: Variant Image Modal
    const renderVariantImageModal = () => {
        if (!variantModal.isOpen || !variantModal.variantId) return null;

        const currentVariant = variants.find(v => v.id === variantModal.variantId);
        if (!currentVariant) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="font-bold text-gray-800">Manage Variant Images</h3>
                        <button onClick={() => setVariantModal({ isOpen: false, variantId: null })} className="p-1 hover:bg-gray-100 rounded">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* URL Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id={`variant-image-input-${currentVariant.id}`}
                                placeholder="Paste Image URL"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value;
                                        if (val) {
                                            updateVariant(currentVariant.id, 'images', [...currentVariant.images, val]);
                                            if (!currentVariant.imageUrl) {
                                                updateVariant(currentVariant.id, 'imageUrl', val);
                                            }
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    const input = document.getElementById(`variant-image-input-${currentVariant.id}`) as HTMLInputElement;
                                    if (input && input.value) {
                                        const val = input.value;
                                        updateVariant(currentVariant.id, 'images', [...currentVariant.images, val]);
                                        if (!currentVariant.imageUrl) {
                                            updateVariant(currentVariant.id, 'imageUrl', val);
                                        }
                                        input.value = '';
                                    }
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                            >
                                Add
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                            {currentVariant.images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded border border-gray-200 overflow-hidden">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => {
                                                const newImages = currentVariant.images.filter((_, i) => i !== idx);
                                                updateVariant(currentVariant.id, 'images', newImages);
                                                if (currentVariant.imageUrl === img) {
                                                    updateVariant(currentVariant.id, 'imageUrl', newImages[0] || '');
                                                }
                                            }}
                                            className="p-1 bg-white text-red-500 rounded hover:bg-red-50"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        {currentVariant.imageUrl !== img && (
                                            <button
                                                onClick={() => updateVariant(currentVariant.id, 'imageUrl', img)}
                                                className="p-1 bg-white text-blue-500 rounded hover:bg-blue-50"
                                            >
                                                <ImageIcon size={12} />
                                            </button>
                                        )}
                                    </div>
                                    {currentVariant.imageUrl === img && (
                                        <span className="absolute top-1 left-1 bg-black text-white text-[8px] px-1 rounded">Main</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50 flex justify-end">
                        <button
                            onClick={() => setVariantModal({ isOpen: false, variantId: null })}
                            className="px-4 py-2 bg-[#1a1a1a] text-white text-sm font-medium rounded hover:bg-[#333]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1000px] mx-auto p-6 pb-20">
            {renderVariantImageModal()}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-200 rounded-md border border-gray-300 bg-white"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-[#1a1a1a]">{isEdit ? 'Edit product' : 'Add product'}</h1>
                </div>

                {isEdit && (
                    <button
                        onClick={handleDeleteClick}
                        disabled={deleting}
                        className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 border border-red-200 flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Delete Product
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left 2 Columns) */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Title & Description */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="Short sleeve t-shirt"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <div className="border border-gray-300 rounded-md overflow-hidden">
                                <textarea
                                    rows={8}
                                    className="w-full p-3 text-sm outline-none resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Product Details</h2>

                        {/* Benefits */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Benefits</label>
                            <div className="space-y-2 mb-2">
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                            value={benefit}
                                            onChange={(e) => {
                                                const newBenefits = [...formData.benefits];
                                                newBenefits[index] = e.target.value;
                                                setFormData({ ...formData, benefits: newBenefits });
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const newBenefits = formData.benefits.filter((_, i) => i !== index);
                                                setFormData({ ...formData, benefits: newBenefits });
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })}
                                className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Benefit
                            </button>
                        </div>

                        {/* Ingredients */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ingredients</label>
                            <textarea
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Aqua, Glycerin, ..."
                                value={formData.ingredients}
                                onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                            />
                        </div>

                        {/* How To Use */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">How to Use</label>
                            <textarea
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Apply to wet hair..."
                                value={formData.howToUse}
                                onChange={e => setFormData({ ...formData, howToUse: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Media</h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Paste Image URL"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value;
                                        if (val) {
                                            setFormData(prev => ({
                                                ...prev,
                                                images: [...prev.images, val],
                                                imageUrl: prev.imageUrl || val
                                            }));
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
                                Add
                            </button>
                        </div>

                        {formData.images.length > 0 ? (
                            <div className="grid grid-cols-4 gap-4">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <img src={img} alt={`Media ${idx}`} className="w-full h-full object-cover" />

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const newImages = formData.images.filter((_, i) => i !== idx);
                                                    setFormData({
                                                        ...formData,
                                                        images: newImages,
                                                        imageUrl: formData.imageUrl === img ? (newImages[0] || '') : formData.imageUrl
                                                    });
                                                }}
                                                className="p-1.5 bg-white text-red-600 rounded-md hover:bg-red-50"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            {formData.imageUrl !== img && (
                                                <button
                                                    onClick={() => setFormData({ ...formData, imageUrl: img })}
                                                    className="p-1.5 bg-white text-blue-600 rounded-md hover:bg-blue-50"
                                                    title="Set as Main"
                                                >
                                                    <ImageIcon size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {formData.imageUrl === img && (
                                            <span className="absolute top-2 left-2 bg-[#1a1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                                Main
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-500 text-sm">
                                <ImageIcon size={32} className="text-gray-300 mb-2" />
                                <p>No images added yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Pricing</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">Rs.</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Compare at price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">Rs.</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.00"
                                        value={formData.compareAtPrice || ''}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, compareAtPrice: isNaN(val) ? 0 : val });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" id="chargeTax" className="rounded border-gray-300 text-blue-600" defaultChecked />
                            <label htmlFor="chargeTax" className="text-xs text-gray-700">Charge tax on this product</label>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t pt-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Cost per item</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500 text-xs">Rs.</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="0.00"
                                        value={formData.costPerItem || ''}
                                        onChange={e => {
                                            const val = parseFloat(e.target.value);
                                            setFormData({ ...formData, costPerItem: isNaN(val) ? 0 : val });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 pt-6">
                                <p className="text-xs text-gray-500">Customers won't see this</p>
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Inventory</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Barcode</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.barcode}
                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" id="trackQuantity" className="rounded border-gray-300 text-blue-600" defaultChecked />
                            <label htmlFor="trackQuantity" className="text-xs text-gray-700">Track quantity</label>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.stock}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData({ ...formData, stock: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-sm font-semibold text-gray-900">Variants</h2>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600"
                                    checked={hasVariants}
                                    onChange={e => setHasVariants(e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">This product has multiple options (e.g. Fragrances)</span>
                            </label>
                        </div>

                        {hasVariants && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-gray-500">
                                    Add variants based on Fragrance and Format (Size). Each variant has its own price, stock, and gallery of images.
                                </p>

                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">Fragrance</th>
                                                <th className="px-3 py-2 font-medium">Format</th>
                                                <th className="px-3 py-2 font-medium">Price</th>
                                                <th className="px-3 py-2 font-medium">Stock</th>
                                                <th className="px-3 py-2 font-medium">Images</th>
                                                <th className="px-3 py-2 font-medium w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {variants.map((v) => (
                                                <tr key={v.id}>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            className="w-full border rounded px-2 py-1 outline-none focus:border-blue-500"
                                                            value={v.fragranceId}
                                                            onChange={e => updateVariant(v.id, 'fragranceId', e.target.value)}
                                                        >
                                                            <option value="">Select...</option>
                                                            {fragrances.map(f => (
                                                                <option key={f._id} value={f._id}>{f.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            className="w-full border rounded px-2 py-1 outline-none focus:border-blue-500"
                                                            value={v.formatId}
                                                            onChange={e => updateVariant(v.id, 'formatId', e.target.value)}
                                                        >
                                                            <option value="">Select...</option>
                                                            {formats.map(f => (
                                                                <option key={f._id} value={f._id}>{f.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 border rounded px-2 py-1 outline-none focus:border-blue-500"
                                                            value={v.price}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value);
                                                                updateVariant(v.id, 'price', isNaN(val) ? 0 : val);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 border rounded px-2 py-1 outline-none focus:border-blue-500"
                                                            value={v.stock}
                                                            onChange={e => {
                                                                const val = parseInt(e.target.value);
                                                                updateVariant(v.id, 'stock', isNaN(val) ? 0 : val);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            onClick={() => setVariantModal({ isOpen: true, variantId: v.id })}
                                                            className="flex items-center gap-2 px-2 py-1 border rounded bg-white hover:bg-gray-50 text-xs font-medium text-gray-700"
                                                        >
                                                            <ImageIcon size={14} />
                                                            {v.images.length > 0 ? `${v.images.length} Images` : 'Add Images'}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            onClick={() => removeVariant(v.id)}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    onClick={addVariant}
                                    className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add another option
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-4">

                    {/* Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-xs font-bold text-gray-900 mb-4 uppercase">Product status</h2>

                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                            value={formData.isActive ? 'Active' : 'Draft'}
                            onChange={e => setFormData({ ...formData, isActive: e.target.value === 'Active' })}
                        >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                        </select>
                        <p className="text-xs text-gray-500">
                            This product will be hidden from all sales channels.
                        </p>
                    </div>

                    {/* Organization */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="text-xs font-bold text-gray-900 mb-4 uppercase">Organization</h2>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.vendor}
                                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.category}
                                onChange={e => setFormData({
                                    ...formData,
                                    category: e.target.value,
                                    subCategory: '' // Reset subcategory when category changes
                                })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Sub Category Dropdown */}
                        {formData.category && (
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Sub Category</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.subCategory}
                                    onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                >
                                    <option value="">Select Sub Category</option>
                                    {categories
                                        .find(c => c._id === formData.category)
                                        ?.subCategories?.map((sub, idx) => (
                                            <option key={idx} value={sub.name}>{sub.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.format}
                                onChange={e => setFormData({ ...formData, format: e.target.value })}
                            >
                                <option value="">Select Format</option>
                                {formats.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                            </select>
                        </div>

                        {!hasVariants && (
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Fragrance</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.fragrance}
                                    onChange={e => setFormData({ ...formData, fragrance: e.target.value })}
                                >
                                    <option value="">Select Fragrance</option>
                                    {fragrances.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                type="text"
                                placeholder="Vintage, cotton, summer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Discard
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded text-sm font-medium shadow hover:bg-[#333] disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                isLoading={deleting}
                confirmText="Delete Product"
            />
        </div>
    );
}
