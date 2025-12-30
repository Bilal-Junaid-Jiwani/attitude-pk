import React from 'react';

export default function ConditionsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#1c524f] mb-8">Conditions of Promotions</h1>

            <div className="space-y-8 text-gray-600 leading-relaxed text-sm">

                {/* Intro */}
                <p>
                    General terms and conditions for current and future promotions at ATTITUDE PK.
                </p>

                {/* Sale */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Seasonal Sales (Flash Sales, Eid, Black Friday)</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Online Only:</strong> Most offers are valid on attitudepk.vercel.app only.</li>
                        <li><strong>Validity:</strong> Valid for the duration specified in the marketing materials (e.g., email, banner).</li>
                        <li><strong>Exclusions:</strong> Cannot be combined with other discount codes, reward points, or welcome offers unless stated otherwise.</li>
                        <li><strong>Shipping:</strong> Standard shipping rates apply unless the order meets the free shipping threshold after discount.</li>
                        <li><strong>Final Sale:</strong> Discounted items of 50% or more are considered Final Sale and cannot be returned.</li>
                    </ul>
                </section>

                {/* Sign up offer */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Welcome Offer (Newsletter Sign Up)</h2>
                    <p>
                        *Get <strong>Rs. 500 OFF</strong> your first order if you sign up for our newsletter.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Minimum purchase of <strong>Rs. 3,000</strong> required.</li>
                        <li>Must use the unique promo code received by email at checkout.</li>
                        <li>One use per customer.</li>
                        <li>Cannot be combined with other sales.</li>
                    </ul>
                </section>

                {/* General */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">General Restrictions</h2>
                    <p>
                        ATTITUDE PK reserves the right to cancel any order due to unauthorized, altered, or ineligible use of an offer. We may modify or cancel any promotion due to system error or unforeseen issues without notice.
                    </p>
                </section>

            </div>
        </div>
    );
}
