'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
    _id: string;
    user: { name: string; email: string };
    totalAmount: number;
    status: string;
    createdAt: string;
}

const RecentOrdersTable = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/orders')
            .then(async (res) => {
                if (res.status === 401) {
                    router.push('/login');
                    return [];
                }
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`API Error: ${res.status} - ${text}`);
                }
                return res.json();
            })
            // Handle both array (API V1) and object (API V2) responses if needed, defaulting to empty array if redirecting
            .then(data => {
                if (!data) return; // redirected
                // The new API returns { orders: [], stats: {} }, while older might return []
                const ordersList = Array.isArray(data) ? data : (data.orders || []);
                setOrders(ordersList);
            })
            .catch(err => console.error('Failed to fetch orders:', err));
    }, [router]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Processing': return 'bg-blue-100 text-blue-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#F9FAFB] text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer Name</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-medium text-gray-500">{order._id.substring(0, 8)}...</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900">{order.user?.name || 'Guest'}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">PKR {order.totalAmount?.toLocaleString() ?? 0}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrdersTable;
