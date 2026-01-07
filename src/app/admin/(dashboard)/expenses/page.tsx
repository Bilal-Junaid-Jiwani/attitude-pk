'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, Package, Megaphone, Users, Home, Zap, FileText,
    ChevronLeft, ChevronRight, Save, Trash2, Plus, AlertCircle
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Expense {
    _id?: string;
    month: string;
    advertising: number;
    packaging: number;
    returnShipping: number;
    staffSalary: number;
    rent: number;
    utilities: number;
    other: number;
    packagingPerOrder: number;
    shippingPerOrder: number;
    notes: string;
}

const defaultExpense: Omit<Expense, '_id'> = {
    month: '',
    advertising: 0,
    packaging: 0,
    returnShipping: 0,
    staffSalary: 0,
    rent: 0,
    utilities: 0,
    other: 0,
    packagingPerOrder: 0,
    shippingPerOrder: 0,
    notes: ''
};

const expenseFields = [
    { key: 'advertising', label: 'Advertising & Marketing', icon: Megaphone, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { key: 'packaging', label: 'Packaging & Materials', icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { key: 'returnShipping', label: 'Return Shipping Costs', icon: TrendingUp, color: 'text-red-600', bgColor: 'bg-red-50' },
    { key: 'staffSalary', label: 'Staff Salary', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'rent', label: 'Rent', icon: Home, color: 'text-green-600', bgColor: 'bg-green-50' },
    { key: 'utilities', label: 'Utilities (Electricity, Internet)', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { key: 'other', label: 'Other Expenses', icon: DollarSign, color: 'text-gray-600', bgColor: 'bg-gray-50' }
] as const;

export default function ExpensesPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [formData, setFormData] = useState<Omit<Expense, '_id'>>(defaultExpense);
    const [deleteModal, setDeleteModal] = useState(false);

    // Fetch all expenses
    useEffect(() => {
        fetchExpenses();
    }, []);

    // Load selected month data
    useEffect(() => {
        const existing = allExpenses.find(e => e.month === selectedMonth);
        if (existing) {
            setFormData({
                month: existing.month,
                advertising: existing.advertising,
                packaging: existing.packaging,
                returnShipping: existing.returnShipping,
                staffSalary: existing.staffSalary,
                rent: existing.rent,
                utilities: existing.utilities,
                other: existing.other,
                packagingPerOrder: existing.packagingPerOrder || 0,
                shippingPerOrder: existing.shippingPerOrder || 0,
                notes: existing.notes || ''
            });
        } else {
            setFormData({ ...defaultExpense, month: selectedMonth });
        }
    }, [selectedMonth, allExpenses]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/expenses');
            if (res.ok) {
                const data = await res.json();
                setAllExpenses(data);
            }
        } catch (error) {
            console.error('Failed to load expenses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, month: selectedMonth })
            });

            if (res.ok) {
                addToast('Expenses saved successfully', 'success');
                fetchExpenses();
            } else {
                addToast('Failed to save expenses', 'error');
            }
        } catch (error) {
            addToast('Error saving expenses', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/admin/expenses?month=${selectedMonth}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                addToast('Expenses deleted', 'success');
                fetchExpenses();
                setDeleteModal(false);
            } else {
                addToast('Failed to delete', 'error');
            }
        } catch (error) {
            addToast('Error deleting', 'error');
        }
    };

    const changeMonth = (direction: 'prev' | 'next') => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    };

    const formatMonthDisplay = (month: string) => {
        const [year, m] = month.split('-');
        const date = new Date(parseInt(year), parseInt(m) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const total = expenseFields.reduce((sum, f) => sum + (formData[f.key] || 0), 0);
    const existingRecord = allExpenses.find(e => e.month === selectedMonth);

    if (loading) {
        return (
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <ConfirmationModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Expense Record"
                message={`Are you sure you want to delete expenses for ${formatMonthDisplay(selectedMonth)}?`}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1a1a1a]">Business Expenses</h1>
                    <p className="text-sm text-gray-500">Track monthly operating costs for accurate profit calculations</p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                    <button
                        onClick={() => changeMonth('prev')}
                        className="p-1.5 hover:bg-gray-100 rounded"
                    >
                        <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <span className="text-sm font-semibold text-gray-900 min-w-[140px] text-center">
                        {formatMonthDisplay(selectedMonth)}
                    </span>
                    <button
                        onClick={() => changeMonth('next')}
                        className="p-1.5 hover:bg-gray-100 rounded"
                    >
                        <ChevronRight size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Status Badge */}
            {existingRecord ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
                    <AlertCircle size={14} />
                    Record exists for this month - editing will update it
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg w-fit">
                    <Plus size={14} />
                    No record for this month - saving will create a new entry
                </div>
            )}

            {/* Expense Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenseFields.map(({ key, label, icon: Icon, color, bgColor }) => (
                    <div
                        key={key}
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${bgColor}`}>
                                <Icon size={20} className={color} />
                            </div>
                            <label className="text-sm font-semibold text-gray-800">{label}</label>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rs.</span>
                            <input
                                type="number"
                                value={formData[key] || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    [key]: parseFloat(e.target.value) || 0
                                })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-lg font-semibold text-gray-900 outline-none focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/10 transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-Order Fixed Rates Section */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                        <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-blue-900">Per-Order Fixed Costs</h3>
                        <p className="text-xs text-blue-600">These rates are used to calculate costs per order in Analytics</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <label className="text-sm font-semibold text-gray-800 mb-2 block">Packaging Cost Per Order</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rs.</span>
                            <input
                                type="number"
                                value={formData.packagingPerOrder || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    packagingPerOrder: parseFloat(e.target.value) || 0
                                })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-lg font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Box, tape, tissue paper, etc.</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <label className="text-sm font-semibold text-gray-800 mb-2 block">Shipping Cost Per Order</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rs.</span>
                            <input
                                type="number"
                                value={formData.shippingPerOrder || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    shippingPerOrder: parseFloat(e.target.value) || 0
                                })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-lg font-semibold text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                placeholder="0"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Courier charges for free shipping orders</p>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                        <FileText size={20} className="text-gray-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-800">Notes (Optional)</label>
                </div>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/10 transition-all resize-none"
                    placeholder="Add any notes about this month's expenses..."
                />
            </div>

            {/* Total & Actions */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] p-6 rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-gray-400 text-sm">Total Expenses for {formatMonthDisplay(selectedMonth)}</p>
                        <p className="text-3xl font-bold text-white">Rs. {total.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-3">
                        {existingRecord && (
                            <button
                                onClick={() => setDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#008060] text-white rounded-lg font-semibold hover:bg-[#006e52] transition-colors disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Expenses'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Records */}
            {allExpenses.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Expense Records</h3>
                    <div className="space-y-2">
                        {allExpenses.slice(0, 6).map(e => {
                            const monthTotal = expenseFields.reduce((s, f) => s + (e[f.key] || 0), 0);
                            return (
                                <button
                                    key={e._id}
                                    onClick={() => setSelectedMonth(e.month)}
                                    className={`w-full flex justify-between items-center p-3 rounded-lg text-sm transition-colors ${selectedMonth === e.month
                                        ? 'bg-[#008060]/10 border border-[#008060]/30 text-[#008060]'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    <span className="font-medium">{formatMonthDisplay(e.month)}</span>
                                    <span className="font-semibold">Rs. {monthTotal.toLocaleString()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
