'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Coupon {
    _id?: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    isActive: boolean;
}

interface Settings {
    taxRate: number;
    shippingCost: number;
    coupons: Coupon[];
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        taxRate: 0,
        shippingCost: 200,
        coupons: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        ...data,
                        coupons: data.coupons || []
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('Settings saved successfully');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addCoupon = () => {
        setSettings(prev => ({
            ...prev,
            coupons: [...prev.coupons, { code: '', discountType: 'percentage', discountValue: 0, isActive: true }]
        }));
    };

    const removeCoupon = (index: number) => {
        setSettings(prev => ({
            ...prev,
            coupons: prev.coupons.filter((_, i) => i !== index)
        }));
    };

    const updateCoupon = (index: number, field: keyof Coupon, value: any) => {
        setSettings(prev => ({
            ...prev,
            coupons: prev.coupons.map((c, i) => i === index ? { ...c, [field]: value } : c)
        }));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="p-6 bg-[#F6F6F7] min-h-screen text-[#303030]">
            <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#333] disabled:opacity-50"
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">

                {/* General Settings: Tax & Shipping */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">General Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Cost (Rs.)</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                                value={settings.shippingCost}
                                onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-gray-500 mt-1">This will be the base shipping for all orders.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                                value={settings.taxRate}
                                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Applied to subtotal before shipping.</p>
                        </div>
                    </div>
                </div>

                {/* Coupons Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Tag size={18} /> Coupons
                        </h2>
                        <button
                            onClick={addCoupon}
                            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                        >
                            <Plus size={16} /> Add Coupon
                        </button>
                    </div>

                    <div className="space-y-4">
                        {settings.coupons.length === 0 && (
                            <p className="text-center text-gray-500 py-4 text-sm">No coupons created yet.</p>
                        )}
                        {settings.coupons.map((coupon, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 p-3 rounded border border-gray-100">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Code (e.g. SALE50)"
                                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm uppercase font-mono"
                                        value={coupon.code}
                                        onChange={(e) => updateCoupon(index, 'code', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <select
                                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                        value={coupon.discountType}
                                        onChange={(e) => updateCoupon(index, 'discountType', e.target.value)}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (Rs.)</option>
                                    </select>
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        placeholder="Val"
                                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                                        value={coupon.discountValue}
                                        onChange={(e) => updateCoupon(index, 'discountValue', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600 flex items-center gap-1 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={coupon.isActive}
                                            onChange={(e) => updateCoupon(index, 'isActive', e.target.checked)}
                                            className="rounded border-gray-300"
                                        /> Active
                                    </label>
                                    <button
                                        onClick={() => removeCoupon(index)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
