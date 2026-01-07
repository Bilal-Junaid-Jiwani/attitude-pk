'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, ShoppingCart, Clock, Trash2, ArrowUpRight, Mail } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
}

export default function AbandonedCartsPage() {
    const [carts, setCarts] = useState<AbandonedCart[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/abandoned')
            .then(res => res.json())
            .then(data => {
                setCarts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    const handleSendEmail = async (cartId: string) => {
        const toastId = toast.loading('Sending recovery email...');
        try {
            const res = await fetch('/api/admin/abandoned/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartId }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Email sent successfully', { id: toastId });
            } else {
                toast.error(data.error || 'Failed to send email', { id: toastId });
            }
        } catch (error) {
            toast.error('Error sending email', { id: toastId });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading abandoned carts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Abandoned Checkouts</h1>
                    <p className="text-gray-500 text-sm">Recover lost sales by contacting customers via WhatsApp</p>
                </div>
                <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 font-medium">
                    {carts.length} Opportunities Found
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cart Summary</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {carts.map((cart) => {
                            const date = new Date(cart.updatedAt);
                            const customerName = cart.name || 'Guest';
                            const contact = cart.phone || cart.email || '-';
                            const phoneClean = cart.phone?.replace(/\D/g, '').replace(/^0/, '92');

                            return (
                                <tr key={cart._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{date.toLocaleDateString()}</span>
                                            <span className="text-xs">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{customerName}</span>
                                            <span className="text-sm text-gray-500">{contact}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700 max-w-xs">
                                            <span className="font-medium">{cart.cartItems.length} Items:</span>
                                            <span className="text-gray-500 ml-1 truncate block">
                                                {cart.cartItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        Rs. {cart.totalAmount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {cart.email && (
                                                <button
                                                    onClick={() => handleSendEmail(cart._id)}
                                                    className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                                    title="Send Recovery Email"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                            )}
                                            {phoneClean ? (
                                                <a
                                                    href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(`Assalam-o-Alaikum ${customerName}, Attitude PK se rabta kar rahe hain.\n\nHum ne notice kiya ke aap ne order place karne ki koshish ki thi lekin complete nahi hua.\n\nKya hum aap ki koi madad kar sakte hain?\n\nShukriya,\nTeam Attitude PK`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm hover:shadow-md"
                                                >
                                                    <MessageCircle size={16} /> WhatsApp
                                                </a>
                                            ) : (
                                                !cart.email && <span className="text-gray-400 text-xs italic">No Contact</span>
                                            )}
                                        </div>
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
