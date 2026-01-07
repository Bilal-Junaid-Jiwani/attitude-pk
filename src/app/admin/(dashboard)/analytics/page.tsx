'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowUp, ArrowDown, Calendar, TrendingUp, TrendingDown,
    DollarSign, ShoppingBag, Package, Truck, Tag, CreditCard,
    AlertCircle, FileText, PieChart
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
    CartesianGrid, BarChart, Bar, Cell, PieChart as RechartsPieChart, Pie, Legend
} from 'recharts';
import Skeleton from '@/components/ui/Skeleton';

// --- Types ---
interface Metric {
    value: number;
    previous: number;
    change: number;
}
interface DailySales {
    _id: string; // date YYYY-MM-DD
    sales: number;
    orders: number;
}
interface AnalyticsData {
    activeVisitors: number;
    metrics: {
        totalSales: Metric;
        totalOrders: Metric;
        averageOrderValue: Metric;
    };
    profitMetrics: {
        grossRevenue: number;
        netRevenue: number;
        subtotal: number;
        shippingCollected: number;
        taxCollected: number;
        discountGiven: number;
        cogs: number;
        grossProfit: number;
        grossMargin: number;
        netProfit: number;
        netMargin: number;
        totalExpenses: number;
        unitsSold: number;
        freeShippingOrders: number;
        paidShippingOrders: number;
        freeShippingCost?: number;
        deliveryCost: number; // ALL outgoing shipping
        totalPackagingCost: number;
        advertisingCost: number;
        packagingPerOrder: number;
        shippingPerOrder: number;
        couponUsage: { _id: string; usageCount: number; totalDiscountValue: number }[];
        salesHistory: DailySales[];
    };
    returnLosses: {
        totalRefunds: number;
        totalReturnShipping: number;
        returnCount: number;
    };
}

// Brand Color
const BRAND_COLOR = "#008060"; // Emerald Green

