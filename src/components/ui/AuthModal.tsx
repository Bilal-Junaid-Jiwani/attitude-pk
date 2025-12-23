'use client';

import React from 'react';
import Link from 'next/link';
import { X, LogIn } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message = "Please login to avail this offer." }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-50 text-[#1c524f] rounded-full flex items-center justify-center mb-6">
                        <LogIn size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
                    <p className="text-gray-600 mb-8">{message}</p>

                    <div className="w-full space-y-3">
                        <Link
                            href="/login"
                            className="block w-full bg-[#1c524f] text-white font-bold py-3 rounded-md hover:bg-[#153e3c] transition-colors"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="block w-full border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
