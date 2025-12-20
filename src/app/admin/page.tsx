'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import RevenueChart from '@/components/admin/RevenueChart';
import RecentOrdersTable from '@/components/admin/RecentOrdersTable';
import { Truck, ShoppingCart, Coins } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        inventory: 0,
        salesChart: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`API Error: ${res.status} - ${text}`);
                }
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch stats:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-800">Welcome back, Admin.</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Revenue (This Month)"
                    value={`PKR ${stats.revenue.toLocaleString()}`}
                    icon={Coins}
                    iconBg="bg-green-100"
                    iconColor="text-green-700"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingCart}
                    iconBg="bg-gray-100"
                    iconColor="text-gray-600"
                />
                <StatsCard
                    title="Pending Shipments"
                    value="35" // Hardcoded for demo match, replace with real data if available
                    icon={Truck}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                />
            </div>

            {/* Main Chart area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <RevenueChart data={stats.salesChart} />
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
                </div>
                <RecentOrdersTable />
            </div>
        </div>
    );
};

export default AdminDashboard;
