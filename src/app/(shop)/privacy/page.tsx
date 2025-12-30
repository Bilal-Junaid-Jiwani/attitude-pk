import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#1c524f] mb-8">Privacy Policy</h1>

            <div className="space-y-8 text-gray-600 leading-relaxed text-sm">

                <p>
                    Your privacy is very important to ATTITUDE PK ("we", "us") and our clients' trust remains our priority.
                    This privacy policy has been prepared to assert our commitment to protect the confidentiality of information we hold about our clients.
                </p>

                {/* Section 1 */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Section 1 - Collecting Personal Information</h2>
                    <p>
                        We may collect and process different types of personal information in the course of operating our business, including:
                        Surname, first name, billing address, shipping address, e-mail address, telephone number, and payment information.
                        You may be asked to provide provided this information when you make a purchase, create an account, or participate in a contest.
                    </p>
                </section>

                {/* Section 2 */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Section 2 - Use of Personal Information</h2>
                    <p>We use collected information for:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Order Management:</strong> To process and track your orders and ensure delivery.</li>
                        <li><strong>Client Services:</strong> To answer your questions and assist with returns/exchanges.</li>
                        <li><strong>Marketing:</strong> To provide personalized offers and newsletters (with your consent).</li>
                        <li><strong>Site Operation:</strong> To facilitate navigation and maintain your shopping session.</li>
                    </ul>
                </section>

                {/* Section 3 */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Section 3 - Sharing of Personal Information</h2>
                    <p>
                        ATTITUDE PK does not sell your personal information. We may share it with trusted third-party service providers necessary for operations, such as:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Logistics:</strong> Courier services (TCS, Leopards) to deliver your package.</li>
                        <li><strong>Payments:</strong> Payment gateways for secure processing.</li>
                        <li><strong>Technology:</strong> Hosting and IT service providers.</li>
                    </ul>
                </section>

                {/* Section 4 */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Section 4 - Security</h2>
                    <p>
                        We maintain appropriate safeguards to protect your personal information. Credit card transactions comply with industry best practices.
                        However, no transmission over the internet is 100% secure, so please protect your account password.
                    </p>
                </section>

                {/* Age */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Section 5 - Age of Consent</h2>
                    <p>
                        By using this Site, you represent that you are at least the age of majority in your region of residence. We do not knowingly collect information from minors.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Questions and Contact Information</h2>
                    <p>
                        If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact us at:
                    </p>
                    <p className="mt-2 font-medium">attitudelivingpk@gmail.com</p>
                    <p className="mt-1">
                        <strong>Head Office:</strong><br />
                        D-22/1, Block-17, Gulshan-e-Iqbal,<br />
                        Karachi-75300, Pakistan
                    </p>
                </section>

            </div>
        </div>
    );
}
