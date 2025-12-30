'use client';

import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#1c524f] mb-8 text-center">Frequently Asked Questions</h1>

            <div className="space-y-6">

                {/* Shipping */}
                <FAQSection title="Shipping & Delivery">
                    <FAQItem question="Do you ship nationwide?" answer="Yes, we ship to all cities and towns across Pakistan via TCS, Leopards, and Call Courier." />
                    <FAQItem question="What is the delivery time?" answer="Karachi orders typically take 2-3 working days. Other cities take 3-5 working days. Remote areas may take up to 7 days." />
                    <FAQItem question="What are the shipping charges?" answer="We charge a flat rate of Rs. 250 nationwide. Orders above Rs. 5,000 qualify for FREE shipping." />
                </FAQSection>

                {/* Orders */}
                <FAQSection title="Orders & Payment">
                    <FAQItem question="What payment methods do you accept?" answer="We accept Cash on Delivery (COD) and Online Bank Transfer (Direct Deposit)." />
                    <FAQItem question="Can I cancel my order?" answer="You can cancel your order before it has been processed/shipped (usually within 12 hours). Please contact us on WhatsApp immediately." />
                    <FAQItem question="How do I track my order?" answer="Once shipped, you will receive an SMS/Email with your Tracking Number and a link to the courier's tracking page." />
                </FAQSection>

                {/* Returns */}
                <FAQSection title="Returns & Exchanges">
                    <FAQItem question="Can I return a product if I don't like it?" answer="Due to hygiene reasons, we do not accept returns for change of mind. Please check our detailed Shipping & Refund Policy." />
                    <FAQItem question="What if I receive a damaged product?" answer="If you receive a damaged or leaked product, please take a picture and send it to us via WhatsApp or Email within 48 hours. We will replace it free of charge." />
                </FAQSection>

                {/* Products */}
                <FAQSection title="Product Information">
                    <FAQItem question="Are your products natural?" answer="Yes! ATTITUDE PK products are made with natural, plant-based, and mineral ingredients that minimize our impact on the planet." />
                    <FAQItem question="Are they safe for babies?" answer="Absolutely. Our baby line is hypoallergenic, dermatologically tested, and free from harmful chemicals commonly found in baby products." />
                </FAQSection>

            </div>
        </div>
    );
}

function FAQSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
            <div className="divide-y divide-gray-50">
                {children}
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left focus:outline-none group"
            >
                <span className="font-medium text-gray-800 group-hover:text-[#1c524f] transition-colors">{question}</span>
                <span className="text-gray-400 group-hover:text-[#1c524f]">
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </span>
            </button>
            {isOpen && (
                <p className="mt-2 text-gray-600 text-sm leading-relaxed animate-in slide-in-from-top-1">
                    {answer}
                </p>
            )}
        </div>
    );
}
