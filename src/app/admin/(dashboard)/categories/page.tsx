'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import AdminTableSkeleton from '@/components/ui/AdminTableSkeleton';

interface SubCategory {
    name: string;
    slug?: string;
}

interface Category {
    _id: string;
    name: string;
    description?: string;
    subCategories: SubCategory[];
}

export default function CategoriesPage() {
    const { addToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
        name: '',
        description: '',
        subCategories: []
    });

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ title: '', message: '', onConfirm: () => { } });

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
            addToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle Form Submit (Create/Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentCategory._id
                ? `/api/admin/categories/${currentCategory._id}`
                : '/api/admin/categories';

            const method = currentCategory._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCategory)
            });

            if (res.ok) {
                const action = currentCategory._id ? 'updated' : 'created';
                addToast(`Category ${action} successfully`, 'success');
                setIsEditing(false);
                setCurrentCategory({ name: '', description: '', subCategories: [] });
                fetchCategories();
            } else {
                addToast('Failed to save category', 'error');
            }
        } catch (error) {
            console.error('Failed to save category', error);
            addToast('An error occurred', 'error');
        }
    };

    // Handle Delete
    const confirmDelete = (id: string) => {
        setModalConfig({
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category? This action cannot be undone.',
            onConfirm: () => handleDelete(id)
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Category deleted successfully', 'success');
                fetchCategories();
                setSelectedIds(selectedIds.filter(sid => sid !== id));
            } else {
                addToast('Failed to delete category', 'error');
            }
        } catch (error) {
            console.error('Failed to delete category', error);
            addToast('An error occurred', 'error');
        }
        setModalOpen(false);
    };

    // Subcategory Helpers
    const addSubCategory = () => {
        const subs = [...(currentCategory.subCategories || []), { name: '' }];
        setCurrentCategory({ ...currentCategory, subCategories: subs });
    };

    const updateSubCategory = (index: number, val: string) => {
        const subs = [...(currentCategory.subCategories || [])];
        subs[index].name = val;
        setCurrentCategory({ ...currentCategory, subCategories: subs });
    };

    const removeSubCategory = (index: number) => {
        const subs = [...(currentCategory.subCategories || [])];
        subs.splice(index, 1);
        setCurrentCategory({ ...currentCategory, subCategories: subs });
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredCategories.map(c => c._id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(sid => sid !== id));
    };

    if (loading) return <div className="p-0"><AdminTableSkeleton /></div>;

    return (
        <div className="max-w-[1600px] mx-auto p-6 text-sm text-[#303030]">
            <ConfirmationModal
                isOpen={modalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalOpen(false)}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-[#1a1a1a]">Categories</h1>
                <div className="flex gap-2">
                    {!isEditing && (
                        <button
                            onClick={() => { setIsEditing(true); setCurrentCategory({ name: '', description: '', subCategories: [] }); }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1c524f] hover:bg-[#143d3b] rounded shadow-sm transition-colors flex items-center gap-1"
                        >
                            Add category <Plus size={14} />
                        </button>
                    )}
                </div>
            </div>

            {!isEditing ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-3 border-b border-gray-200 flex gap-2 items-center bg-white">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Filter categories"
                                className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded text-xs font-medium animate-in fade-in">
                                <span>{selectedIds.length} selected</span>
                                <button onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-gray-700 ml-2">Clear</button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Sub Categories</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCategories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50 group cursor-default transition-colors">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(cat._id)}
                                            onChange={(e) => toggleSelect(cat._id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            onClick={() => { setCurrentCategory(cat); setIsEditing(true); }}
                                            className="font-semibold text-[#1a1a1a] hover:underline cursor-pointer"
                                        >
                                            {cat.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                                        {cat.description || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {cat.subCategories?.map((sub, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                                                    {sub.name}
                                                </span>
                                            ))}
                                            {(!cat.subCategories || cat.subCategories.length === 0) && <span className="text-gray-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => confirmDelete(cat._id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                        <p className="font-medium text-gray-900">No categories found</p>
                                        <p className="text-sm">Try adding a new category</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="font-semibold text-gray-800">
                                {currentCategory._id ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentCategory.name}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="e.g. Skin Care"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={currentCategory.description}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Optional description..."
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Categories</label>
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
                                        {currentCategory.subCategories?.map((sub, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={sub.name}
                                                    onChange={(e) => updateSubCategory(idx, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                    placeholder="Sub Category Name"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubCategory(idx)}
                                                    className="text-gray-400 hover:text-red-500 p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addSubCategory}
                                            className="text-sm text-[#1c524f] font-medium hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add sub category
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#1c524f] rounded hover:bg-[#143d3b] shadow-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
