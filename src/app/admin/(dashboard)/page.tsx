'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Calendar, ChevronDown,
    Coins, ShoppingCart, Truck, AlertOctagon, RotateCcw,
    ArrowUp, ArrowDown, Minus, ArrowRight, XCircle, CheckCircle
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface Metric {
    value: number;
    previous: number;
    change: number;
}
interface OrderSummary {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
    items?: any[];
}
interface AnalyticsData {
    metrics: {
        totalSales: Metric;
        totalOrders: Metric;
        averageOrderValue: Metric;
        pendingOrders: Metric;
        cancelledOrders: Metric;
        returnedOrders: Metric;
    };
    history: any[];
    recentOrders: OrderSummary[];
    lowStockProducts?: {
        _id: string;
        name: string;
        stock: number;
        images: string[];
    }[];
}

const MetricCard = ({ title, metric, prefix = '', icon: Icon, colorClass, bgClass }: { title: string, metric: Metric, prefix?: string, icon: any, colorClass: string, bgClass: string }) => {
    const isUp = metric.change >= 0;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
                <div className={`p-3 rounded-xl ${bgClass}`}>
                    <Icon size={24} className={colorClass} />
                </div>
            </div>

            <div>
                <div className="text-2xl font-bold text-[#303030] mb-2">
                    {prefix}{metric.value?.toLocaleString() ?? 0}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                    {metric.change !== 0 ? (
                        isUp ? <ArrowUp size={12} className="text-emerald-600" /> : <ArrowDown size={12} className="text-rose-600" />
                    ) : <Minus size={12} className="text-gray-400" />}

                    <span className={metric.change > 0 ? 'text-emerald-600' : metric.change < 0 ? 'text-rose-600' : 'text-gray-400'}>
                        {Math.abs(metric.change)}%
                    </span>
                    <span className="text-gray-400 ml-1">vs previous period</span>
                </div>
            </div>
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Confirmed': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
        case 'Returned': return 'bg-orange-100 text-orange-700 border-orange-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const AdminDashboard = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState('30d');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    const router = useRouter();

    const getLocalDateStr = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        applyPreset('30d');
    }, []);

    const applyPreset = (preset: string) => {
        setDateRange(preset);
        setIsCustom(preset === 'custom');

        if (preset === 'custom') return; // Wait for manual apply

        const end = new Date();
        const start = new Date();

        if (preset === 'today') {
            // today
        } else if (preset === 'yesterday') {
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
        } else if (preset === '7d') {
            start.setDate(start.getDate() - 7);
        } else if (preset === '15d') {
            start.setDate(start.getDate() - 15);
        } else if (preset === '30d') {
            start.setDate(start.getDate() - 30);
        }

        const s = getLocalDateStr(start);
        const e = getLocalDateStr(end);
        setStartDate(s);
        setEndDate(e);
        fetchData(s, e);
    };

    const handleCustomApply = () => {
        if (!startDate || !endDate) return;
        fetchData(startDate, endDate);
    };

    const fetchData = async (start: string, end: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?startDate=${start}&endDate=${end}`);
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Failed to load stats', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f2f3] p-4 md:p-8 font-sans text-[#303030]">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Control Bar */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-[#303030] flex items-center gap-2">
                        <Calendar size={24} className="text-[#008060]" />
                        Dashboard
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 overflow-x-auto flex-1 xl:flex-none">
                            {[
                                { label: 'Today', val: 'today' },
                                { label: 'Yesterday', val: 'yesterday' },
                                { label: '7 Days', val: '7d' },
                                { label: '15 Days', val: '15d' },
                                { label: '30 Days', val: '30d' },
                                { label: 'Custom', val: 'custom' },
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => applyPreset(opt.val)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${dateRange === opt.val
                                        ? 'bg-white text-[#008060] shadow-sm font-bold ring-1 ring-black/5'
                                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {isCustom && (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-lg animate-in fade-in slide-in-from-right-4">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#008060]"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#008060]"
                                />
                                <button
                                    onClick={handleCustomApply}
                                    className="px-3 py-1 bg-[#008060] text-white text-xs font-bold rounded hover:bg-[#006e52] transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="animate-in fade-in duration-500">
                        {/* Metrics Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-[140px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                    </div>
                                    <div>
                                        <Skeleton className="h-8 w-32 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts & Recent Orders Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Chart Skeleton */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-5 w-40 rounded-full" />
                                </div>
                                <Skeleton className="h-[300px] w-full rounded" />
                            </div>

                            {/* Recent Orders Skeleton */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[450px] p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : data ? (
                    <>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            <MetricCard
                                title="Total Revenue"
                                metric={data.metrics.totalSales}
                                prefix="Rs. "
                                icon={Coins}
                                colorClass="text-emerald-600"
                                bgClass="bg-emerald-100"
                            />
                            <MetricCard
                                title="Total Orders"
                                metric={data.metrics.totalOrders}
                                icon={ShoppingCart}
                                colorClass="text-blue-600"
                                bgClass="bg-blue-100"
                            />
                            <MetricCard
                                title="Pending Shipments"
                                metric={data.metrics.pendingOrders || { value: 0, previous: 0, change: 0 }}
                                icon={Truck}
                                colorClass="text-indigo-600"
                                bgClass="bg-indigo-100"
                            />
                            <MetricCard
                                title="Cancelled Orders"
                                metric={data.metrics.cancelledOrders || { value: 0, previous: 0, change: 0 }}
                                icon={XCircle}
                                colorClass="text-red-600"
                                bgClass="bg-red-100"
                            />
                            <MetricCard
                                title="Return Orders"
                                metric={data.metrics.returnedOrders || { value: 0, previous: 0, change: 0 }}
                                icon={RotateCcw}
                                colorClass="text-orange-600"
                                bgClass="bg-orange-100"
                            />
                        </div>

                        {/* Recent Orders & Chart Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Revenue Chart (2/3 width) */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-lg font-bold text-[#303030] mb-6 flex items-center gap-2">
                                    Revenue Trend
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {startDate} to {endDate}
                                    </span>
                                </h2>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.history}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#008060" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#008060" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                                dy={10}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(val) => `Rs ${val >= 1000 ? Math.round(val / 1000) + 'k' : val}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                formatter={(val: any) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="sales"
                                                stroke="#008060"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Orders (1/3 width) */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[450px]">
                                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                                    <h2 className="text-lg font-bold text-[#303030]">Recent Orders</h2>
                                    <Link href="/admin/orders" className="text-xs text-[#008060] font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
                                        View All <ArrowRight size={12} />
                                    </Link>
                                </div>
                                <div className="flex-1 overflow-auto custom-scrollbar p-2">
                                    {data.recentOrders && data.recentOrders.length > 0 ? (
                                        <div className="space-y-2">
                                            {data.recentOrders.map((order) => (
                                                <div key={order._id} className="p-4 rounded-lg bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900 group-hover:text-[#008060] transition-colors">
                                                                {order.user?.name || 'Guest'}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                                ID: {order._id.slice(-6).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-gray-900">
                                                                Rs. {order.totalAmount.toLocaleString()}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400">
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                <ShoppingCart size={24} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium">No orders in this period</p>
                                            <p className="text-gray-400 text-xs mt-1">Try selecting a wider date range</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-rose-500">Failed to load data. Please try again.</div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
