'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Trash2, Clock, Plus, Search, Lock, AlertTriangle, RefreshCw, ChevronRight, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface StaffMember {
    _id: string;
    name: string;
    email: string;
    role: string;
    lastLogin?: string;
    createdAt: string;
}

export default function StaffPage() {
    const [securityCode, setSecurityCode] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [errorShake, setErrorShake] = useState(0);

    // Determine online status
    const isOnline = (lastLogin?: string) => {
        if (!lastLogin) return false;
        const loginTime = new Date(lastLogin).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - loginTime) / (1000 * 60);
        return diffMinutes < 5;
    };

    const fetchStaff = useCallback(async (code: string) => {
        try {
            const res = await fetch('/api/admin/staff', {
                headers: { 'x-admin-code': code }
            });

            if (res.ok) {
                const data = await res.json();
                setStaff(data.staff);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }, []);

    const handleAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await fetchStaff(securityCode);

        if (success) {
            setIsAuthorized(true);
            toast.success('Access Granted', { icon: '🔐' });
        } else {
            setErrorShake(prev => prev + 1); // Trigger shake animation
            toast.error('Incorrect Security Code', {
                style: {
                    border: '1px solid #ef4444',
                    padding: '16px',
                    color: '#ef4444',
                },
                iconTheme: {
                    primary: '#ef4444',
                    secondary: '#FFFAEE',
                },
            });
        }
        setIsLoading(false);
    };

    // Auto-Polling
    useEffect(() => {
        if (!isAuthorized || !securityCode) return;
        const interval = setInterval(() => { fetchStaff(securityCode); }, 10000);
        return () => clearInterval(interval);
    }, [isAuthorized, securityCode, fetchStaff]);

    const handleDelete = async () => {
        if (!showDeleteModal) return;
        setDeleteLoading(true);

        try {
            const res = await fetch('/api/admin/staff', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-code': securityCode
                },
                body: JSON.stringify({ id: showDeleteModal })
            });

            if (res.ok) {
                setStaff(staff.filter(s => s._id !== showDeleteModal));
                toast.success('Admin removed successfully');
                setShowDeleteModal(null);
            } else {
                toast.error('Failed to remove admin');
            }
        } catch (error) {
            toast.error('Error occurred');
        } finally {
            setDeleteLoading(false);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-[#f1f1f1] p-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, x: errorShake % 2 === 0 ? 0 : [0, -10, 10, -10, 10, 0] }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white max-w-md w-full rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="p-8 pb-6">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                <Lock className="text-gray-400" size={32} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-center text-gray-900">Protected Area</h2>
                        <p className="text-gray-500 text-center text-sm mt-2">Enter the master security code to manage admins.</p>
                    </div>

                    <form onSubmit={handleAccess} className="px-8 pb-8 space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                value={securityCode}
                                onChange={(e) => setSecurityCode(e.target.value)}
                                className={`w-full px-4 py-3 bg-white border-2 rounded-lg text-lg text-center tracking-[0.3em] font-medium outline-none transition-all
                                    ${errorShake > 0 ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#008060] focus:ring-4 focus:ring-[#008060]/10'}
                                `}
                                placeholder="••••"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Unlock Access'}
                        </button>
                    </form>

                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center justify-center gap-2 transition-colors">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-6">
                <Link href="/admin" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors w-fit">
                    <ChevronRight className="rotate-180" size={16} />
                    Back to Dashboard
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users and permissions</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage who has access to your admin dashboard.</p>
                </div>
                <Link
                    href="/admin/register"
                    className="inline-flex items-center justify-center px-4 py-2 bg-[#008060] hover:bg-[#006e52] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={16} className="mr-2" />
                    Add staff
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-[0_0_0_1px_rgba(63,63,68,0.05),0_1px_3px_0_rgba(63,63,68,0.15)] overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Owner & Staff</h2>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {staff.length} Active
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 w-1/3">Name</th>
                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500">Email</th>
                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500">Status</th>
                                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500">Last Login</th>
                                <th className="text-right py-3 px-6 text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {staff.map((member) => (
                                    <motion.tr
                                        key={member._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {member.email}
                                        </td>
                                        <td className="py-4 px-6">
                                            {isOnline(member.lastLogin) ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    Online
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                    Offline
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {member.lastLogin
                                                ? new Date(member.lastLogin).toLocaleDateString() + ' ' + new Date(member.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : <span className="text-gray-400">Never</span>}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => setShowDeleteModal(member._id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Remove Access"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards (only for small screens) */}
            <div className="mt-8 mb-4 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
                <p>Admins have full access to all resources.</p>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-sm rounded-xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Remove admin?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    This will permanently revoke their access to the store dashboard. This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleteLoading}
                                        className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg text-sm transition-colors flex items-center gap-2"
                                    >
                                        {deleteLoading ? <RefreshCw className="animate-spin" size={14} /> : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
