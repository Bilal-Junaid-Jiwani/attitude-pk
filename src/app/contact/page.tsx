'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: '' });

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setStatus({ type: 'error', message: data.message || 'Something went wrong.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* Header Section */}
            <div className="bg-[#1c524f] text-white py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto px-4">
                    Have questions about our products or your order? We're here to help.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                            <p className="text-gray-600 mb-8">
                                Feel free to reach out to us through any of the following channels. Our support team is available Mon-Sat, 9am - 6pm.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#e9f2f1] p-3 rounded-full">
                                    <Phone className="w-6 h-6 text-[#1c524f]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Phone</h3>
                                    <p className="text-gray-600">+92 300 1234567</p>
                                    <p className="text-sm text-gray-500">Mon-Sat 9am-6pm</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#e9f2f1] p-3 rounded-full">
                                    <Mail className="w-6 h-6 text-[#1c524f]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email</h3>
                                    <p className="text-gray-600">attitudelivingpk@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#e9f2f1] p-3 rounded-full">
                                    <MapPin className="w-6 h-6 text-[#1c524f]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Office</h3>
                                    <p className="text-gray-600">
                                        Head Office: D-22/1, Block-17,<br />
                                        Gulshan-e-Iqbal, Karachi-75300,<br />
                                        Pakistan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                        {status.message && (
                            <div className={`p-4 rounded-md mb-6 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-colors"
                                        placeholder="+92 300..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-colors"
                                    placeholder="Order Inquiry / Product Question"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1c524f] focus:border-transparent outline-none transition-colors"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1c524f] text-white py-3 rounded-md font-semibold hover:bg-[#14423f] transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Send Message</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
