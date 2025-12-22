'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Calendar, Download, Printer
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import CoolLoader from '@/components/ui/CoolLoader';

export default function ReportPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;

    // Dates from query
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!startDate || !endDate) return;

        const fetchReport = async () => {
            try {
                let endpoint = `/api/admin/analytics?startDate=${startDate}&endDate=${endDate}`;
                const res = await fetch(endpoint);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [slug, startDate, endDate]);

    if (loading) return <CoolLoader />;
    if (!data) return <div className="p-10 text-center">Failed to load report.</div>;

    // --- Report Configuration ---

    const config = {
        sales: {
            title: 'Sales over time',
            primaryColor: '#008060', // Shopify Green
            chartType: 'area',
            dataKey: 'sales',
            formatter: (val: number) => `Rs. ${val.toLocaleString()}`,
            summaryLabel: 'Total Sales',
            summaryValue: `Rs. ${data.metrics.totalSales.value.toLocaleString()}`,
        },
        orders: {
            title: 'Orders over time',
            primaryColor: '#0066CC', // Blue
            chartType: 'bar',
            dataKey: 'orders',
            formatter: (val: number) => val,
            summaryLabel: 'Total Orders',
            summaryValue: data.metrics.totalOrders.value,
        },
        customers: {
            title: 'Customers over time',
            primaryColor: '#9C6ADE', // Purple
            chartType: 'line',
            dataKey: 'orders', // Proxy for active customers
            formatter: (val: number) => val,
            summaryLabel: 'Total Active Customers', // Simplification
            summaryValue: data.metrics.totalOrders.value, // Simplification
        },
        products: {
            title: 'Top products by units sold',
            primaryColor: '#F49342', // Orange
            chartType: 'bar', // Special case
            dataKey: 'totalSold',
            formatter: (val: number) => val,
            summaryLabel: 'Total Units Sold',
            summaryValue: data.topProducts.reduce((acc: number, p: any) => acc + p.totalSold, 0),
        }
    };

    const currentConfig = config[slug as keyof typeof config] || config.sales;

    // --- Actions ---

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        if (!data) return;

        let headers: string[] = [];
        let rows: any[] = [];
        let filename = `${slug}_report_${startDate}_${endDate}.csv`;

        if (slug === 'products') {
            headers = ['Product Title', 'Net Quantity', 'Gross Sales', 'Total Purchase'];
            rows = data.topProducts.map((p: any) => [
                `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
                p.totalSold,
                p.revenue,
                p.revenue
            ]);
        } else {
            // Sales, Orders, Customers - based on history
            if (slug === 'sales') {
                headers = ['Date', 'Orders', 'Gross Sales', 'Net Sales'];
                rows = data.history.map((h: any) => [h.date, h.orders, h.sales, h.sales]);
            } else if (slug === 'orders') {
                headers = ['Date', 'Orders', 'Delivered'];
                rows = data.history.map((h: any) => [h.date, h.orders, h.orders]);
            } else {
                headers = ['Date', 'Active Customers'];
                rows = data.history.map((h: any) => [h.date, h.orders]);
            }
        }

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // --- Render Helpers ---

    const renderChart = () => {
        const commonProps = {
            data: slug === 'products' ? data.topProducts : data.history,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        };

        // For Products, we want just the top items, maybe names on XAxis
        if (slug === 'products') {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        interval={0}
                        tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="totalSold" fill={currentConfig.primaryColor} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            );
        }

        const ChartComponent = currentConfig.chartType === 'area' ? AreaChart :
            currentConfig.chartType === 'bar' ? BarChart : LineChart;

        return (
            <ResponsiveContainer width="100%" height="100%">
                {/* @ts-ignore */}
                <ChartComponent {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                        dy={10}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                        tickFormatter={(val: number) => val >= 1000 ? `${val / 1000}k` : `${val}`}
                    />
                    <Tooltip
                        cursor={{ stroke: '#9ca3af', strokeDasharray: '2 2' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    {currentConfig.chartType === 'area' && (
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentConfig.primaryColor} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={currentConfig.primaryColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    )}
                    {currentConfig.chartType === 'area' ? (
                        <Area type="monotone" dataKey={currentConfig.dataKey} stroke={currentConfig.primaryColor} fill="url(#colorGradient)" strokeWidth={2} />
                    ) : currentConfig.chartType === 'bar' ? (
                        <Bar dataKey={currentConfig.dataKey} fill={currentConfig.primaryColor} radius={[4, 4, 0, 0]} />
                    ) : (
                        <Line type="monotone" dataKey={currentConfig.dataKey} stroke={currentConfig.primaryColor} strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {/* @ts-ignore */}
                </ChartComponent>
            </ResponsiveContainer>
        );
    };

    const renderTable = () => {
        if (slug === 'products') {
            return (
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Product Title</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Net Quantity</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Gross Sales</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Total Purchase</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.topProducts.map((p: any) => (
                            <tr key={p._id} className="hover:bg-gray-50 group">
                                <td className="px-4 py-3 font-medium text-[#008060] group-hover:underline cursor-pointer">{p.name}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{p.totalSold}</td>
                                <td className="px-4 py-3 text-right text-gray-600">Rs. {p.revenue.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">Rs. {p.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (slug === 'sales') {
            return (
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Orders</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Gross Sales</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Net Sales</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.history.map((day: any) => (
                            <tr key={day.date} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{day.date}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{day.orders}</td>
                                <td className="px-4 py-3 text-right text-gray-600">Rs. {day.sales.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">Rs. {day.sales.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (slug === 'orders') {
            return (
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Start (Orders)</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Delivered</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.history.map((day: any) => (
                            <tr key={day.date} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{day.date}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{day.orders}</td>
                                <td className="px-4 py-3 text-right font-medium text-gray-900">{day.orders}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            // Customers
            return (
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">Active Customers</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-right">First-time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.history.map((day: any) => (
                            <tr key={day.date} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{day.date}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{day.orders}</td>
                                <td className="px-4 py-3 text-right text-gray-400">-</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-6 text-[#303030] min-h-screen bg-[#f6f6f7] print:bg-white print:p-0">

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <Link href="/admin/analytics" className="p-2 hover:bg-gray-200 rounded-md border border-gray-300 bg-white shadow-sm transition-colors text-gray-600">
                        <ArrowLeft size={16} />
                    </Link>
                    <h1 className="text-xl font-bold text-[#202223]">{currentConfig.title}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                        <Download size={14} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                        <Printer size={14} />
                        <span>Print</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar / Context */}
            <div className="bg-white border border-gray-200 rounded-t-lg border-b-0 p-4 flex items-center justify-between print:border-none print:p-0">
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded border border-gray-200 print:text-black print:bg-transparent print:border-none print:px-0">
                    <Calendar size={14} className="print:hidden" />
                    <span className="font-medium text-gray-700 print:text-black">{startDate}</span>
                    <span className="text-gray-400 print:text-black">–</span>
                    <span className="font-medium text-gray-700 print:text-black">{endDate}</span>
                </div>
                <div className="text-sm text-gray-500 print:hidden">
                    Group by: <span className="font-medium text-gray-900 border-b border-gray-400 border-dashed cursor-pointer">Day</span>
                </div>
            </div>

            {/* Visualization Section - Chart */}
            <div className="bg-white border border-gray-200 p-6 mb-6 last:mb-0 print:border-none print:shadow-none print:p-0">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {currentConfig.summaryLabel}
                    </h2>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {currentConfig.summaryValue}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 print:hidden">
                            {startDate} – {endDate}
                        </span>
                    </div>
                </div>

                <div className="h-[300px] w-full print:h-[200px]">
                    {renderChart()}
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm print:shadow-none print:border">
                <div className="overflow-x-auto">
                    {renderTable()}
                </div>
            </div>

            <div className="text-center mt-6 text-xs text-gray-400 print:hidden">
                Proprietary Analytics Report • Generated {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}
