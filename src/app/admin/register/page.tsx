'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, Key, ArrowRight, AlertCircle, ShieldPlus } from 'lucide-react';

export default function AdminRegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminCode, setAdminCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, adminCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Success -> Redirect to dashboard (Force reload to update cookies)
            window.location.href = '/admin';

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-[#1c524f] px-8 py-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                            <ShieldPlus size={28} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Join Staff</h1>
                        <p className="text-green-100 text-xs mt-1 font-medium">Create New Administrator Account (v2.0)</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1c524f] transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-[#1c524f] focus:ring-4 focus:ring-[#1c524f]/10 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1c524f] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-[#1c524f] focus:ring-4 focus:ring-[#1c524f]/10 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                    placeholder="admin@attitudepk.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1c524f] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-[#1c524f] focus:ring-4 focus:ring-[#1c524f]/10 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#1c524f] uppercase tracking-wider ml-1 flex items-center gap-1">
                                <Key size={12} fill="currentColor" /> Access Code
                            </label>
                            <div className="relative group">
                                <input
                                    type="password"
                                    required
                                    value={adminCode}
                                    onChange={(e) => setAdminCode(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2.5 bg-white border-2 border-[#1c524f]/30 rounded-lg outline-none focus:border-[#1c524f] focus:ring-4 focus:ring-[#1c524f]/10 transition-all font-bold text-gray-800 placeholder:text-gray-300 tracking-widest text-center"
                                    placeholder="0000"
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1c524f] text-white py-3.5 rounded-lg font-bold shadow-lg shadow-[#1c524f]/20 hover:shadow-xl hover:shadow-[#1c524f]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <Link href="/admin/login" className="block text-sm font-semibold text-[#1c524f] hover:underline transition-all">
                            Already have an account? Login
                        </Link>
                        <Link href="/" className="block text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                            Return to Store
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
