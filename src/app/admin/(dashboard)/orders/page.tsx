'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Calendar, ChevronDown, Check, MoreHorizontal, Filter,
    ArrowUpDown, Search, Download, Upload, X
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import CoolLoader from '@/components/ui/CoolLoader';

interface Order {
    _id: string;
    orderNumber: string;
    date: string;
    customer: string;
    total: number;
    paymentStatus: string;
    fulfillmentStatus: string;
    fullStatus: string;
    itemsCount: number;
    paymentMethod: string;
}

interface Stats {
    totalOrders: number;
    today: {
        count: number;
        items: number;
        returns: number;
        fulfilled: number;
        delivered: number;
        cancelled: number;
    };
}

export default function AdminOrdersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();

    // Initial State from URL
    const initialRange = searchParams.get('range') || 'today';
    const initialStart = searchParams.get('startDate') || '';
    const initialEnd = searchParams.get('endDate') || '';

    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState(searchParams.get('tab') || 'All');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Date Filtering State
    const [dateRangeLabel, setDateRangeLabel] = useState('Today');
    const [dateRange, setDateRange] = useState(initialRange);
    const [startDate, setStartDate] = useState(initialStart);
    const [endDate, setEndDate] = useState(initialEnd);
    const [showDateMenu, setShowDateMenu] = useState(false);
    const [isCustom, setIsCustom] = useState(initialRange === 'custom');

    const dateMenuRef = useRef<HTMLDivElement>(null);

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
                setShowDateMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Helper to get local date string YYYY-MM-DD
    const getLocalDateStr = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const fetchOrders = async (start?: string, end?: string) => {
        setLoading(true);
        try {
            let url = '/api/admin/orders';
            if (start && end) {
                url += `?startDate=${start}&endDate=${end}`;
            }
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setStats(data.stats);
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        if (dateRange === 'custom' && startDate && endDate) {
            setDateRangeLabel(`${startDate} - ${endDate}`);
            fetchOrders(startDate, endDate);
        } else {
            applyPreset(dateRange, false);
        }
    }, []);

    // Update URL when filters change
    const updateUrl = (params: any) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.keys(params).forEach(key => {
            if (params[key]) newParams.set(key, params[key]);
            else newParams.delete(key);
        });
        router.replace(`?${newParams.toString()}`);
    };

    const applyPreset = (preset: string, updateState = true) => {
        if (updateState) {
            setDateRange(preset);
            setIsCustom(preset === 'custom');
        }

        if (preset === 'custom') {
            setDateRangeLabel('Custom Range');
            updateUrl({ range: 'custom' });
            return;
        }

        setShowDateMenu(false);

        if (preset === 'all') {
            setDateRangeLabel('All Time');
            if (updateState) {
                setStartDate('');
                setEndDate('');
            }
            updateUrl({ range: 'all', startDate: '', endDate: '' });
            fetchOrders();
            return;
        }

        const end = new Date();
        const start = new Date();

        if (preset === 'today') {
            setDateRangeLabel('Today');
        } else if (preset === 'yesterday') {
            setDateRangeLabel('Yesterday');
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
        } else if (preset === '7d') {
            setDateRangeLabel('Last 7 Days');
            start.setDate(start.getDate() - 7);
        } else if (preset === '30d') {
            setDateRangeLabel('Last 30 Days');
            start.setDate(start.getDate() - 30);
        }

        const s = getLocalDateStr(start);
        const e = getLocalDateStr(end);

        if (updateState) {
            setStartDate(s);
            setEndDate(e);
        }

        updateUrl({ range: preset, startDate: s, endDate: e });
        fetchOrders(s, e);
    };

    const handleCustomApply = () => {
        if (!startDate || !endDate) return;
        setDateRangeLabel(`${startDate} - ${endDate}`);
        updateUrl({ range: 'custom', startDate, endDate });
        fetchOrders(startDate, endDate);
        setShowDateMenu(false);
    };

    // Clear selection when filters change
    useEffect(() => {
        setSelectedIds([]);
    }, [selectedTab]);

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [fulfillmentFilter, setFulfillmentFilter] = useState('All');

    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        updateUrl({ tab });
    };

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        // Debounce URL update could be better, but simple replace is fine for now
        // Or wait for a button/blur. Let's just update for now.
        if (val) updateUrl({ q: val });
        else updateUrl({ q: '' });
    };

    const filteredOrders = orders.filter(order => {
        // Tab Filter
        if (selectedTab === 'Unfulfilled' && order.fulfillmentStatus !== 'Unfulfilled') return false;
        if (selectedTab === 'Unpaid' && order.paymentStatus !== 'Pending') return false;
        if (selectedTab === 'Open' && (order.fullStatus === 'Delivered' || order.fullStatus === 'Cancelled' || order.fullStatus === 'Returned')) return false;
        if (selectedTab === 'Archived' && order.fullStatus !== 'Delivered' && order.fullStatus !== 'Cancelled' && order.fullStatus !== 'Returned') return false;

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesOrder = order.orderNumber.toLowerCase().includes(q);
            const matchesCustomer = order.customer.toLowerCase().includes(q);
            if (!matchesOrder && !matchesCustomer) return false;
        }

        // Dropdown Filters
        if (statusFilter !== 'All' && order.fullStatus !== statusFilter) return false;
        if (paymentFilter !== 'All' && order.paymentStatus !== paymentFilter) return false;
        if (fulfillmentFilter !== 'All' && order.fulfillmentStatus !== fulfillmentFilter) return false;

        return true;
    });

    const toggleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredOrders.map(o => o._id));
        else setSelectedIds([]);
    };

    const toggleSelect = (id: string, checked: boolean) => {
        if (checked) setSelectedIds([...selectedIds, id]);
        else setSelectedIds(selectedIds.filter(sid => sid !== id));
    };

    const handleExport = async () => {
        const idsToExport = selectedIds.length > 0
            ? selectedIds
            : filteredOrders.map(o => o._id);

        if (idsToExport.length === 0) {
            alert('No orders to export');
            return;
        }

        addToast('Preparing export...', 'info');

        try {
            const res = await fetch('/api/admin/orders/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToExport })
            });

            if (!res.ok) throw new Error('Export failed');

            const { orders } = await res.json();

            const headers = [
                'Order ID', 'Date', 'Status', 'Payment Status', 'Payment Method', 'Total', 'Subtotal', 'Discount', 'Coupon', 'Shipping',
                'Customer Name', 'Customer Email', 'Customer Phone', 'Address', 'City', 'Postcode',
                'Item Name', 'Item ID', 'Quantity', 'Item Price', 'Item SubCategory'
            ];

            const rows = [];
            for (const order of orders) {
                const date = new Date(order.createdAt).toLocaleDateString();
                const customer = order.shippingAddress;
                if (!order.items || order.items.length === 0) {
                    rows.push([
                        order._id, date, order.status, order.isPaid ? 'Paid' : 'Pending', order.paymentMethod,
                        order.totalAmount, order.subtotal, order.discount, order.couponCode, order.shippingCost,
                        customer?.fullName, customer?.email, customer?.phone, customer?.address, customer?.city, customer?.postalCode,
                        '', '', '', '', ''
                    ].map(f => `"${f !== undefined && f !== null ? f : ''}"`).join(','));
                } else {
                    for (const item of order.items) {
                        rows.push([
                            order._id, date, order.status, order.isPaid ? 'Paid' : 'Pending', order.paymentMethod,
                            order.totalAmount, order.subtotal, order.discount, order.couponCode, order.shippingCost,
                            customer?.fullName, customer?.email, customer?.phone, customer?.address, customer?.city, customer?.postalCode,
                            item.name, item.product_id, item.quantity, item.price, item.subCategory
                        ].map(f => `"${f !== undefined && f !== null ? f : ''}"`).join(','));
                    }
                }
            }

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `orders_detailed_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            addToast('Export ready', 'success');

        } catch (error) {
            console.error(error);
            addToast('Export failed', 'error');
        }
    };

    return (
        <div className="p-6 bg-[#F6F6F7] min-h-screen text-[#303030] font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-900">Orders</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="bg-white border text-xs font-semibold px-3 py-1.5 rounded shadow-sm hover:bg-gray-50 flex items-center gap-1"
                    >
                        <Upload size={14} /> Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                    </button>
                    <button
                        onClick={() => router.push('/admin/orders/create')}
                        className="bg-[#1c524f] text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm hover:bg-[#143d3b] flex items-center gap-1"
                    >
                        Create order
                    </button>
                </div>
            </div>

            {/* Stats Cards - Functioning as Date Filter */}
            {stats && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
                    <div className="flex items-center divide-x divide-gray-200 relative">

                        {/* Interactive Date Indicator */}
                        <div ref={dateMenuRef} className="px-6 py-2 min-w-[160px] relative">
                            <button
                                onClick={() => setShowDateMenu(!showDateMenu)}
                                className="flex items-center gap-3 w-full text-left group hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
                            >
                                <div className="p-2 bg-gray-100 rounded text-gray-600 group-hover:bg-white group-hover:shadow-sm">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400 font-medium">Filter by</span>
                                    <span className="font-bold text-gray-800 flex items-center gap-1">
                                        {dateRangeLabel} <ChevronDown size={14} />
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showDateMenu && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-2 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="space-y-1">
                                        {[
                                            { label: 'Today', val: 'today' },
                                            { label: 'Yesterday', val: 'yesterday' },
                                            { label: 'Last 7 Days', val: '7d' },
                                            { label: 'Last 30 Days', val: '30d' },
                                            { label: 'All Time', val: 'all' },
                                            { label: 'Custom...', val: 'custom' },
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => applyPreset(opt.val)}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${dateRange === opt.val
                                                    ? 'bg-gray-100 text-[#008060] font-bold'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Inputs */}
                                    {isCustom && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">Start</label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full text-xs p-1.5 border rounded focus:ring-1 focus:ring-[#008060] outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 font-bold uppercase">End</label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full text-xs p-1.5 border rounded focus:ring-1 focus:ring-[#008060] outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleCustomApply}
                                                className="w-full py-2 bg-[#008060] hover:bg-[#006e52] text-white text-xs font-bold rounded shadow-sm transition-colors"
                                            >
                                                Apply Date Range
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats Items */}
                        <StatItem label="Orders" value={stats.today.count} />
                        <StatItem label="Items ordered" value={stats.today.items} />
                        <StatItem label="Returns" value={stats.today.returns} />
                        <StatItem label="Fulfilled" value={stats.today.fulfilled} />
                        <StatItem label="Delivered" value={stats.today.delivered} />
                        <StatItem label="Cancelled" value={stats.today.cancelled} isLast />
                    </div>
                </div>
            )}

            {/* Main Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-4 overflow-x-auto">
                    {['All', 'Unfulfilled', 'Unpaid', 'Open', 'Archived'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${selectedTab === tab
                                ? 'border-[#1c524f] text-[#1c524f]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="p-3 border-b border-gray-200 flex gap-2 overflow-x-auto items-center">
                    <div className="relative flex-1 max-w-sm mr-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Filter orders"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-8 pr-4 py-1.5 text-xs border border-gray-300 rounded shadow-sm focus:ring-1 focus:ring-[#1c524f] focus:border-[#1c524f] outline-none transition-all"
                        />
                    </div>

                    <FilterDropdown
                        label="Status"
                        value={statusFilter}
                        options={['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned']}
                        onChange={setStatusFilter}
                    />
                    <FilterDropdown
                        label="Payment status"
                        value={paymentFilter}
                        options={['All', 'Paid', 'Pending']}
                        onChange={setPaymentFilter}
                    />
                    <FilterDropdown
                        label="Fulfillment status"
                        value={fulfillmentFilter}
                        options={['All', 'Fulfilled', 'Unfulfilled']}
                        onChange={setFulfillmentFilter}
                    />

                    {(statusFilter !== 'All' || paymentFilter !== 'All' || fulfillmentFilter !== 'All' || searchQuery) && (
                        <button
                            onClick={() => {
                                setStatusFilter('All');
                                setPaymentFilter('All');
                                setFulfillmentFilter('All');
                                handleSearchChange('');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-900 ml-2"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-8"><CoolLoader /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#F9FAFB] text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="p-4 w-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                            checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                        />
                                    </th>
                                    <th className="p-4 font-semibold">Order</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Customer</th>
                                    <th className="p-4 font-semibold">Channel</th>
                                    <th className="p-4 font-semibold text-right">Total</th>
                                    <th className="p-4 font-semibold">Payment status</th>
                                    <th className="p-4 font-semibold">Fulfillment status</th>
                                    <th className="p-4 font-semibold">Items</th>
                                    <th className="p-4 font-semibold">Delivery method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="p-8 text-center text-gray-500">No orders found in this period.</td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => {
                                        const isCancelled = order.fullStatus === 'Cancelled';
                                        const rowClass = isCancelled ? 'line-through text-gray-400' : 'text-gray-900';

                                        return (
                                            <tr
                                                key={order._id}
                                                onClick={() => router.push(`/admin/orders/${order._id}`)}
                                                className={`hover:bg-gray-50 transition-colors group cursor-pointer ${isCancelled ? 'bg-gray-50' : ''}`}
                                            >
                                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={selectedIds.includes(order._id)}
                                                        onChange={(e) => toggleSelect(order._id, e.target.checked)}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold flex items-center gap-2">
                                                        <span className={rowClass}>{order.orderNumber}</span>
                                                        {isCancelled && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded border border-red-200 no-underline font-normal">Cancelled</span>}
                                                        {order.fullStatus === 'Returned' && <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded border border-orange-200 no-underline font-normal">Returned</span>}
                                                    </div>
                                                </td>
                                                <td className={`p-4 whitespace-nowrap ${rowClass}`}>
                                                    {new Date(order.date || Date.now()).toLocaleString('en-US', {
                                                        weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true, day: 'numeric', month: 'short'
                                                    })}
                                                </td>
                                                <td className={`p-4 font-medium ${rowClass}`}>{order.customer}</td>
                                                <td className={`p-4 ${rowClass} text-gray-500`}>Online Store</td>
                                                <td className={`p-4 text-right font-medium ${rowClass}`}>Rs. {(order.total || 0).toLocaleString()}</td>
                                                <td className="p-4">
                                                    <Badge status={order.paymentStatus} type="payment" faded={isCancelled} />
                                                </td>
                                                <td className="p-4">
                                                    <Badge status={order.fulfillmentStatus} type="fulfillment" faded={isCancelled} />
                                                </td>
                                                <td className={`p-4 ${rowClass} text-gray-600`}>{order.itemsCount} items</td>
                                                <td className={`p-4 ${rowClass} text-gray-500`}>Standard</td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-components

function StatItem({ label, value, isLast }: { label: string, value: number, isLast?: boolean }) {
    return (
        <div className={`px-4 py-2 flex-1 ${!isLast ? '' : ''}`}>
            <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">{value}</span>
                {/* <span className="text-gray-300 text-lg">—</span> */}
                <div className="h-1 w-12 bg-[#1c524f] rounded-full mt-2 block"></div>
            </div>
        </div>
    );
}

function FilterDropdown({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) {
    return (
        <div className="relative group">
            <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded shadow-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 whitespace-nowrap">
                {label}: <span className="text-gray-900">{value}</span> <ChevronDown size={12} />
            </button>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function Badge({ status, type, faded }: { status: string, type: 'payment' | 'fulfillment', faded?: boolean }) {
    // Payment: Paid (Grey/Black), Pending (Yellow)
    // Fulfillment: Fulfilled (Grey/White), Unfulfilled (Yellow)

    let styles = '';
    let icon = null;

    if (type === 'payment') {
        if (status === 'Paid') {
            styles = 'bg-[#E3E3E3] text-[#4A4A4A]'; // Grey
            icon = <div className="w-1.5 h-1.5 rounded-full bg-[#4A4A4A] mr-1.5" />;
        } else {
            styles = 'bg-[#FFEA8A] text-[#5C4D00]'; // Yellowish
            icon = <div className="w-1.5 h-1.5 rounded-full bg-[#5C4D00] mr-1.5" />;
        }
    } else {
        if (status === 'Fulfilled') {
            styles = 'bg-[#E3E3E3] text-[#4A4A4A]';
        } else {
            styles = 'bg-[#FFEA8A] text-[#8A6116]'; // Yellow/Orange tint
        }
    }

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles} ${faded ? 'opacity-50' : ''}`}>
            {icon}
            {status}
        </span>
    );
}
