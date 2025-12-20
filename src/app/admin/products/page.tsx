'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Category { _id: string; name: string; subCategories: { name: string }[] }
interface Fragrance { _id: string; name: string }
interface Format { _id: string; name: string }
interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: any;
    subCategory: string;
    fragrance?: any;
    format?: any;
    imageUrl: string;
    images?: string[];
    benefits: string[];
    ingredients: string;
    howToUse: string;
    isActive: boolean;
}

export default function ProductsPage() {
    const { addToast } = useToast();
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [fragrances, setFragrances] = useState<Fragrance[]>([]);
    const [formats, setFormats] = useState<Format[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ title: '', message: '', onConfirm: () => { } });

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', description: '', price: 0, stock: 0,
        category: '', subCategory: '', fragrance: '', format: '',
        imageUrl: '', images: [], benefits: [], ingredients: '', howToUse: '', isActive: true
    });
    const [benefitInput, setBenefitInput] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, fRes, formRes] = await Promise.all([
                fetch('/api/admin/products'),
                fetch('/api/admin/categories'),
                fetch('/api/admin/fragrances'),
                fetch('/api/admin/formats')
            ]);

            if (pRes.ok) setProducts(await pRes.json());
            if (cRes.ok) setCategories(await cRes.json());
            if (fRes.ok) setFragrances(await fRes.json());
            if (formRes.ok) setFormats(await formRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast('Failed to load initial data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setFormData({
            ...product,
            category: product.category?._id || product.category, // Handle populated vs string
            fragrance: product.fragrance?._id || product.fragrance,
            format: product.format?._id || product.format
        });
        setView('FORM');
    };

    const confirmDelete = (id: string) => {
        setModalConfig({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            onConfirm: () => handleDelete(id)
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Product deleted successfully', 'success');
                fetchInitialData();
            } else {
                addToast('Failed to delete product', 'error');
            }
        } catch (error) {
            addToast('An error occurred', 'error');
        }
        setModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = formData._id ? `/api/admin/products/${formData._id}` : '/api/admin/products';
        const method = formData._id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                // Determine action for toast
                const action = formData._id ? 'updated' : 'created';
                addToast(`Product ${action} successfully`, 'success');

                setView('LIST');
                fetchInitialData();
                setFormData({}); // Reset
            } else {
                addToast('Failed to save product', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('An error occurred', 'error');
        }
    };

    const addBenefit = () => {
        if (benefitInput.trim()) {
            setFormData({ ...formData, benefits: [...(formData.benefits || []), benefitInput] });
            setBenefitInput('');
        }
    };

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const confirmBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setModalConfig({
            title: 'Bulk Delete Products',
            message: `Are you sure you want to delete ${selectedIds.length} products?`,
            onConfirm: handleBulkDelete
        });
        setModalOpen(true);
    };

    const handleBulkDelete = async () => {
        try {
            const res = await fetch('/api/admin/products/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (res.ok) {
                addToast(`${selectedIds.length} products deleted successfully`, 'success');
                fetchInitialData();
                setSelectedIds([]);
            } else {
                addToast('Bulk delete failed', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('An error occurred during bulk delete', 'error');
        }
        setModalOpen(false);
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(products.map(p => p._id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(sid => sid !== id));
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto relative">
            <ConfirmationModal
                isOpen={modalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalOpen(false)}
            />

            {view === 'LIST' ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={confirmBulkDelete}
                                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center gap-2"
                                >
                                    <Trash2 size={20} /> Delete ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={() => { setFormData({ images: [] }); setView('FORM'); }}
                                className="flex items-center gap-2 bg-[#1c524f] text-white px-4 py-2 rounded-lg hover:bg-[#143d3b]"
                            >
                                <Plus size={20} /> Add Product
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input type="checkbox"
                                            checked={selectedIds.length === products.length && products.length > 0}
                                            onChange={e => toggleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Format</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.map((p) => (
                                    <tr key={p._id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <input type="checkbox"
                                                checked={selectedIds.includes(p._id)}
                                                onChange={e => toggleSelect(p._id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                ) : <ImageIcon className="p-2 text-gray-400" />}
                                            </div>
                                            <span className="font-bold text-gray-800">{p.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {p.category?.name || '-'}
                                            <span className="text-xs text-gray-400 block">{p.subCategory}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {p.format?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium">PKR {p.price}</td>
                                        <td className="px-6 py-4">{p.stock}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(p)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"><Edit2 size={18} /></button>
                                            <button onClick={() => confirmDelete(p._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">{formData._id ? 'Edit Product' : 'New Product'}</h1>
                        <button onClick={() => setView('LIST')} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Basic Info */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input required type="text" value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR)</label>
                                    <input required type="number" value={formData.price || ''}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                    <input required type="number" value={formData.stock || ''}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select required value={formData.category || ''}
                                        onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                                    <select required value={formData.subCategory || ''}
                                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select Sub Category</option>
                                        {categories.find(c => c._id === formData.category)?.subCategories.map((s, i) => (
                                            <option key={i} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fragrance (Optional)</label>
                                    <select value={formData.fragrance || ''}
                                        onChange={e => setFormData({ ...formData, fragrance: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                    >
                                        <option value="">None / Unscented</option>
                                        {fragrances.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Format / Size</label>
                                    <select value={formData.format || ''}
                                        onChange={e => setFormData({ ...formData, format: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                    >
                                        <option value="">Select Format</option>
                                        {formats.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
                                <div className="space-y-2">
                                    {(formData.images || ['']).map((url, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={url}
                                                onChange={e => {
                                                    const newImages = [...(formData.images || [''])];
                                                    newImages[idx] = e.target.value;
                                                    setFormData({ ...formData, images: newImages });
                                                }}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                                placeholder={`Image URL ${idx + 1}`}
                                            />
                                            {idx > 0 && <button type="button" onClick={() => {
                                                const newImages = formData.images?.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, images: newImages });
                                            }} className="p-2 text-red-500 hover:bg-red-50 rounded"><X size={20} /></button>}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setFormData({ ...formData, images: [...(formData.images || ['']), ''] })}
                                        className="text-sm text-[#1c524f] hover:underline flex items-center gap-1">
                                        <Plus size={16} /> Add another image
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                                <textarea value={formData.ingredients || ''}
                                    onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                    placeholder="Water, Sodium Coco Sulfate..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">How to Use</label>
                                <textarea value={formData.howToUse || ''}
                                    onChange={e => setFormData({ ...formData, howToUse: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={benefitInput}
                                        onChange={e => setBenefitInput(e.target.value)}
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c524f]/20 outline-none"
                                        placeholder="Add a benefit..."
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                                    />
                                    <button type="button" onClick={addBenefit} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Plus size={20} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.benefits?.map((b, i) => (
                                        <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                            {b}
                                            <button type="button" onClick={() => {
                                                const newBenefits = [...(formData.benefits || [])];
                                                newBenefits.splice(i, 1);
                                                setFormData({ ...formData, benefits: newBenefits });
                                            }}><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 pt-4 flex justify-end gap-3 border-t">
                            <button
                                type="button"
                                onClick={() => setView('LIST')}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="px-8 py-2 bg-[#1c524f] text-white rounded-lg hover:bg-[#143d3b] flex items-center gap-2">
                                <Save size={18} /> Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
