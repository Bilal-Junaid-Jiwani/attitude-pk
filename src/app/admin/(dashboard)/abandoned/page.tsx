'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AbandonedCart {
    _id: string;
    email?: string;
    phone?: string;
    name?: string;
    cartItems: {
        name: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    updatedAt: string;
    isRecovered?: boolean;
    clickedAt?: string;
    recoverySentAt?: string;
}

export default function AbandonedCartsPage() {
    const [carts, setCarts] = useState<AbandonedCart[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/admin/abandoned')
            .then(res => res.json())
            .then(data => {
                setCarts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading abandoned carts...</div>;

    return (
        <div className="max-w-[1600px] mx-auto p-6 text-[#303030]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold text-[#1a1a1a]">Abandoned Checkouts</h1>
                    <p className="text-gray-500 text-xs mt-1">Recover lost sales by contacting customers</p>
                </div>
                <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-100 font-medium">
                    {carts.length} Potential Orders
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cart</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {carts.map((cart) => {
                            const date = new Date(cart.updatedAt);
                            let statusBadge = <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Pending</span>;

                            if (cart.isRecovered) {
                                statusBadge = <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">RECOVERED</span>;
                            } else if (cart.clickedAt) {
                                statusBadge = <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Clicked</span>;
                            } else if (cart.recoverySentAt) {
                                statusBadge = <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Sent</span>;
                            }

                            return (
                                <tr
                                    key={cart._id}
                                    onClick={() => router.push(`/admin/abandoned/${cart._id}`)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{date.toLocaleDateString()}</span>
                                            <span className="text-xs">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {(cart.name || 'G').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-[#1a1a1a] group-hover:underline">{cart.name || 'Guest'}</p>
                                                <p className="text-xs text-gray-500">{cart.email || cart.phone || 'No contact'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-700 font-medium">{cart.cartItems.length} items</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                            {cart.cartItems.map(i => i.name).join(', ')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        Rs. {cart.totalAmount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {statusBadge}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 inline-block" />
                                    </td>
                                </tr>
                            );
                        })}
                        {carts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShoppingCart className="text-gray-300" size={32} />
                                        <p>No abandoned carts found recently.</p>
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
