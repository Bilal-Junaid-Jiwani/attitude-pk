'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // Assuming we use the same API but validate role client-side for "separation" illusion 
    // or we could create a dedicated /api/admin/login logic. 
    // For now, let's use the standard login endpoint but strictly check role before redirecting.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // CRITICAL: Staff/Admin Verification
            if (data.role !== 'admin') {
                // If they are a user, we technically logged them in (cookie set), 
                // but we want to deny access to this portal. 
                // We should probably logout immediately or just show error using a new logout endpoint if needed.
                // For simplified UX: show error and maybe clear cookie?
                await fetch('/api/auth/logout', { method: 'POST' }); // Ensure session is killed
                throw new Error('Access Denied: Staff accounts only.');
            }

            // If Admin
            router.push('/admin');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-[#1c524f] px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">Attitude PK</h1>
                        <p className="text-green-100 text-sm mt-2 font-medium">Staff Administration Portal</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8 pt-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1c524f] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-[#1c524f] focus:ring-4 focus:ring-[#1c524f]/10 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                    placeholder="admin@attitudepk.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1c524f] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-[#1c524f] focus:ring-4 focus:ring-[#1c524f]/10 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1c524f] text-white py-3.5 rounded-lg font-bold shadow-lg shadow-[#1c524f]/20 hover:shadow-xl hover:shadow-[#1c524f]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Secure Login
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-3">
                        <Link href="/admin/register" className="block text-sm font-medium text-gray-600 hover:text-[#1c524f] transition-all">
                            Don't have an account? <span className="font-bold underline">Sign Up</span>
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
