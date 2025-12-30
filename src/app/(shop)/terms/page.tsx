import React from 'react';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#1c524f] mb-8">Terms and Conditions</h1>

            <div className="space-y-8 text-gray-600 leading-relaxed text-sm">

                {/* Intro */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Overview</h2>
                    <p>
                        Welcome to attitudepk.vercel.app (the "Site"), owned and operated by ATTITUDE PK.
                        By accessing and using this Site, you confirm your acceptance of these Terms of Use and your undertaking to comply with them.
                    </p>
                </section>

                {/* Terms of Sale */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Terms of Sale</h2>
                    <p>
                        All sales made from this Site are governed by these Terms. By ordering and/or accepting delivery of the products purchased on our online store, you agree to these Terms.
                    </p>
                    <p className="mt-2">
                        <strong>Prices:</strong> All prices listed are in <strong>Pakistani Rupees (PKR)</strong>. Prices are subject to change without notice.
                    </p>
                    <p className="mt-2">
                        <strong>Availability:</strong> We reserve the right to limit the quantities of any products that we offer. All descriptions of products or product pricing are subject to change at any time without notice.
                    </p>
                </section>

                {/* Accuracy */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Color & Accuracy</h2>
                    <p>
                        We have made every effort to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate.
                    </p>
                </section>

                {/* User Accounts */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Your Account</h2>
                    <p>
                        You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and phone number, so that we can complete your transactions and contact you as needed.
                    </p>
                </section>

                {/* Third Party Links */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Third-Party Links</h2>
                    <p>
                        Certain content, products, and services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy.
                    </p>
                </section>

                {/* Governing Law */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Governing Law</h2>
                    <p>
                        These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of <strong>Pakistan</strong>. Any disputes shall be subject to the exclusive jurisdiction of the courts of Karachi.
                    </p>
                </section>

                {/* Changes */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Changes to Terms of Service</h2>
                    <p>
                        You can review the most current version of the Terms of Service at any time on this page. We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website.
                    </p>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Contact Information</h2>
                    <p>
                        Questions about the Terms of Service should be sent to us at <strong>attitudelivingpk@gmail.com</strong>.
                    </p>
                </section>

            </div>
        </div>
    );
}
