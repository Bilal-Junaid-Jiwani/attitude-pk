'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Scale } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import AdminTableSkeleton from '@/components/ui/AdminTableSkeleton';

interface Format {
    _id: string;
    name: string;
}

export default function FormatsPage() {
    const { addToast } = useToast();
    const [formats, setFormats] = useState<Format[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [currentFormat, setCurrentFormat] = useState<Partial<Format>>({
        name: ''
    });

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ title: '', message: '', onConfirm: () => { } });

    // Fetch Formats
    const fetchFormats = async () => {
        try {
            const res = await fetch('/api/admin/formats');
            if (res.ok) {
                const data = await res.json();
                setFormats(data);
            }
        } catch (error) {
            console.error('Failed to fetch formats', error);
            addToast('Failed to load formats', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFormats();
    }, []);

    // Handle Form Submit (Create/Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = currentFormat._id
                ? `/api/admin/formats/${currentFormat._id}`
                : '/api/admin/formats';

            const method = currentFormat._id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentFormat)
            });

            if (res.ok) {
                const action = currentFormat._id ? 'updated' : 'created';
                addToast(`Format ${action} successfully`, 'success');
                setIsEditing(false);
                setCurrentFormat({ name: '' });
                fetchFormats();
            } else {
                addToast('Failed to save format', 'error');
            }
        } catch (error) {
            console.error('Failed to save format', error);
            addToast('An error occurred', 'error');
        }
    };

    // Handle Delete
    const confirmDelete = (id: string) => {
        setModalConfig({
            title: 'Delete Format',
            message: 'Are you sure you want to delete this format? This action cannot be undone.',
            onConfirm: () => handleDelete(id)
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/formats/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Format deleted successfully', 'success');
                fetchFormats();
                setSelectedIds(selectedIds.filter(sid => sid !== id));
            } else {
                addToast('Failed to delete format', 'error');
            }
        } catch (error) {
            console.error('Failed to delete format', error);
            addToast('An error occurred', 'error');
        }
        setModalOpen(false);
    };

    const filteredFormats = formats.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredFormats.map(f => f._id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(sid => sid !== id));
    };

    if (loading) return <AdminTableSkeleton />;

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
                <h1 className="text-xl font-bold text-[#1a1a1a]">Formats / Sizes</h1>
                <div className="flex gap-2">
                    {!isEditing && (
                        <button
                            onClick={() => { setIsEditing(true); setCurrentFormat({ name: '' }); }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1c524f] hover:bg-[#143d3b] rounded shadow-sm transition-colors flex items-center gap-1"
                        >
                            Add format <Plus size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* List View */}
            {!isEditing ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-3 border-b border-gray-200 flex gap-2 items-center bg-white">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Filter formats"
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
                                        checked={selectedIds.length === filteredFormats.length && filteredFormats.length > 0}
                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFormats.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 group cursor-default transition-colors">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(item._id)}
                                            onChange={(e) => toggleSelect(item._id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            onClick={() => { setCurrentFormat(item); setIsEditing(true); }}
                                            className="font-semibold text-[#1a1a1a] hover:underline cursor-pointer"
                                        >
                                            {item.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => confirmDelete(item._id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredFormats.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                                        <p className="font-medium text-gray-900">No formats found</p>
                                        <p className="text-sm">Try adding a new format</p>
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
                                {currentFormat._id ? 'Edit Format' : 'New Format'}
                            </h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Format Name</label>
                                <input
                                    type="text"
                                    required
                                    value={currentFormat.name}
                                    onChange={(e) => setCurrentFormat({ ...currentFormat, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. 473 ml / 16 fl. oz."
                                />
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
