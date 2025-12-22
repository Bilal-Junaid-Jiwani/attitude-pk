'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowUp, ArrowDown, Calendar, Minus, Check, FileText
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    LineChart, Line
} from 'recharts';
import CoolLoader from '@/components/ui/CoolLoader';

// --- Types ---
interface Metric {
    value: number;
    previous: number;
    change: number;
}
interface HistoryPoint {
    date: string;
    sales: number;
    orders: number;
}
interface AnalyticsData {
    metrics: {
        totalSales: Metric;
        totalOrders: Metric;
        averageOrderValue: Metric;
    };
    history: HistoryPoint[];
    returningRate: number;
    topProducts: { _id: string, name: string, totalSold: number, revenue: number }[];
}

// --- Components ---

const MetricCard = ({
    title,
    value,
    change,
    prefix = '',
    suffix = '',
    data,
    dataKey,
    type = 'area'
}: {
    title: string;
    value: string | number;
    change: number;
    prefix?: string;
    suffix?: string;
    data: any[];
    dataKey: string;
    type?: 'area' | 'line';
}) => {
    const isUp = change >= 0;

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            </div>

            <div className="flex items-end gap-3 mb-6 relative z-10">
                <span className="text-2xl font-bold text-[#303030]">
                    {prefix}{value.toLocaleString()}{suffix}
                </span>
                <div className="flex items-center gap-1 mb-1">
                    {change !== 0 ? (
                        isUp ? <ArrowUp size={12} className="text-emerald-700" /> : <ArrowDown size={12} className="text-gray-500" />
                    ) : <Minus size={12} className="text-gray-400" />}
                    <span className={`text-xs font-medium ${isUp ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {Math.abs(change)}%
                    </span>
                </div>
            </div>

            {/* Internal Chart */}
            <div className="flex-1 min-h-[100px] w-full mt-auto relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#008060" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#008060" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                cursor={{ stroke: '#9ca3af', strokeDasharray: '2 2' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                formatter={(val: number, name: string) => [
                                    `${prefix}${(val || 0).toLocaleString()}${suffix}`,
                                    'Current'
                                ]}
                                labelFormatter={() => ''}
                            />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke="#008060"
                                strokeWidth={2}
                                fill={`url(#grad-${dataKey})`}
                            />
                        </AreaChart>
                    ) : (
                        <LineChart data={data}>
                            <Tooltip
                                cursor={{ stroke: '#9ca3af', strokeDasharray: '2 2' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke="#008060"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="flex justify-end gap-2 mt-2 relative z-10">
                <span className="text-[10px] text-gray-500">Compared to previous period</span>
            </div>
        </div>
    );
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    // Date State
    const [dateRange, setDateRange] = useState('30d'); // 7d, 30d, today, yesterday, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    // Helper to get local date string YYYY-MM-DD
    const getLocalDateStr = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    // Initial load
    useEffect(() => {
        applyPreset('30d');
    }, []);

    const applyPreset = (preset: string) => {
        setDateRange(preset);
        setShowCustomPicker(preset === 'custom');

        const end = new Date();
        const start = new Date();

        if (preset === 'today') {
            // start is today, end is today
        } else if (preset === 'yesterday') {
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
        } else if (preset === '7d') {
            start.setDate(start.getDate() - 7);
        } else if (preset === '30d') {
            start.setDate(start.getDate() - 30);
        } else if (preset === 'custom') {
            return; // Wait for user to pick dates
        }

        const s = getLocalDateStr(start);
        const e = getLocalDateStr(end);
        setStartDate(s);
        setEndDate(e);
        fetchData(s, e);
    };

    const handleCustomSubmit = () => {
        if (startDate && endDate) {
            fetchData(startDate, endDate);
        }
    };

    const fetchData = async (start: string, end: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?startDate=${start}&endDate=${end}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (!data && loading) return <CoolLoader />;
    // if (!data) return ... (Error state)

    const queryParams = `?startDate=${startDate}&endDate=${endDate}`;

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-6 text-[#303030] bg-[#f0f0f0] min-h-screen">

            {/* Header / Date Picker */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h1 className="text-xl font-bold text-[#1a1a1a]">Analytics</h1>

                <div className="flex items-center gap-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
                        {/* Presets */}
                        <div className="flex gap-1">
                            {[
                                { label: 'Today', val: 'today' },
                                { label: 'Yesterday', val: 'yesterday' },
                                { label: 'Last 7d', val: '7d' },
                                { label: 'Last 30d', val: '30d' },
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => applyPreset(opt.val)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateRange === opt.val
                                            ? 'bg-[#008060] text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                            <button
                                onClick={() => applyPreset('custom')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${dateRange === 'custom'
                                        ? 'bg-[#008060] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Custom
                            </button>
                        </div>

                        {/* Custom Date Inputs */}
                        {showCustomPicker && (
                            <div className="flex items-center gap-2 px-2 border-l border-gray-200 ml-2 animate-in fade-in slide-in-from-right-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#008060]"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#008060]"
                                />
                                <button
                                    onClick={handleCustomSubmit}
                                    className="p-1 text-green-700 hover:bg-green-50 rounded"
                                >
                                    <Check size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Report Button (Link) */}
                    <Link
                        href={`/admin/analytics/reports${queryParams}`}
                        className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#008060] focus:outline-none"
                    >
                        <FileText size={16} />
                        <span>Reports</span>
                    </Link>
                </div>
            </div>

            {/* Dashboard Grid */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* 1. Total Sales */}
                    <MetricCard
                        title="Total sales"
                        value={data.metrics.totalSales.value}
                        prefix="Rs. "
                        change={data.metrics.totalSales.change}
                        data={data.history}
                        dataKey="sales"
                    />

                    {/* 2. Total Orders */}
                    <MetricCard
                        title="Total orders"
                        value={data.metrics.totalOrders.value}
                        change={data.metrics.totalOrders.change}
                        data={data.history}
                        dataKey="orders"
                        type="line"
                    />

                    {/* 3. Average Order Value */}
                    <MetricCard
                        title="Average order value"
                        value={Math.round(data.metrics.averageOrderValue.value)}
                        prefix="Rs. "
                        change={data.metrics.averageOrderValue.change}
                        data={data.history}
                        dataKey="sales"
                    />

                    {/* 4. Returning Customer Rate */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">Returning customer rate</h3>
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-2xl font-bold text-[#303030]">
                                {data.returningRate}%
                            </span>
                        </div>

                        <div className="flex-1 w-full h-[150px] relative flex items-end justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.history}>
                                    <defs>
                                        <linearGradient id="grad-returning" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#008060" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#008060" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#008060"
                                        fill="url(#grad-returning)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            <span className="text-[10px] text-gray-500">Based on customer behavior</span>
                        </div>
                    </div>

                    {/* 5. Top Products */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative col-span-1 md:col-span-2 lg:col-span-2">
                        {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><div className="w-5 h-5 border-2 border-[#008060] border-t-transparent rounded-full animate-spin"></div></div>}
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Top products by units sold</h3>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                            {data.topProducts.map((p, i) => (
                                <div key={p._id} className="flex items-center justify-between group border-b border-gray-50 pb-2 last:border-0 hover:bg-gray-50 px-2 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-medium text-[#303030] group-hover:text-[#008060] transition-colors">{p.name}</p>
                                            <p className="text-xs text-gray-500">Rs. {p.price?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-[#303030]">{p.totalSold} sold</p>
                                        <p className="text-xs text-green-600">Rs. {p.revenue?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            ))}
                            {data.topProducts.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-8">No popular products in this period</div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
