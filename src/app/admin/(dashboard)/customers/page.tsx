'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import CoolLoader from '@/components/ui/CoolLoader';

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    postcode?: string;
    city?: string;
    country?: string;
    ordersCount: number;
    totalSpent: number;
    lastOrderDate: string;
    type?: 'Registered' | 'Guest';
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const router = useRouter();
    const { addToast } = useToast();

    useEffect(() => {
        fetchCustomers();
    }, [searchQuery]);

    useEffect(() => {
        filterCustomers();
    }, [customers, activeTab]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/admin/customers?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
                // filteredCustomers will be updated by useEffect
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to load customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterCustomers = () => {
        let result = customers;
        if (activeTab === 'new') {
            result = customers.filter(c => c.ordersCount <= 1);
        } else if (activeTab === 'returning') {
            result = customers.filter(c => c.ordersCount > 1);
        }
        setFilteredCustomers(result);
        setSelectedIds([]);
    };

    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? customers.filter(c => selectedIds.includes(c._id))
            : filteredCustomers;

        if (dataToExport.length === 0) {
            addToast('No customers to export', 'error');
            return;
        }

        const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Postcode', 'Country', 'Orders', 'Total Spent', 'Type'];
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(c => [
                `"${c.name || ''}"`,
                `"${c.email || ''}"`,
                `"${c.phone || ''}"`,
                `"${c.address || ''}"`,
                `"${c.city || ''}"`,
                `"${c.postcode || ''}"`,
                `"${c.country || 'Pakistan'}"`,
                c.ordersCount,
                c.totalSpent,
                c.type || 'Registered'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'customers_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredCustomers.map(c => c._id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(sid => sid !== id));
    };

    if (loading && customers.length === 0) return <CoolLoader />;

    return (
        <div className="max-w-[1600px] mx-auto p-6 text-sm text-[#303030]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-[#1a1a1a]">Customers</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 flex items-center gap-1"
                    >
                        Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                    </button>
                    <Link
                        href="/admin/customers/new"
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#1c524f] hover:bg-[#143d3b] rounded shadow-sm transition-colors flex items-center gap-1"
                    >
                        Add customer
                    </Link>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200 px-3 flex items-center bg-white">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-3 text-xs font-medium border-b-2 ${activeTab === 'all' ? 'border-[#1c524f] text-[#1c524f]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-3 text-xs font-medium border-b-2 ${activeTab === 'new' ? 'border-[#1c524f] text-[#1c524f]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setActiveTab('returning')}
                        className={`px-4 py-3 text-xs font-medium border-b-2 ${activeTab === 'returning' ? 'border-[#1c524f] text-[#1c524f]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Returning
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-3 border-b border-gray-200 flex gap-2 items-center bg-white">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search customers"
                            className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                            <th className="px-4 py-3 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th className="px-4 py-3 font-medium">Customer name</th>
                            <th className="px-4 py-3 font-medium">Email subscription</th>
                            <th className="px-4 py-3 font-medium">Location</th>
                            <th className="px-4 py-3 font-medium">Orders</th>
                            <th className="px-4 py-3 font-medium text-right">Amount spent</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.map((c) => (
                            <tr
                                key={c._id}
                                className="hover:bg-gray-50 group cursor-pointer transition-colors"
                                onClick={() => router.push(`/admin/customers/${c._id}`)}
                            >
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedIds.includes(c._id)}
                                        onChange={(e) => toggleSelect(c._id, e.target.checked)}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${c.type === 'Guest' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-[#1c524f]'}`}>
                                            {(c.name || 'G').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-[#1a1a1a] hover:underline">{c.name || 'Guest Customer'}</p>
                                                {c.type === 'Guest' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                                        Guest
                                                    </span>
                                                )}
                                            </div>
                                            {c.lastOrderDate && (
                                                <p className="text-xs text-gray-500">
                                                    Last order {new Date(c.lastOrderDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.type === 'Guest' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                        {c.type === 'Guest' ? 'Not subscribed' : 'Subscribed'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {c.address ? (
                                        <div className="flex items-center gap-1">
                                            {c.postcode || c.address.slice(0, 15)}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {c.ordersCount} orders
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                    Rs. {c.totalSpent.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {filteredCustomers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <UserIcon size={32} className="text-gray-300" />
                                        <p className="font-medium text-gray-900">No customers found</p>
                                        <p className="text-sm">Try changing the filters or search term</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
