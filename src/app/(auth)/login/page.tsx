'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';

import { Suspense } from 'react';
import CoolLoader from '@/components/ui/CoolLoader';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect based on role or to home
            if (data.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E6E6E6] overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-serif text-[#2C2C2C]">Welcome Back</h1>
                        <p className="text-[#6D6D6D]">Access your account and orders.</p>
                    </div>

                    {registered && (
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                            Account created successfully! Please log in.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#2C2C2C]">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#2C2C2C]">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1c524f] text-white py-3 rounded-xl hover:bg-[#143d3b] transition-colors font-medium flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="text-center text-[#6D6D6D] text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-[#5D8C62] font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<CoolLoader />}>
            <LoginContent />
        </Suspense>
    );
}
