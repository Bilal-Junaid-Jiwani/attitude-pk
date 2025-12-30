'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import CoolLoader from '@/components/ui/CoolLoader';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Order {
    _id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    items: any[];
}

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
    country?: string;
    notes?: string;
    createdAt: string;
    type?: 'Registered' | 'Guest'; // Added type
}

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToast } = useToast();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const fetchCustomerData = async () => {
        try {
            const res = await fetch(`/api/admin/customers/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data.customer);
                setOrders(data.orders);
            } else {
                throw new Error('Customer not found');
            }
        } catch (error) {
            console.error(error);
            addToast('Failed to load customer details', 'error');
            router.push('/admin/customers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CoolLoader />;
    if (!customer) return <div>Customer not found</div>;

    const totalSpent = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
    const lastOrder = orders[0]; // Sorted by date desc in API

    const handleDeleteClick = () => {
        if (!customer) return;

        // Check if guest
        if (customer.type === 'Guest') {
            addToast('Cannot delete guest profiles directly. Delete their orders instead.', 'error');
            return;
        }

        setIsDeleteModalOpen(true);
    };

    const confirmDeleteCustomer = async () => {
        setDeleting(true);

        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                addToast('Customer deleted successfully', 'success');
                router.push('/admin/customers');
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete customer');
            }
        } catch (error: any) {
            console.error(error);
            addToast(error.message || 'Failed to delete customer', 'error');
            setIsDeleteModalOpen(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-[#303030]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/customers" className="p-2 border bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600">
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                            {customer.name}
                            {customer.type === 'Guest' && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                    Guest
                                </span>
                            )}
                        </h1>
                        <p className="text-xs text-gray-500">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Orders */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex divide-x divide-gray-100">
                        <div className="flex-1 px-4 first:pl-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Amount Spent</p>
                            <p className="text-lg font-bold text-[#1a1a1a]">Rs. {totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="flex-1 px-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Orders</p>
                            <p className="text-lg font-bold text-[#1a1a1a]">{orders.length}</p>
                        </div>
                        <div className="flex-1 px-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Avg. Order Value</p>
                            <p className="text-lg font-bold text-[#1a1a1a]">Rs. {Math.round(averageOrderValue).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Last Order Preview */}
                    {lastOrder && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Last Order</h2>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Link href={`/admin/orders/${lastOrder._id}`} className="text-[#1c524f] font-medium hover:underline text-lg">
                                        #{lastOrder.orderNumber || lastOrder._id.slice(-6).toUpperCase()}
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                        {new Date(lastOrder.createdAt).toLocaleDateString()} at {new Date(lastOrder.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">Rs. {lastOrder.totalAmount.toLocaleString()}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                        {lastOrder.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="font-semibold text-gray-900">Orders</h2>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Order</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4 font-medium text-[#1c524f]">
                                            <Link href={`/admin/orders/${order._id}`} className="hover:underline">
                                                #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                            <span className="ml-2 text-gray-500 text-xs">{order.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">Rs. {order.totalAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/orders/${order._id}`}>
                                                <ExternalLink size={16} className="text-gray-400 hover:text-gray-600 inline-block" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {/* Customer Notes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Customer notes</h3>
                            <button className="text-[#1c524f] text-xs font-medium hover:underline">Edit</button>
                        </div>
                        <p className="text-sm text-gray-500 italic">No notes provided</p>
                    </div>

                    {/* Customer Contact */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Customer overview</h3>
                            <button className="text-[#1c524f] text-xs font-medium hover:underline">Edit</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                                <p className="text-sm text-[#1c524f] hover:underline flex items-center gap-2">
                                    <Mail size={14} /> {customer.email}
                                </p>
                            </div>
                            {customer.phone && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                        <Phone size={14} /> {customer.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Default Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">Default address</h3>
                            <button className="text-[#1c524f] text-xs font-medium hover:underline">Manage</button>
                        </div>

                        {customer.address ? (
                            <div className="text-sm text-gray-700 space-y-1">
                                <p className="font-medium">{customer.name}</p>
                                <p>{customer.address}</p>
                                <p>{customer.city} {customer.postcode}</p>
                                <p>{customer.country || 'Pakistan'}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No address saved</p>
                        )}
                    </div>

                    <button
                        onClick={handleDeleteClick}
                        disabled={loading || deleting}
                        className="w-full text-left text-red-600 text-sm font-medium p-2 hover:bg-red-50 rounded flex items-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete customer'}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteCustomer}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This cannot be undone."
                isLoading={deleting}
                confirmText="Delete Customer"
            />
        </div>
    );
}
