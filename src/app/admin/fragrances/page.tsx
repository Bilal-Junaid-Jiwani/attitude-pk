'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Droplets } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Fragrance {
    _id: string;
    name: string;
    description?: string;
}

export default function FragrancesPage() {
    const { addToast } = useToast();
    const [fragrances, setFragrances] = useState<Fragrance[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFragrance, setCurrentFragrance] = useState<Partial<Fragrance>>({
        name: '',
        description: ''
    });

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ title: '', message: '', onConfirm: () => { } });

    // Fetch Fragrances
    const fetchFragrances = async () => {
        try {
            const res = await fetch('/api/admin/fragrances');
            if (res.ok) {
                const data = await res.json();
                setFragrances(data);
            }
        } catch (error) {
            console.error('Failed to fetch fragrances', error);
            addToast('Failed to load fragrances', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFragrances();
    }, []);

    // Handle Form Submit (Create/Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentFragrance._id
                ? `/api/admin/fragrances/${currentFragrance._id}`
                : '/api/admin/fragrances';

            const method = currentFragrance._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFragrance)
            });

            if (res.ok) {
                const action = currentFragrance._id ? 'updated' : 'created';
                addToast(`Fragrance ${action} successfully`, 'success');
                setIsEditing(false);
                setCurrentFragrance({ name: '', description: '' });
                fetchFragrances();
            } else {
                addToast('Failed to save fragrance', 'error');
            }
        } catch (error) {
            console.error('Failed to save fragrance', error);
            addToast('An error occurred', 'error');
        }
    };

    // Handle Delete
    const confirmDelete = (id: string) => {
        setModalConfig({
            title: 'Delete Fragrance',
            message: 'Are you sure you want to delete this fragrance? This action cannot be undone.',
            onConfirm: () => handleDelete(id)
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/fragrances/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Fragrance deleted successfully', 'success');
                fetchFragrances();
            } else {
                addToast('Failed to delete fragrance', 'error');
            }
        } catch (error) {
            console.error('Failed to delete fragrance', error);
            addToast('An error occurred', 'error');
        }
        setModalOpen(false);
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
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Droplets size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Fragrances</h1>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentFragrance({ name: '', description: '' }); }}
                    className="flex items-center gap-2 bg-[#1c524f] text-white px-4 py-2 rounded-lg hover:bg-[#143d3b] transition"
                >
                    <Plus size={20} />
                    Add Fragrance
                </button>
            </div>

            {/* List View */}
            {!isEditing ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {fragrances.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.description || '-'}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => { setCurrentFragrance(item); setIsEditing(true); }}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(item._id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fragrances.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                        No fragrances found. Create one to get started.
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
                            {currentFragrance._id ? 'Edit Fragrance' : 'New Fragrance'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fragrance Name</label>
                            <input
                                type="text"
                                required
                                value={currentFragrance.name}
                                onChange={(e) => setCurrentFragrance({ ...currentFragrance, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="e.g. Sweet Apple"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description / Notes</label>
                            <textarea
                                value={currentFragrance.description}
                                onChange={(e) => setCurrentFragrance({ ...currentFragrance, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="e.g. Fresh pear with a hint of honey..."
                                rows={3}
                            />
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
                                Save Fragrance
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
