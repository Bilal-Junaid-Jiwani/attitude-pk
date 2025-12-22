'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Save, LogOut, Phone, MapPin, Tag, ArrowLeft, Package, Clock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// ... interfaces
interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface Order {
    _id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    items: OrderItem[];
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    address?: string;
    postcode?: string;
    phone?: string;
    addressTag?: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ... existing form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        postcode: '',
        addressTag: 'Home'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profile
                const profileRes = await fetch('/api/user/profile');
                if (profileRes.status === 401) {
                    // router.push('/login'); // Removed: Show options instead
                    setUser(null); // Explicitly null
                    setLoading(false);
                    return;
                }
                const profileData = await profileRes.json();

                if (profileRes.ok) {
                    setUser(profileData);
                    setFormData({
                        name: profileData.name || '',
                        phone: profileData.phone || '',
                        address: profileData.address || '',
                        postcode: profileData.postcode || '',
                        addressTag: profileData.addressTag || 'Home'
                    });
                }

                // Fetch Orders
                const ordersRes = await fetch('/api/orders');
                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setOrders(ordersData.orders || []);
                }
            } catch (err) {
                console.error(err);
                setError('Could not load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // ... handleLogout, handleSubmit

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
            router.push('/login');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUser(data);
            setSuccess('Profile updated successfully!');
        } catch (err: any) {
            setError(err.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c524f]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <User size={64} className="mx-auto text-[#1c524f] bg-green-50 p-4 rounded-full mb-4" />
                        <h1 className="text-3xl font-heading font-bold text-[#1c524f]">Welcome</h1>
                        <p className="text-gray-600 mt-2">Access your account or track an order.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Link
                            href="/login"
                            className="group relative flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-[#1c524f] hover:shadow-md transition-all text-center"
                        >
                            <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-[#1c524f] group-hover:text-white transition-colors text-blue-600">
                                <LogOut className="rotate-180" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Login / Register</h3>
                            <p className="text-sm text-gray-500 mt-1">View your profile, saved addresses, and full order history.</p>
                        </Link>

                        <Link
                            href="/track-order"
                            className="group relative flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-[#1c524f] hover:shadow-md transition-all text-center"
                        >
                            <div className="bg-orange-50 p-3 rounded-full mb-3 group-hover:bg-[#1c524f] group-hover:text-white transition-colors text-orange-600">
                                <Package size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Track Guest Order</h3>
                            <p className="text-sm text-gray-500 mt-1">Track an order using your Order ID without logging in.</p>
                        </Link>
                    </div>

                    <div className="text-center pt-8">
                        <Link href="/" className="inline-flex items-center text-[#6D6D6D] hover:text-[#1c524f] transition-colors gap-2 text-sm font-medium">
                            <ArrowLeft size={16} />
                            Back to Shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/" className="inline-flex items-center text-[#6D6D6D] hover:text-[#1c524f] transition-colors gap-2 text-sm font-medium mb-2">
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-serif text-[#2C2C2C]">My Account</h1>
                    </div>
                    <button onClick={handleLogout} className="self-start md:self-auto flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium">
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'profile' ? 'border-[#1c524f] text-[#1c524f]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Profile Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-3 px-2 font-medium transition-colors border-b-2 ${activeTab === 'orders' ? 'border-[#1c524f] text-[#1c524f]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Order History
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'profile' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E6E6E6] p-8 space-y-8">
                        {/* Profile Form (Existing) */}
                        <div className="flex items-center gap-6 pb-8 border-b border-[#F0F0F0]">
                            <div className="w-20 h-20 bg-[#1c524f] rounded-full flex items-center justify-center text-white text-2xl font-serif">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-medium text-[#2C2C2C]">{user.name}</h2>
                                <p className="text-[#6D6D6D]">{user.email}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}
                        {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100">{success}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#2C2C2C]">Full Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#1c524f] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#2C2C2C]">Phone</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#1c524f] outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#2C2C2C]">Address</label>
                                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#1c524f] outline-none min-h-[80px]" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#2C2C2C]">Post Code</label>
                                    <input type="text" value={formData.postcode} onChange={(e) => setFormData({ ...formData, postcode: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#1c524f] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#2C2C2C]">Label</label>
                                    <select value={formData.addressTag} onChange={(e) => setFormData({ ...formData, addressTag: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-[#1c524f] outline-none">
                                        <option>Home</option><option>Work</option><option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="bg-[#1c524f] text-white px-8 py-3 rounded-xl hover:bg-[#153e3c] transition-colors disabled:opacity-70 flex items-center gap-2">
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                                <p className="text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
                                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1c524f] text-white rounded-full font-bold hover:bg-[#153e3c]">
                                    <ShoppingBag size={20} /> Start Shopping
                                </Link>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-[#E6E6E6] overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500 font-medium">Order ID</p>
                                            <p className="font-mono font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-500 font-medium">Date Placed</p>
                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                <Clock size={16} className="text-gray-400" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                                            <p className="font-bold text-[#1c524f] text-lg">Rs. {order.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold capitalize 
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                        <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-gray-900">Rs. {item.price.toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                                        <span>Payment via {order.paymentMethod}</span>
                                        {/* Optional: Add 'Track Order' button here later */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
