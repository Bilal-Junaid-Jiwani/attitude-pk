'use client';

import { useState, useEffect } from 'react';
import { Save, Truck, DollarSign, Tag, RefreshCcw, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Skeleton from '@/components/ui/Skeleton';

interface SubscribeConfig {
    enabled: boolean;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    newUsersOnly: boolean;
}

interface ShippingConfig {
    standardRate: number;
    freeShippingThreshold: number;
}

interface TaxConfig {
    enabled: boolean;
    rate: number; // percentage
}

interface CouponConfig {
    enabled: boolean;
}

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    maxUsesPerUser?: number;
    startDate?: string;
    expiryDate?: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    // Settings States
    // ... (Keep existing states)
    const [subscribeConfig, setSubscribeConfig] = useState<SubscribeConfig>({
        enabled: false, discountType: 'percentage', discountValue: 10, newUsersOnly: false
    });
    const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
        standardRate: 200, freeShippingThreshold: 5000
    });
    const [taxConfig, setTaxConfig] = useState<TaxConfig>({
        enabled: false, rate: 0
    });
    const [couponConfig, setCouponConfig] = useState<CouponConfig>({
        enabled: true
    });

    // Coupon Manager States
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        maxUsesPerUser: 1, // Default 1
        startDate: '',
        expiryDate: '',
        isUnlimited: false
    });
    const [addingCoupon, setAddingCoupon] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAllSettings();
        fetchCoupons();
    }, []);

    const fetchAllSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                data.forEach((setting: any) => {
                    if (setting.key === 'subscribeConfig') setSubscribeConfig(setting.value);
                    if (setting.key === 'shippingConfig') setShippingConfig(setting.value);
                    if (setting.key === 'taxConfig') setTaxConfig(setting.value);
                    if (setting.key === 'couponConfig') setCouponConfig(setting.value);
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            addToast('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/coupons');
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error('Failed to fetch coupons', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const savePromises = [
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'subscribeConfig', value: subscribeConfig }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'shippingConfig', value: shippingConfig }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'taxConfig', value: taxConfig }) }),
                fetch('/api/settings', { method: 'POST', body: JSON.stringify({ key: 'couponConfig', value: couponConfig }) }),
            ];

            await Promise.all(savePromises);
            addToast('All settings saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save settings', error);
            addToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discountValue) {
            addToast('Please fill required fields', 'error');
            return;
        }
        setAddingCoupon(true);
        try {
            const isEdit = !!editingId;
            const url = isEdit ? `/api/coupons/${editingId}` : '/api/coupons';
            const method = isEdit ? 'PUT' : 'POST';

            // Handle Unlimited Logic
            const payload = {
                ...newCoupon,
                maxUsesPerUser: newCoupon.isUnlimited ? 999999 : newCoupon.maxUsesPerUser,
                usageLimit: newCoupon.isUnlimited ? 999999 : undefined // Optional global limit
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                if (isEdit) {
                    setCoupons(coupons.map(c => c._id === editingId ? data : c));
                    addToast('Coupon updated', 'success');
                } else {
                    setCoupons([data, ...coupons]);
                    addToast('Coupon created', 'success');
                }
                resetCouponForm();
            } else {
                addToast(data.error || `Failed to ${isEdit ? 'update' : 'create'} coupon`, 'error');
            }
        } catch (error) {
            addToast('Operation failed', 'error');
        } finally {
            setAddingCoupon(false);
        }
    };

    const handleEditClick = (coupon: Coupon) => {
        setEditingId(coupon._id);
        setNewCoupon({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxUsesPerUser: coupon.maxUsesPerUser || 1,
            startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
            isUnlimited: (coupon.maxUsesPerUser && coupon.maxUsesPerUser > 10000) ? true : false
        });
    };

    const resetCouponForm = () => {
        setEditingId(null);
        setNewCoupon({
            code: '',
            discountType: 'percentage',
            discountValue: 0,
            maxUsesPerUser: 1,
            startDate: '',
            expiryDate: '',
            isUnlimited: false
        });
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

    const handleDeleteCouponClick = (id: string) => {
        setCouponToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDeleteCoupon = async () => {
        if (!couponToDelete) return;
        try {
            const res = await fetch(`/api/coupons/${couponToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setCoupons(coupons.filter(c => c._id !== couponToDelete));
                addToast('Coupon deleted', 'success');
            } else {
                addToast('Failed to delete coupon', 'error');
            }
        } catch (error) {
            addToast('Failed to delete coupon', 'error');
        } finally {
            setDeleteModalOpen(false);
            setCouponToDelete(null);
        }
    };

    if (loading) {
        // Skeleton mock for settings
        const SettingSectionSkeleton = () => (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                    </div>
                </div>
            </div>
        );

        return (
            <div className="max-w-4xl mx-auto pb-20 space-y-8 p-6">
                <div className="space-y-2 mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <SettingSectionSkeleton />
                <SettingSectionSkeleton />
                <SettingSectionSkeleton />
            </div>
        )
    }

    const SectionHeader = ({ icon: Icon, title, description }: any) => (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
            <div className="p-2 bg-white border border-gray-200 rounded-md">
                <Icon size={20} className="text-[#1c524f]" />
            </div>
            <div>
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
                <p className="text-gray-500">Manage your store configurations.</p>
            </header>

            {/* Subscribe & Save */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader icon={RefreshCcw} title="Subscribe & Save" description="Configure subscription discounts." />
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-900">Enable Offer</label>
                        <button onClick={() => setSubscribeConfig({ ...subscribeConfig, enabled: !subscribeConfig.enabled })}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${subscribeConfig.enabled ? 'bg-[#1c524f]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${subscribeConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    {subscribeConfig.enabled && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                                    <select value={subscribeConfig.discountType} onChange={(e) => setSubscribeConfig({ ...subscribeConfig, discountType: e.target.value as any })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (Rs)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                    <input type="number" value={subscribeConfig.discountValue} onChange={(e) => setSubscribeConfig({ ...subscribeConfig, discountValue: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <input id="newUsers" type="checkbox" checked={subscribeConfig.newUsersOnly} onChange={(e) => setSubscribeConfig({ ...subscribeConfig, newUsersOnly: e.target.checked })} className="h-4 w-4 text-[#1c524f] border-gray-300 rounded" />
                                <label htmlFor="newUsers" className="ml-2 block text-sm text-gray-900">New Users Only</label>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader icon={Truck} title="Shipping" description="Set shipping rates and free shipping threshold." />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Standard Rate (Rs)</label>
                        <input type="number" value={shippingConfig.standardRate} onChange={(e) => setShippingConfig({ ...shippingConfig, standardRate: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (Rs)</label>
                        <input type="number" value={shippingConfig.freeShippingThreshold} onChange={(e) => setShippingConfig({ ...shippingConfig, freeShippingThreshold: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                    </div>
                </div>
            </div>

            {/* Tax */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader icon={DollarSign} title="Tax" description="Configure tax calculation." />
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-900">Enable Tax</label>
                        <button onClick={() => setTaxConfig({ ...taxConfig, enabled: !taxConfig.enabled })}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${taxConfig.enabled ? 'bg-[#1c524f]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${taxConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    {taxConfig.enabled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                            <input type="number" value={taxConfig.rate} onChange={(e) => setTaxConfig({ ...taxConfig, rate: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                        </div>
                    )}
                </div>
            </div>

            {/* Coupons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader icon={Tag} title="Coupons" description="Manage discount coupons." />
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-900">Enable Coupons Global</label>
                        <button onClick={() => setCouponConfig({ ...couponConfig, enabled: !couponConfig.enabled })}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${couponConfig.enabled ? 'bg-[#1c524f]' : 'bg-gray-200'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${couponConfig.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {couponConfig.enabled && (
                        <div className="border-t border-gray-100 pt-6">
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">
                                    {editingId ? 'Edit Coupon' : 'Create New Coupon'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Code</label>
                                        <input
                                            type="text"
                                            placeholder="SUMMER10"
                                            value={newCoupon.code}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                        <select
                                            value={newCoupon.discountType}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (Rs)</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                                        <input
                                            type="number"
                                            placeholder="10"
                                            value={newCoupon.discountValue}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    {/* Row 2: Dates */}
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={newCoupon.startDate || ''}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
                                        <input
                                            type="date"
                                            value={newCoupon.expiryDate || ''}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <div className="md:col-span-1 flex items-center h-full pb-3">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newCoupon.isUnlimited}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, isUnlimited: e.target.checked })}
                                                className="rounded border-gray-300 text-[#1c524f] focus:ring-[#1c524f]"
                                            />
                                            <span className="text-xs font-medium">Unlimited Usage</span>
                                        </label>
                                    </div>

                                    {!newCoupon.isUnlimited && (
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Max Uses/User</label>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                value={newCoupon.maxUsesPerUser}
                                                onChange={(e) => setNewCoupon({ ...newCoupon, maxUsesPerUser: parseInt(e.target.value) || 1 })}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-1 flex gap-2">
                                        <button
                                            onClick={handleSubmitCoupon}
                                            disabled={addingCoupon}
                                            className="flex-1 flex items-center justify-center gap-1 bg-[#1c524f] text-white py-2 rounded-md font-medium hover:bg-[#153e3c] transition-colors text-sm disabled:opacity-50"
                                        >
                                            {editingId ? <RefreshCcw size={14} /> : <Plus size={14} />}
                                            {editingId ? 'Update' : 'Add'}
                                        </button>
                                        {editingId && (
                                            <button
                                                onClick={resetCouponForm}
                                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-gray-900 mb-3">Active Coupons</h3>
                            {coupons.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No active coupons found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {coupons.map((coupon) => (
                                        <div key={coupon._id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#1c524f]">
                                                    <Tag size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{coupon.code}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `Rs. ${coupon.discountValue} Off`}
                                                        {' • '}Used: {coupon.usedCount}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(coupon)}
                                                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                >
                                                    <RefreshCcw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCouponClick(coupon._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#1c524f] hover:bg-[#153e3c] focus:outline-none disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteCoupon}
                title="Delete Coupon"
                message="Are you sure you want to delete this coupon? This action cannot be undone."
                confirmText="Delete Coupon"
            />
        </div>
    );
}
