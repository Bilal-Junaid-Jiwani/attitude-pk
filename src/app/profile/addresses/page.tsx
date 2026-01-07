'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, CheckCircle, Home, Briefcase, School, Star } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface Address {
    _id?: string;
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    label: string;
    isDefault: boolean;
}

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MapPin className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Addresses Found</h3>
        <p className="text-gray-500 mb-6 max-w-sm">
            Add an address to speed up your checkout process.
        </p>
        <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-[#1c524f] text-white px-6 py-3 rounded-full font-bold hover:bg-[#153e3c] transition-all"
        >
            <Plus size={20} />
            Add New Address
        </button>
    </div>
);

export default function AddressBookPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const { addToast } = useToast();

    // Form State
    const [formData, setFormData] = useState<Address>({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        label: 'Home',
        isDefault: false
    });

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/user/address');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const resetForm = () => {
        setFormData({
            fullName: '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            label: 'Home',
            isDefault: false
        });
        setEditingAddress(null);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (addr: Address) => {
        setEditingAddress(addr);
        setFormData(addr);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingAddress ? 'PUT' : 'POST';
            const body = editingAddress
                ? { addressId: editingAddress._id, updates: formData, action: 'update' }
                : { address: formData, action: 'add' };

            const res = await fetch('/api/user/address', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);
                addToast(editingAddress ? 'Address updated' : 'Address added', 'success');
                setIsModalOpen(false);
                resetForm();
            } else {
                addToast('Failed to save address', 'error');
            }
        } catch (error) {
            addToast('Something went wrong', 'error');
        }
    };

    const deleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await fetch(`/api/user/address?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);
                addToast('Address deleted', 'success');
            }
        } catch (error) {
            addToast('Failed to delete', 'error');
        }
    };

    const setDefault = async (id: string) => {
        try {
            const res = await fetch('/api/user/address', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addressId: id, action: 'setDefault' })
            });

            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses);
                addToast('Default address updated', 'success');
            }
        } catch (error) {
            addToast('Failed to update', 'error');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading addresses...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#1c524f]">Address Book</h2>
                {addresses.length > 0 && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-[#1c524f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#153e3c] transition-colors"
                    >
                        <Plus size={18} />
                        Add New
                    </button>
                )}
            </div>

            {addresses.length === 0 ? (
                <EmptyState onAdd={openAddModal} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <div key={addr._id} className={`bg-white p-6 rounded-xl border-2 transition-all relative ${addr.isDefault ? 'border-[#1c524f] shadow-sm' : 'border-transparent shadow hover:shadow-md'}`}>
                            {addr.isDefault && (
                                <div className="absolute top-4 right-4 text-[#1c524f] flex items-center gap-1 bg-[#1c524f]/10 px-2 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle size={14} /> Default
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    {addr.label === 'Home' ? <Home size={18} /> :
                                        addr.label === 'Work' ? <Briefcase size={18} /> :
                                            <MapPin size={18} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{addr.label}</h3>
                                    <p className="text-xs text-gray-500">{addr.fullName}</p>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 mb-6">
                                <p>{addr.address}</p>
                                <p>{addr.city} - {addr.postalCode}</p>
                                <p>{addr.phone}</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => openEditModal(addr)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => deleteAddress(addr._id!)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => setDefault(addr._id!)}
                                        className="p-2 text-gray-400 hover:text-[#1c524f] transition-colors rounded-lg hover:bg-[#1c524f]/10"
                                        title="Set as Default"
                                    >
                                        <Star size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Label</label>
                                <div className="flex gap-3">
                                    {['Home', 'Work', 'Other'].map(l => (
                                        <button
                                            key={l}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, label: l })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border ${formData.label === l ? 'bg-[#1c524f] text-white border-[#1c524f]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1c524f] focus:outline-none"
                                        placeholder="Ali Khan"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1c524f] focus:outline-none"
                                        placeholder="House #123, Street 4, Sector F-8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1c524f] focus:outline-none"
                                        placeholder="Islamabad"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Postal Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1c524f] focus:outline-none"
                                        placeholder="44000"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1c524f] focus:outline-none"
                                        placeholder="0300 1234567"
                                    />
                                </div>
                                <div className="col-span-2 flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="w-4 h-4 text-[#1c524f] rounded focus:ring-[#1c524f]"
                                    />
                                    <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#1c524f] text-white py-3 rounded-lg font-bold hover:bg-[#153e3c] transition-colors mt-4"
                            >
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
