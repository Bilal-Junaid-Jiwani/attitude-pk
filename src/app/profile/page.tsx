'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Tag, User } from 'lucide-react';
import Link from 'next/link';

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
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c524f]"></div>
            </div>
        );
    }

    // Guest View
    if (!user) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-[#1c524f]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1c524f]">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Guest!</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Log in to manage your profile, view order history, and access exclusive offers.
                        Or track your order below.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/login"
                            className="bg-[#1c524f] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#153e3c] transition-all shadow-lg shadow-[#1c524f]/20"
                        >
                            Login / Register
                        </Link>
                    </div>
                </div>

                {/* Guest Tracking Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
                            <Tag size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Track Order</h3>
                            <p className="text-sm text-gray-500">Enter your Order ID to see current status</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/track-order"
                            className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/10"
                        >
                            Track an Order
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
                <p className="text-gray-500 text-sm mt-1">Update your personal information and address.</p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#1c524f] rounded-full flex items-center justify-center text-white text-3xl font-heading shadow-lg shadow-[#1c524f]/20">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500">{user.email}</p>
                        <span className="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </span>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">⚠️ {error}</div>}
                {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100 flex items-center gap-2">✓ {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all min-h-[100px]"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Post Code</label>
                            <input
                                type="text"
                                value={formData.postcode}
                                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Address Label</label>
                            <div className="relative">
                                <select
                                    value={formData.addressTag}
                                    onChange={(e) => setFormData({ ...formData, addressTag: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none appearance-none transition-all"
                                >
                                    <option>Home</option>
                                    <option>Work</option>
                                    <option>Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Tag size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#1c524f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#153e3c] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#1c524f]/20 active:scale-95 duration-200"
                        >
                            <Save size={18} />
                            {saving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
