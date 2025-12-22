'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, ArrowUpDown, ChevronDown,
    MoreHorizontal, Filter, Download, Upload,
    Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Link from 'next/link';

interface Category { _id: string; name: string; subCategories: { name: string }[] }
interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: any;
    subCategory: string;
    imageUrl: string;
    isActive: boolean;
    isArchived: boolean;
    // ... other fields potentially used in edit form
}

export default function ProductsPage() {
    const { addToast } = useToast();
    const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMoreActions, setShowMoreActions] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ title: '', message: '', onConfirm: () => { } });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) {
                setProducts(await res.json());
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            addToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action: 'activate' | 'draft' | 'archive' | 'delete') => {
        if (selectedIds.length === 0) {
            addToast('Please select products first', 'error');
            return;
        }

        if (action === 'delete') {
            if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
        }

        try {
            const res = await fetch('/api/admin/products/bulk', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, action }),
            });

            if (res.ok) {
                const data = await res.json();
                addToast(data.message || 'Action successful', 'success');
                setSelectedIds([]); // Clear selection
                setShowMoreActions(false);
                fetchProducts(); // Refresh list
            } else {
                addToast('Failed to perform action', 'error');
            }
        } catch (error) {
            console.error('Bulk action error:', error);
            addToast('An error occurred', 'error');
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredProducts.map(p => p._id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(sid => sid !== id));
    };


    // Filtered Products Logic
    const filteredProducts = products.filter(p => {
        // 1. Search Filter
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Tab Filter
        let matchesTab = true;
        if (activeTab === 'Active') matchesTab = p.isActive === true;
        if (activeTab === 'Draft') matchesTab = p.isActive === false;

        return matchesSearch && matchesTab;
    });

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

    const handleExport = () => {
        const headers = ['ID', 'Name', 'Price', 'Stock', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(p => [p._id, `"${p.name}"`, p.price, p.stock, p.isActive ? 'Active' : 'Draft'].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        addToast('Export started', 'success');
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 text-sm text-[#303030]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-[#1a1a1a]">Products</h1>
                <div className="flex gap-2 relative">
                    <button
                        onClick={handleExport}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-[#e3e3e3] hover:bg-[#d4d4d4] rounded shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreActions(!showMoreActions)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-[#e3e3e3] hover:bg-[#d4d4d4] rounded shadow-sm transition-colors flex items-center gap-1"
                        >
                            More actions <ChevronDown size={14} />
                        </button>
                        {showMoreActions && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                                <button onClick={() => handleBulkAction('activate')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Set as Active</button>
                                <button onClick={() => handleBulkAction('draft')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Set as Draft</button>
                                <div className="h-px bg-gray-100 my-1" />
                                <button onClick={() => handleBulkAction('delete')} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete selected</button>
                            </div>
                        )}
                    </div>
                    <Link href="/admin/products/add">
                        <button
                            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1c524f] hover:bg-[#143d3b] rounded shadow-sm transition-colors flex items-center gap-1"
                        >
                            Add product <Plus size={14} />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs / Filter Bar */}
                <div className="border-b border-gray-200 px-3 flex justify-between items-center bg-white">
                    <div className="flex gap-1">
                        {['All', 'Active', 'Draft'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-[#1c524f] text-[#1c524f]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-3 border-b border-gray-200 flex gap-2 items-center bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter products"
                            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Bulk Selection Indicator */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded text-xs font-medium animate-in fade-in">
                            <span>{selectedIds.length} selected</span>
                            <button onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-gray-700 ml-2">Clear</button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={(e) => toggleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Inventory</th>
                                <th className="px-4 py-3 font-medium text-right">Sales channels</th>
                                <th className="px-4 py-3 font-medium text-right">Markets</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Vendor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50 group cursor-default transition-colors">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(p._id)}
                                            onChange={(e) => toggleSelect(p._id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden shrink-0">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={`/admin/products/${p._id}`} className="font-semibold text-[#1a1a1a] truncate max-w-[200px] hover:underline cursor-pointer" title={p.name}>
                                                {p.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive
                                            ? 'bg-[#cbf4c9] text-[#0e4e0d]'
                                            : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                            }`}>
                                            {p.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-sm ${p.stock <= 0 ? 'text-[#d72c0d]' : 'text-gray-600'
                                        }`}>
                                        {p.stock} in stock
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        3
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        2
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {typeof p.category === 'object' ? p.category?.name : 'General'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        Attitude
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-100 rounded-full">
                                                <Search size={24} className="text-gray-400" />
                                            </div>
                                            <p className="font-medium text-gray-900">No products found</p>
                                            <p className="text-sm">Try changing the filters or search term</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock) */}
                <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-center">
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>
                            &larr; Previous
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>
                            Next &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
