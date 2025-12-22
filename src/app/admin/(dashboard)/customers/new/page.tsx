'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function NewCustomerPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        country: 'Pakistan'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Need a new POST endpoint for creating customers? 
            // Or use the existing auth/register endpoint but modified?
            // Let's create a dedicated action on /api/admin/customers or just re-use standard logic.
            // Since this is admin-only, we should use /api/admin/customers via POST.
            // But currently /api/admin/customers is GET only.

            // For now, I'll assume we update /api/admin/customers to handle POST as well
            // or we just call the register API with a special flag.
            // Let's modify the /api/admin/customers/route.ts next to handle POST.

            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email.toLowerCase(),
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    postcode: formData.postcode,
                    role: 'guest'
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create customer');

            addToast('Customer created successfully', 'success');
            router.push('/admin/customers');
        } catch (error: any) {
            console.error(error);
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 text-[#303030]">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/customers" className="p-2 border bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600">
                    <ArrowLeft size={16} />
                </Link>
                <h1 className="text-xl font-bold text-[#1a1a1a]">Add Customer</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Customer Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">First name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Last name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone number</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Address</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Postcode</label>
                                <input
                                    name="postcode"
                                    value={formData.postcode}
                                    onChange={handleChange}
                                    className="w-full text-sm border rounded p-2 focus:ring-1 focus:ring-[#1c524f] outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Country</label>
                            <input
                                name="country"
                                value={formData.country}
                                disabled
                                className="w-full text-sm border rounded p-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#1c524f] text-white px-6 py-2 rounded text-sm font-medium shadow hover:bg-[#143d3b] disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Customer
                    </button>
                </div>
            </form>
        </div>
    );
}
