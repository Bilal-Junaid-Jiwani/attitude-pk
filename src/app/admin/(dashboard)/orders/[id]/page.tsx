'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, MoreHorizontal, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import CoolLoader from '@/components/ui/CoolLoader';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Edit states
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editAddress, setEditAddress] = useState<any>({});

    // Tracking state
    const [trackingValues, setTrackingValues] = useState({ trackingId: '', courierCompany: '' });

    useEffect(() => {
        if (order) {
            setTrackingValues({
                trackingId: order.trackingId || '',
                courierCompany: order.courierCompany || ''
            });
        }
    }, [order]);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${id}`);
            if (!res.ok) throw new Error('Failed to load order');
            const data = await res.json();
            setOrder(data);
            setEditAddress(data.shippingAddress || {});
        } catch (error) {
            console.error(error);
            toast.error('Could not load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (field: string, value: any) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });
            if (!res.ok) throw new Error('Update failed');
            const updated = await res.json();
            setOrder(updated);
            toast.success(`Order ${field === 'isPaid' ? 'payment' : 'status'} updated!`);
        } catch (error) {
            toast.error('Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    const handleAddressSave = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shippingAddress: editAddress }),
            });
            if (!res.ok) throw new Error('Update failed');
            const updated = await res.json();
            setOrder(updated);
            setIsEditingAddress(false);
            toast.success('Address updated successfully');
        } catch (error) {
            toast.error('Failed to update address');
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveTracking = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trackingValues),
            });
            if (!res.ok) throw new Error('Update failed');
            const updated = await res.json();
            setOrder(updated);
            toast.success('Tracking info updated');
        } catch (error) {
            toast.error('Failed to update tracking info');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!confirm('Are you sure you want to delete this order PERMANENTLY?')) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion failed');
            toast.success('Order deleted');
            router.push('/admin/orders');
        } catch (error) {
            toast.error('Failed to delete order');
            setUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <CoolLoader />;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    // Derived logic
    const isPaid = order.isPaid || order.paymentMethod === 'Card' || order.paymentMethod === 'Safepay' || order.status === 'Delivered';
    const isFulfilled = order.status === 'Shipped' || order.status === 'Delivered';
    const isArchived = order.isArchived;

    return (
        <>
            <div className="p-6 max-w-6xl mx-auto bg-[#F6F6F7] min-h-screen text-[#303030] print:hidden">
                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders" className="p-2 border bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600">
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                #{order._id.slice(-4).toUpperCase()}
                                <span className={`px-2 py-0.5 text-xs rounded-full ${isPaid ? 'bg-gray-200 text-gray-700' : 'bg-yellow-200 text-yellow-800'}`}>
                                    {isPaid ? 'Paid' : 'Payment Pending'}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${isFulfilled ? 'bg-gray-200 text-gray-700' : 'bg-yellow-200 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                                {isArchived && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500 text-white">Archived</span>}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleString()} from Online Store
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                            <>
                                {order.status !== 'Delivered' && (
                                    <button
                                        onClick={() => handleUpdateStatus('status', 'Cancelled')}
                                        disabled={updating}
                                        className="text-sm font-medium text-red-600 hover:text-red-800 px-3 transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                <button
                                    onClick={() => handleUpdateStatus('status', 'Returned')}
                                    disabled={updating}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3"
                                >
                                    Return
                                </button>
                            </>
                        )}

                        {order.status === 'Cancelled' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateStatus('status', 'Pending')}
                                    disabled={updating}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-medium shadow-sm hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Uncancel Order
                                </button>
                                <button
                                    onClick={handleDeleteOrder}
                                    disabled={updating}
                                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    Delete Order
                                </button>
                            </div>
                        )}

                        {order.status === 'Returned' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateStatus('status', 'Pending')}
                                    disabled={updating}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-medium shadow-sm hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Unreturn Order
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => handleUpdateStatus('isArchived', !isArchived)}
                            disabled={updating}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3"
                        >
                            {isArchived ? 'Unarchive' : 'Archive'}
                        </button>

                        <div className="relative group">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1 text-sm font-medium text-gray-600 px-3 hover:text-gray-900"
                            >
                                Print <Printer size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Items Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${isFulfilled ? 'bg-gray-400' : 'bg-yellow-400'}`}></span>
                                    {order.status} ({order.items.length})
                                </h2>
                                <span className="text-sm text-gray-500">Local Delivery</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="py-4 flex gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-[#1c524f] hover:underline cursor-pointer">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.subCategory}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p>Rs. {item.price}</p>
                                            <p className="text-gray-500">× {item.quantity}</p>
                                            <p className="font-medium">Rs. {item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                                    <button
                                        onClick={() => handleUpdateStatus('status', 'Shipped')}
                                        disabled={updating}
                                        className="bg-[#1c524f] text-white px-4 py-2 rounded text-sm font-medium shadow hover:bg-[#15403d] disabled:opacity-50"
                                    >
                                        Mark as Fulfilled
                                    </button>
                                )}
                                {order.status === 'Shipped' && (
                                    <button
                                        onClick={() => handleUpdateStatus('status', 'Delivered')}
                                        disabled={updating}
                                        className="bg-[#1c524f] text-white px-4 py-2 rounded text-sm font-medium shadow hover:bg-[#15403d] disabled:opacity-50"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Payment Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${isPaid ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    {isPaid ? 'Paid' : 'Payment Pending'}
                                </h2>
                                <span className="text-xs font-mono text-gray-400 uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>Rs. {order.subtotal || order.items.reduce((acc: any, item: any) => acc + item.price * item.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>Rs. {order.shippingCost || 0}</span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span>Rs. {order.tax}</span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center gap-1">
                                            Discount
                                            {order.couponCode && <span className="text-xs bg-green-100 px-1 rounded uppercase">({order.couponCode})</span>}
                                        </span>
                                        <span>- Rs. {order.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                                    <span>Total</span>
                                    <span>Rs. {order.totalAmount}</span>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                {!isPaid && (
                                    <button
                                        onClick={() => handleUpdateStatus('isPaid', true)}
                                        disabled={updating}
                                        className="bg-[#1c524f] text-white px-4 py-2 rounded text-sm font-medium shadow hover:bg-[#15403d] disabled:opacity-50"
                                    >
                                        Mark as Paid
                                    </button>
                                )}
                                {isPaid && (
                                    <button
                                        onClick={() => handleUpdateStatus('isPaid', false)}
                                        disabled={updating}
                                        className="text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
                                    >
                                        Mark as Unpaid
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        {/* Tracking Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="bg-[#1c524f]/10 p-1.5 rounded text-[#1c524f]">
                                    <MapPin size={16} />
                                </span>
                                Courier Tracking
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Courier Company</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TCS, Leopards, M&P"
                                        value={trackingValues.courierCompany}
                                        onChange={(e) => setTrackingValues({ ...trackingValues, courierCompany: e.target.value })}
                                        className="w-full mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1c524f] focus:border-[#1c524f] p-2.5 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tracking ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Tracking ID"
                                        value={trackingValues.trackingId}
                                        onChange={(e) => setTrackingValues({ ...trackingValues, trackingId: e.target.value })}
                                        className="w-full mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1c524f] focus:border-[#1c524f] p-2.5 outline-none transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveTracking}
                                    disabled={updating}
                                    className="w-full bg-[#1c524f] text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-[#15403d] transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Saving...' : 'Save Tracking Info'}
                                </button>

                                <p className="text-xs text-center text-gray-500">
                                    Customer will see these details in their order history.
                                </p>
                            </div>
                        </div>
                        {/* Customer Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Customer</h3>
                                <button className="text-[#1c524f] text-sm hover:underline">Edit</button>
                            </div>
                            {order.user ? (
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[#1c524f]/10 text-[#1c524f] flex items-center justify-center font-bold">
                                        {order.user.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-[#1c524f]">{order.user.name}</p>
                                        <p className="text-gray-500">{order.user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4">Guest Customer</p>
                            )}

                            <div className="border-t border-gray-100 pt-4 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Contact Information</h4>
                                        <button
                                            onClick={() => setIsEditingAddress(!isEditingAddress)}
                                            className="text-[#1c524f] text-xs hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    {isEditingAddress ? (
                                        <div className="space-y-2">
                                            <input
                                                value={editAddress.email || ''}
                                                onChange={e => setEditAddress({ ...editAddress, email: e.target.value })}
                                                className="w-full text-sm border rounded p-1"
                                                placeholder="Email"
                                            />
                                            <input
                                                value={editAddress.phone || ''}
                                                onChange={e => setEditAddress({ ...editAddress, phone: e.target.value })}
                                                className="w-full text-sm border rounded p-1"
                                                placeholder="Phone"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <p className="flex items-center gap-2 text-[#1c524f]"><Mail size={14} /> {order.shippingAddress?.email}</p>
                                            <p className="flex items-center gap-2"><Phone size={14} /> {order.shippingAddress?.phone || 'No phone'}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shipping Address</h4>
                                    </div>
                                    {isEditingAddress ? (
                                        <div className="space-y-2">
                                            <input
                                                value={editAddress.address || ''}
                                                onChange={e => setEditAddress({ ...editAddress, address: e.target.value })}
                                                className="w-full text-sm border rounded p-1"
                                                placeholder="Address"
                                            />
                                            <input
                                                value={editAddress.city || ''}
                                                onChange={e => setEditAddress({ ...editAddress, city: e.target.value })}
                                                className="w-full text-sm border rounded p-1"
                                                placeholder="City"
                                            />
                                            <input
                                                value={editAddress.postalCode || ''}
                                                onChange={e => setEditAddress({ ...editAddress, postalCode: e.target.value })}
                                                className="w-full text-sm border rounded p-1"
                                                placeholder="Postal Code"
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={handleAddressSave} className="bg-[#1c524f] text-white text-xs px-3 py-1 rounded">Save</button>
                                                <button onClick={() => setIsEditingAddress(false)} className="text-gray-500 text-xs px-2">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <p>{order.shippingAddress?.fullName}</p>
                                            <p>{order.shippingAddress?.address}</p>
                                            <p>{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
                                            <p>Pakistan</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-900">Notes</h3>
                                <button className="text-[#1c524f] text-sm hover:underline">Edit</button>
                            </div>
                            <p className="text-sm text-gray-500 italic">No notes from customer</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Invoice Template */}
            <div className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                            {order.status === 'Cancelled' ? (
                                <span className="text-red-600">CANCELLED</span>
                            ) : order.status === 'Returned' ? (
                                <span className="text-red-600">RETURNED</span>
                            ) : (
                                'INVOICE'
                            )}
                        </h1>
                        <p className="text-sm text-gray-500">Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-[#1c524f]">Attitude.pk</h2>
                        <p className="text-sm text-gray-600">Karachi, Pakistan</p>
                        <p className="text-sm text-gray-600">contact@attitude.pk</p>
                    </div>
                </div>

                <div className="flex justify-between mb-8">
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Bill To</h3>
                        <p className="font-medium">{order.shippingAddress?.fullName}</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress?.address}</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Payment Details</h3>
                        <p className="text-sm font-medium">{order.paymentMethod}</p>
                        <div className={`inline-block mt-1 text-xs px-2 py-1 rounded border ${isPaid ? 'border-green-200 text-green-700 bg-green-50' : 'border-yellow-200 text-yellow-700 bg-yellow-50'}`}>
                            {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                        </div>
                    </div>
                </div>

                <table className="w-full mb-8 text-sm">
                    <thead>
                        <tr className="border-b border-gray-300 text-left">
                            <th className="py-2 font-semibold">Item</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.items.map((item: any, idx: number) => (
                            <tr key={idx}>
                                <td className="py-3">
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.subCategory}</p>
                                </td>
                                <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-3 text-right text-gray-600">Rs. {item.price.toLocaleString()}</td>
                                <td className="py-3 text-right font-medium text-gray-900">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end border-t border-gray-300 pt-4">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">Rs. {(order.subtotal || order.items.reduce((acc: any, item: any) => acc + item.price * item.quantity, 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">Rs. {(order.shippingCost || 0).toLocaleString()}</span>
                        </div>
                        {order.tax > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-gray-900">Rs. {order.tax.toLocaleString()}</span>
                            </div>
                        )}
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-700">
                                <span className="flex items-center gap-1">
                                    Discount
                                    {order.couponCode && <span className="text-xs border border-green-200 px-1 rounded uppercase">({order.couponCode})</span>}
                                </span>
                                <span>- Rs. {order.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 mt-2">
                            <span>Total</span>
                            <span>Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
                    <p className="mb-1">Thank you for shopping with Attitude.pk!</p>
                    <p>For any questions, please contact our support at contact@attitude.pk</p>
                </div>
            </div>
        </>
    );
}
