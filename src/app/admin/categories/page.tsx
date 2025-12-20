'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

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

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            <ConfirmationModal
                isOpen={modalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalOpen(false)}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                <button
                    onClick={() => { setIsEditing(true); setCurrentCategory({ name: '', description: '', subCategories: [] }); }}
                    className="flex items-center gap-2 bg-[#1c524f] text-white px-4 py-2 rounded-lg hover:bg-[#143d3b] transition"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* List View */}
            {!isEditing ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Sub Categories</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {cat.subCategories?.map((sub, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                                                    {sub.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => { setCurrentCategory(cat); setIsEditing(true); }}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(cat._id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                        No categories found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Edit/Create Form */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {currentCategory._id ? 'Edit Category' : 'New Category'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                required
                                value={currentCategory.name}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c524f]/20"
                                placeholder="e.g. Baby Care"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={currentCategory.description}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c524f]/20"
                                placeholder="Optional description..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sub Categories</label>
                            <div className="space-y-3">
                                {currentCategory.subCategories?.map((sub, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={sub.name}
                                            onChange={(e) => updateSubCategory(idx, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Sub Category Name"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSubCategory(idx)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addSubCategory}
                                    className="text-sm text-[#1c524f] font-medium hover:underline flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Sub Category
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#1c524f] text-white rounded-lg hover:bg-[#143d3b] flex items-center gap-2"
                            >
                                <Save size={18} />
                                Save Category
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
