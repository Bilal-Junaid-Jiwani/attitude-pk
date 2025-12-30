'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', securityCode: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Redirect to verify email if OTP is required
            if (data.requiresOtp) {
                router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            } else {
                router.push('/login?registered=true');
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
                        <h1 className="text-3xl font-serif text-[#2C2C2C]">Create Account</h1>
                        <p className="text-[#6D6D6D]">Join our community of natural care.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#2C2C2C]">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-[#A0A0A0]" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                                    minLength={6}
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
                            {loading ? 'Creating Account...' : 'Sign Up'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="text-center text-[#6D6D6D] text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#5D8C62] font-semibold hover:underline">
                            Log In
                        </Link>
                    </div>
                </div>
                <div className="bg-[#5D8C62]/10 p-4 text-center text-xs text-[#5D8C62]">
                    By signing up, you agree to our Terms & Privacy Policy.
                </div>
            </div>
        </div>
    );
}
