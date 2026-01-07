'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart, MessageCircle, Clock, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import Skeleton from '@/components/ui/Skeleton';

interface CartItem {
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface AbandonedCart {
    _id: string;
    email?: string;
    phone?: string;
    name?: string;
    cartItems: CartItem[];
    totalAmount: number;
    updatedAt: string;
    recoverySentAt?: string;
    isRecovered?: boolean;
    clickedAt?: string;
}

export default function AbandonedDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { addToast } = useToast();
    const [cart, setCart] = useState<AbandonedCart | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        fetch(`/api/admin/abandoned/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setCart(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                addToast('Failed to load cart', 'error');
                router.push('/admin/abandoned');
            });
    }, [id]);

    const handleSendEmail = async () => {
        if (!cart) return;
        setSendingEmail(true);
        const toastId = addToast('Sending recovery email...', 'info');

        try {
            const res = await fetch('/api/admin/abandoned/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartId: cart._id }),
            });

            if (res.ok) {
                addToast('Recovery email sent successfully!', 'success');
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            addToast('Failed to send email', 'error');
        } finally {
            setSendingEmail(false);
        }
    };

    const getWhatsAppLink = () => {
        if (!cart?.phone) return '#';
        const phone = cart.phone.replace(/\D/g, '').replace(/^0/, '92');
        const name = cart.name || 'Customer';
        const message = `Assalam-o-Alaikum ${name}, Attitude PK here. We noticed you left some great items in your cart. They are selling out fast, so secure them now! https://attitude-pk.vercel.app/checkout/recover/${cart._id}`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    }

    if (!cart) return null;

    return (
        <div className="max-w-6xl mx-auto p-6 text-[#303030]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/abandoned" className="p-2 border bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600">
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                            Abandoned Cart #{cart._id.slice(-6).toUpperCase()}
                        </h1>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {new Date(cart.updatedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.isRecovered && (
                        <div className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-lg flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                                <Check size={18} className="text-green-700" />
                            </div>
                            <div>
                                <h3 className="font-bold">Recovered!</h3>
                                <p className="text-sm">The customer placed an order from this specific cart link.</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <ShoppingCart size={18} /> Cart Items ({cart.cartItems.length})
                            </h2>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Product</th>
                                    <th className="px-6 py-3 text-center">Qty</th>
                                    <th className="px-6 py-3 text-right">Price</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cart.cartItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right">Rs. {item.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50">
                                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Total Amount</td>
                                    <td className="px-6 py-4 text-right font-bold text-[#1c524f] text-lg">Rs. {cart.totalAmount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Customer & Actions */}
                <div className="space-y-6">
                    {/* Recovery Action Card */}
                    <div className="bg-gradient-to-br from-[#1c524f] to-[#15403d] rounded-lg shadow-md border border-[#1c524f] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                            {cart.isRecovered && (
                                <div className="bg-white text-green-700 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                    RECOVERED
                                </div>
                            )}
                            {!cart.isRecovered && cart.clickedAt && (
                                <div className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                    CLICKED {new Date(cart.clickedAt).toLocaleDateString()}
                                </div>
                            )}
                            {cart.recoverySentAt && (
                                <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                    SENT {new Date(cart.recoverySentAt).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-lg mb-2">Recovery Actions</h3>
                        <p className="text-sm text-gray-300 mb-6">Contact the customer to recover this sale.</p>

                        <div className="grid grid-cols-2 gap-3">
                            {cart.email && (
                                <button
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail}
                                    className={`flex flex-col items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors disabled:opacity-50 ${cart.recoverySentAt
                                        ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200'
                                        : 'bg-white text-[#1c524f] hover:bg-gray-100 shadow-md font-bold'
                                        }`}
                                >
                                    <Mail size={20} />
                                    <span>{sendingEmail ? 'Sending...' : (cart.recoverySentAt ? 'Send Again' : 'Send Email')}</span>
                                </button>
                            )}

                            {cart.phone && (
                                <a
                                    href={getWhatsAppLink()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white rounded-lg py-3 text-sm font-bold transition-colors shadow-sm"
                                >
                                    <MessageCircle size={20} />
                                    <span>WhatsApp</span>
                                </a>
                            )}
                        </div>

                        {!cart.email && !cart.phone && (
                            <p className="text-center text-sm text-red-300 mt-2">No contact info available</p>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Customer Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</p>
                                <p className="text-sm font-medium">{cart.name || 'Guest'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                                <p className="text-sm text-[#1c524f] flex items-center gap-2">
                                    <Mail size={14} /> {cart.email || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
                                {cart.phone ? (
                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                        <Phone size={14} /> {cart.phone}
                                    </p>
                                ) : <p className="text-sm text-gray-400">-</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
