import React from 'react';

export default function ShippingPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-[#1c524f] mb-8">Shipping & Refund Policy</h1>

            <div className="space-y-8 text-gray-600 leading-relaxed">

                {/* Intro */}
                <section>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="font-medium text-blue-700">
                            ℹ Please note: Due to high order volume, processing and delivery times may be slightly longer than usual. We appreciate your patience.
                        </p>
                    </div>
                    <p>
                        ATTITUDE PK uses its best commercial efforts to deliver items as quickly as possible. All items are delivered by third-party courier services (TCS, Leopards, Call Courier), and delivery is governed by their shipping contracts and is beyond our control.
                    </p>
                </section>

                {/* Delivery Locations */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Locations</h2>
                    <p>
                        Items offered on our site are shipped nationwide across **Pakistan**.
                        All orders are shipped from our distribution center located in **Karachi**.
                    </p>
                    <p className="mt-2">
                        Please make sure that the recipient's address is correct and complete (including House #, Street, City). We are not responsible for orders that cannot be delivered due to incorrect addresses.
                    </p>
                </section>

                {/* Delivery Time */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Time</h2>
                    <p>
                        Your order will be processed and shipped within **1-3 business days** of the order date. Orders are processed Monday through Saturday (excluding holidays).
                    </p>
                    <p className="mt-2">
                        **Standard Delivery Times:**
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Karachi: 2-3 Business Days</li>
                        <li>Other Cities: 3-5 Business Days</li>
                        <li>Remote Areas: 5-7 Business Days</li>
                    </ul>
                    <p className="mt-4">
                        During major events like 11.11, Black Friday, or Eid sales, delivery may take slightly longer due to volume.
                    </p>
                </section>

                {/* Shipping Rates */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Charges</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Standard Shipping:</strong> Rs. 250 flat rate nationwide.</li>
                        <li><strong>Free Shipping:</strong> On all orders above **Rs. 5,000**.</li>
                    </ul>
                </section>

                {/* Packaging */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Eco-Friendly Packaging</h2>
                    <p>
                        The box your products have been packaged in is made from recycled material. We strive to minimize plastic usage to keep Pakistan clean and green!
                    </p>
                </section>

                {/* Refund Policy */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Refund or Exchange</h2>
                    <p>
                        Products purchased on our website are firm sales. For hygiene and safety reasons (especially for personal care products), we **do not accept returns or exchanges** for change of mind.
                    </p>
                    <p className="mt-2">
                        However, if your product is **defective, damaged, or leaked** upon arrival, we will gladly assist you.
                    </p>
                </section>

                {/* Damages */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Damages and Issues</h2>
                    <p>
                        Please inspect your order upon reception. If you receive a wrong, damaged, or defective item, contact us immediately (within 48 hours) so we can make it right.
                    </p>
                    <p className="mt-2">
                        <strong>Mandatory:</strong> Photos/Videos of the damaged box and product are required to process your claim. Please message us on WhatsApp or Email with your Order # and Proof.
                    </p>
                    <p className="mt-2">
                        <strong>Contact:</strong> attitudelivingpk@gmail.com
                    </p>
                </section>

            </div>
        </div>
    );
}
