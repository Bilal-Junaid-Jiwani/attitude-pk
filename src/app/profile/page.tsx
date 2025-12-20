'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Save, LogOut, Phone, MapPin, Tag, ArrowLeft } from 'lucide-react';
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

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        postcode: '',
        addressTag: 'Home'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                if (!res.ok) throw new Error('Failed to fetch profile');

                const data = await res.json();
                setUser(data);
                setFormData({
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    postcode: data.postcode || '',
                    addressTag: data.addressTag || 'Home'
                });
            } catch (err) {
                console.error(err);
                setError('Could not load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
            // Force redirect anyway
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

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setUser(data);
            setSuccess('Profile updated successfully!');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
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
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Back Button */}
                <Link href="/" className="inline-flex items-center text-[#6D6D6D] hover:text-[#1c524f] transition-colors gap-2 text-sm font-medium">
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif text-[#2C2C2C]">My Profile</h1>
                        <p className="text-[#6D6D6D]">Manage your personal information</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E6E6E6] overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 pb-8 border-b border-[#F0F0F0]">
                            <div className="w-20 h-20 bg-[#1c524f] rounded-full flex items-center justify-center text-white text-2xl font-serif">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-medium text-[#2C2C2C]">{user.name}</h2>
                                <p className="text-[#6D6D6D]">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                                        {user.role} Account
                                    </span>
                                    {user.addressTag && (
                                        <span className="inline-block px-3 py-1 bg-[#F0FDF4] text-[#1c524f] text-xs rounded-full capitalize border border-[#DCFCE7]">
                                            {user.addressTag}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm border border-green-100">
                                {success}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Personal Info Group */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-[#2C2C2C] border-b pb-2">Personal Details</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#2C2C2C]">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#2C2C2C]">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#2C2C2C]">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all"
                                                placeholder="+92 300 0000000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Group */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-lg font-medium text-[#2C2C2C] border-b pb-2">Address Information</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#2C2C2C]">Street Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all min-h-[80px] resize-none"
                                                placeholder="123 Main St, Area..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#2C2C2C]">Post Code</label>
                                            <input
                                                type="text"
                                                value={formData.postcode}
                                                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all"
                                                placeholder="75000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#2C2C2C]">Address Tag</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                                <select
                                                    value={formData.addressTag}
                                                    onChange={(e) => setFormData({ ...formData, addressTag: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all bg-white appearance-none"
                                                >
                                                    <option value="Home">Home</option>
                                                    <option value="Work">Work</option>
                                                    <option value="School">School</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#1c524f] text-white px-8 py-3 rounded-xl hover:bg-[#143d3b] transition-colors font-medium flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-[#1c524f]/20"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
