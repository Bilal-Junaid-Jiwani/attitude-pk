'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BarChart3, Users, ShoppingBag, Package } from 'lucide-react';

export default function ReportsHubPage() {
    const searchParams = useSearchParams();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const queryParams = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : '';

    const reports = [
        {
            title: 'Sales over time',
            description: 'Net sales and breakdown over time.',
            icon: <BarChart3 className="text-blue-500" size={24} />,
            href: `/admin/analytics/reports/sales${queryParams}`
        },
        {
            title: 'Orders over time',
            description: 'Order volume and flow.',
            icon: <ShoppingBag className="text-green-500" size={24} />,
            href: `/admin/analytics/reports/orders${queryParams}`
        },
        {
            title: 'Customers over time',
            description: 'New vs Returning customers.',
            icon: <Users className="text-purple-500" size={24} />,
            href: `/admin/analytics/reports/customers${queryParams}`
        },
        {
            title: 'Top Products',
            description: 'Best selling products by quantity.',
            icon: <Package className="text-orange-500" size={24} />,
            href: `/admin/analytics/reports/products${queryParams}`
        }
    ];

    return (
        <div className="max-w-[1000px] mx-auto p-6 text-[#303030] min-h-screen">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/analytics" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold">Reports</h1>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {reports.map((report, i) => (
                        <Link
                            key={i}
                            href={report.href}
                            className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                {report.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#008060] transition-colors">
                                    {report.title}
                                </h3>
                                <p className="text-sm text-gray-500">{report.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
