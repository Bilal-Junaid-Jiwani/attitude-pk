'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailFromQuery, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/'); // Redirect to home/dashboard
                router.refresh(); // Refresh to update auth state
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-[#E6E6E6] overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-[#1c524f]/10 rounded-full flex items-center justify-center">
                            <Mail className="text-[#1c524f]" size={24} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-serif text-[#2C2C2C]">Verify Your Email</h1>
                    <p className="text-[#6D6D6D]">
                        We've sent a 6-digit code to <span className="font-semibold text-[#1c524f]">{emailFromQuery}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm text-center flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        <div>Verified Successfully! Redirecting...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#2C2C2C]">Enter OTP Code</label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#5D8C62] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                placeholder="000000"
                                maxLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1c524f] text-white py-3 rounded-xl hover:bg-[#143d3b] transition-colors font-medium flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