export default function AnalyticsPage() {
    // 1. State
    const [dateRange, setDateRange] = useState('30days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 2. Fetch Data
    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, customStartDate, customEndDate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/analytics';
            if (dateRange === 'custom' && customStartDate && customEndDate) {
                url += `?startDate=${customStartDate}&endDate=${customEndDate}`;
            } else if (dateRange !== 'custom') {
                const end = new Date();
                const start = new Date();
                if (dateRange === '7days') start.setDate(end.getDate() - 7);
                if (dateRange === '30days') start.setDate(end.getDate() - 30);
                if (dateRange === '90days') start.setDate(end.getDate() - 90);
                if (dateRange === '12months') start.setFullYear(end.getFullYear() - 1);

                url += `?startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const jsonData = await res.json();
            setData(jsonData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="space-y-4 max-w-7xl mx-auto p-6"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!data) return null;

    // --- Helpers ---
    const formatCurrency = (val: number | string | undefined) => `Rs. ${Math.round(Number(val || 0)).toLocaleString()}`;
    const formatNumber = (val: number) => Math.round(val).toLocaleString();

    // Expense Data for Pie Chart
    const expenseData = [
        { name: 'Advertising', value: data.profitMetrics.advertisingCost || 0, color: '#F59E0B' }, // Amber
        { name: 'Packaging', value: data.profitMetrics.totalPackagingCost + (data.profitMetrics.packagingPerOrder * data.returnLosses.returnCount), color: '#3B82F6' }, // Blue
        { name: 'Delivery & Logistics', value: data.profitMetrics.deliveryCost + data.returnLosses.totalReturnShipping, color: '#EF4444' }, // Red (Total Outgoing + Returns)
        { name: 'Other Ops', value: Math.max(0, data.profitMetrics.totalExpenses - (data.profitMetrics.advertisingCost || 0)), color: '#6B7280' }, // Gray
    ].filter(i => i.value > 0);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 space-y-6 animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#008060]"></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        Performance Overview
                        {data?.activeVisitors !== undefined && (
                            <span className="flex items-center gap-1.5 text-sm font-medium bg-red-100 text-red-600 px-3 py-1 rounded-full animate-pulse border border-red-200">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                {data.activeVisitors} Active Now
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Track your store's financial health and growth.</p>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                    {['7days', '30days', '90days'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === range
                                ? 'bg-white text-[#008060] shadow-sm ring-1 ring-[#008060]/20'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {range === '7days' ? '7D' : range === '30days' ? '30D' : '3M'}
                        </button>
                    ))}
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <input
                        type="date"
                        className="bg-transparent text-sm text-gray-600 focus:outline-none p-1"
                        onChange={(e) => { setCustomStartDate(e.target.value); setDateRange('custom'); }}
                    />
                </div>
            </div>

            {/* --- KPI CARDS (Salesforce Style) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Sales */}
                <KPICard
                    title="Total Sales"
                    value={formatCurrency(data.profitMetrics.grossRevenue)}
                    change={data.metrics.totalSales.change}
                    icon={DollarSign}
                    color="text-[#008060]"
                    bg="bg-[#008060]/10"
                />
                {/* Net Profit */}
                <KPICard
                    title="Net Profit"
                    value={formatCurrency(data.profitMetrics.netProfit)}
                    change={0} // To calculate properly if prev is available, currently 0
                    icon={TrendingUp}
                    color={data.profitMetrics.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}
                    bg={data.profitMetrics.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}
                />
                {/* Total Orders */}
                <KPICard
                    title="Total Orders"
                    value={formatNumber(data.metrics.totalOrders.value)}
                    change={data.metrics.totalOrders.change}
                    icon={ShoppingBag}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                {/* AOV */}
                <KPICard
                    title="Avg. Order Value"
                    value={formatCurrency(data.metrics.averageOrderValue.value)}
                    change={data.metrics.averageOrderValue.change}
                    icon={CreditCard}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
            </div>

            {/* --- MAIN CHART & SUMMARY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Sales Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-[#008060]"></span> Sales
                            </span>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.profitMetrics.salesHistory}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#008060" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#008060" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF0F6" />
                                <XAxis
                                    dataKey="_id"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `Rs.${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#008060"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Profit Summary (1/3 width) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Margins</h2>

                        {/* Gross Margin */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Gross Margin</span>
                                <span className="font-bold text-gray-900">{data.profitMetrics.grossMargin}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(data.profitMetrics.grossMargin, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Net Margin */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Net Margin</span>
                                <span className={`font-bold ${data.profitMetrics.netMargin >= 0 ? 'text-[#008060]' : 'text-red-600'}`}>
                                    {data.profitMetrics.netMargin}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${data.profitMetrics.netMargin >= 0 ? 'bg-[#008060]' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.abs(data.profitMetrics.netMargin), 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Stats */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Tag size={16} /></div>
                                <span className="text-sm text-gray-600">Units Sold</span>
                            </div>
                            <span className="font-bold text-gray-900">{formatNumber(data.profitMetrics.unitsSold)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertCircle size={16} /></div>
                                <span className="text-sm text-gray-600">Returns</span>
                            </div>
                            <span className="font-bold text-red-700">{data.returnLosses.returnCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DETAILED SPLIT: P&L & EXPENSES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* P&L Statement (2/3) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Profit & Loss Statement</h2>
                        <button className="text-sm text-[#008060] font-medium hover:underline flex items-center gap-1">
                            <FileText size={16} /> Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50 text-gray-500 text-left">
                                <tr>
                                    <th className="py-3 px-6 font-medium">Item</th>
                                    <th className="py-3 px-6 font-medium text-right">Amount</th>
                                    <th className="py-3 px-6 font-medium text-right w-24">% Rev</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {/* Revenue Section - Detailed Breakdown */}
                                <PLRow label="Product Sales (Gross)" sublabel="(Subtotal)" value={data.profitMetrics.subtotal} revenue={data.profitMetrics.grossRevenue} />
                                <PLRow label="+ Shipping Collected" value={data.profitMetrics.shippingCollected} revenue={data.profitMetrics.grossRevenue} color="text-emerald-600" />
                                <PLRow label="+ Tax Collected" value={data.profitMetrics.taxCollected} revenue={data.profitMetrics.grossRevenue} color="text-emerald-600" />
                                <PLRow label="− Discounts" value={-data.profitMetrics.discountGiven} revenue={data.profitMetrics.grossRevenue} color="text-red-500" />
                                <PLRow label="= Total Revenue" value={data.profitMetrics.grossRevenue} revenue={data.profitMetrics.grossRevenue} bold bg="bg-gray-50" color="text-[#008060]" />

                                {/* COGS Section */}
                                <PLRow label="− Cost of Goods Sold" value={-data.profitMetrics.cogs} revenue={data.profitMetrics.grossRevenue} color="text-red-500" />
                                <PLRow label="= Gross Profit" value={data.profitMetrics.grossProfit} revenue={data.profitMetrics.grossRevenue} bold bg="bg-gray-50" />

                                {/* Expenses Section */}
                                <PLRow label="− Delivery & Logistics" sublabel="(Courier Charges)" value={-data.profitMetrics.deliveryCost} revenue={data.profitMetrics.grossRevenue} color="text-orange-600" />
                                <PLRow label="− Packaging Cost" value={-data.profitMetrics.totalPackagingCost} revenue={data.profitMetrics.grossRevenue} color="text-orange-600" />
                                <PLRow label="− Advertising Ads" value={-(data.profitMetrics.advertisingCost || 0)} revenue={data.profitMetrics.grossRevenue} color="text-orange-600" />
                                <PLRow label="− Return Shipping Loss" sublabel={`(${data.returnLosses.returnCount} returns)`} value={-data.returnLosses.totalReturnShipping} revenue={data.profitMetrics.grossRevenue} color="text-red-600" />
                                <PLRow label="− Other Operating Exp." sublabel="(Rent, Salaries, etc.)" value={-(data.profitMetrics.totalExpenses - (data.profitMetrics.advertisingCost || 0))} revenue={data.profitMetrics.grossRevenue} color="text-red-600" />

                                {/* Net Profit */}
                                <PLRow
                                    label="= Net Profit"
                                    value={data.profitMetrics.netProfit}
                                    revenue={data.profitMetrics.grossRevenue}
                                    bold
                                    bg={data.profitMetrics.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}
                                    color={data.profitMetrics.netProfit >= 0 ? "text-[#008060]" : "text-red-600"}
                                    size="text-lg"
                                />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Expense Breakdown (1/3) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Expense Distribution</h2>
                    <div className="h-[250px] w-full flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 space-y-3">
                        {expenseData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- COUPONS & PRODUCTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Coupons Used</h2>
                    <div className="space-y-4">
                        {data.profitMetrics.couponUsage.map((coupon, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <span className="font-semibold text-gray-800">{coupon._id}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{coupon.usageCount} orders</p>
                                    <p className="text-xs text-red-500">SAVED {formatCurrency(coupon.totalDiscountValue)}</p>
                                </div>
                            </div>
                        ))}
                        {data.profitMetrics.couponUsage.length === 0 && <p className="text-gray-500 text-sm">No coupons used in this period.</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <PieChart size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Top Products Chart Coming Soon</p>
                    </div>
                </div>
            </div>

        </div>
    );
}

// --- Sub Components ---

const KPICard = ({ title, value, change, icon: Icon, color, bg }: any) => {
    const isUp = change >= 0;
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={color} size={20} />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`flex items-center text-xs font-semibold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {Math.abs(change)}%
                </span>
                <span className="text-xs text-gray-400">vs last period</span>
            </div>
        </div>
    )
}

const PLRow = ({ label, sublabel, value, revenue, bold = false, bg = '', color = 'text-gray-900', size = 'text-sm' }: any) => {
    // Avoid division by zero
    const pct = revenue ? Math.round((value / revenue) * 100) : 0;
    return (
        <tr className={`${bg}`}>
            <td className={`py-3 px-6 ${bold ? 'font-bold' : 'font-medium'} ${size} text-gray-700`}>
                {label}
                {sublabel && <span className="block text-xs text-gray-400 font-normal ml-2">{sublabel}</span>}
            </td>
            <td className={`py-3 px-6 text-right ${bold ? 'font-bold' : 'font-medium'} ${color} ${size}`}>
                {value < 0 ? `(${Math.abs(Math.round(value)).toLocaleString()})` : Math.round(value).toLocaleString()}
            </td>
            <td className="py-3 px-6 text-right text-xs text-gray-400">
                {Math.abs(pct)}%
            </td>
        </tr>
    );
}
