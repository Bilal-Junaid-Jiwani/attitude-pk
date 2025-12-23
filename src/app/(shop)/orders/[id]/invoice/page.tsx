'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Printer, Loader2 } from 'lucide-react';

export default function InvoicePage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data.order);
                }
            } catch (error) {
                console.error('Failed to load order', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchOrder();
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#1c524f]" size={40} /></div>;
    if (!order) return (
        <div className="p-8 text-center">
            <p className="text-red-500 font-bold mb-2">Order not found</p>
            <p className="text-sm text-gray-500">Searched ID: {params.id}</p>
        </div>
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:bg-white print:p-0">
            {/* Toolbar - Hidden when printing */}
            <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#1c524f] text-white px-4 py-2 rounded-lg hover:bg-[#153e3c] transition-colors"
                >
                    <Printer size={18} /> Print Invoice
                </button>
            </div>

            {/* Invoice Paper */}
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Header */}
                <div className="bg-[#1c524f] text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold font-heading mb-1">ATTITUDE.PK</h2>
                            <p className="opacity-80 text-sm">Premium Fragrances & Attars</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold mb-1">INVOICE</h3>
                            <p className="text-sm opacity-80 mb-1">Order # {order._id}</p>
                            <p className="text-[10px] opacity-60">(Use this ID to track your order)</p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="p-8 grid grid-cols-2 gap-8 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h4>
                        <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{order.shippingAddress.address}</p>
                        <p className="text-gray-600 text-sm">{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                        <p className="text-gray-600 text-sm mt-1">{order.shippingAddress.phone}</p>
                    </div>
                    <div className="text-right">
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Date</h4>
                            <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</h4>
                            <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                        </div>

                        {(order.trackingId || order.courierCompany) && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tracking Details</h4>
                                {order.courierCompany && <p className="font-bold text-[#1c524f]">{order.courierCompany}</p>}
                                {order.trackingId && <p className="font-mono text-sm text-gray-600 tracking-wide">{order.trackingId}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="pb-3 pl-2">Item</th>
                                <th className="pb-3 text-center">Qty</th>
                                <th className="pb-3 text-right">Price</th>
                                <th className="pb-3 text-right pr-2">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {order.items.map((item: any, i: number) => {
                                // Determine original price (fallback to item.price if product reference is missing)
                                const productPrice = item.product_details?.price ?? item.price;
                                const isDiscounted = productPrice > item.price;

                                return (
                                    <tr key={i} className="border-b border-gray-50 last:border-0">
                                        <td className="py-4 pl-2">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            {isDiscounted && (
                                                <p className="text-xs text-green-600 font-medium mt-0.5">
                                                    Subscriber Deal
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-4 text-right">
                                            {isDiscounted ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-gray-400 line-through text-xs">Rs. {productPrice.toLocaleString()}</span>
                                                    <span className="text-gray-900 font-medium">Rs. {item.price.toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">Rs. {item.price.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right pr-2 font-medium text-gray-900">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                {/* Totals */}
                {/* Totals */}
                <div className="bg-gray-50 p-8 border-t border-gray-100 print:bg-white print:border-t-2">
                    <div className="flex flex-col gap-2 ml-auto max-w-xs">
                        {/* Calculate Savings dynamically */}
                        {(() => {
                            const stats = order.items.reduce((acc: any, item: any) => {
                                const productPrice = item.product_details?.price ?? item.price;
                                if (productPrice > item.price) {
                                    acc.subscriberSavings += (productPrice - item.price) * item.quantity;
                                }
                                return acc;
                            }, { subscriberSavings: 0 });

                            return (
                                <>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Subtotal</span>
                                        {/* Show the original subtotal (before subscriber discount) if we want to show the discount explicitly */}
                                        {/* But usually order.subtotal in DB is sum of item.price * qty. So that's the "Deal Price Subtotal". */}
                                        {/* If user wants to see "Total Savings", we can just list it. */}
                                        <span>Rs. {order.subtotal?.toLocaleString() ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Shipping</span>
                                        <span>{order.shippingCost === 0 ? 'Free' : `Rs. ${order.shippingCost.toLocaleString()}`}</span>
                                    </div>
                                    {order.tax > 0 && (
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span>Tax</span>
                                            <span>Rs. {order.tax.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {/* Coupon Discount */}
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600 text-sm">
                                            <span>
                                                Coupon Discount
                                                {order.couponCode && <span className="text-xs ml-1 font-mono bg-green-100 px-1 rounded text-green-700">({order.couponCode})</span>}
                                            </span>
                                            <span>- Rs. {order.discount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {/* Subscriber Savings (Informational or Explicit deduction?) */}
                                    {/* Since order.subtotal ALREADY reflects the lower price, we shouldn't subtract it again from the Total calculation. */}
                                    {/* But the user wants to SEE it. So we display it as "You Saved" or similar, without affecting the summing math which is already done. */}
                                    {/* OR, if the user implies the math is wrong, that's different. But usually Order.totalAmount is correct. */}
                                    {/* Let's show it as an informational line item if it's already properly accounted for in the low subtotal. */}
                                    {/* However, standard invoice practice: If Unit Price is low, then Total is low. Savings are just a label. */}

                                    {stats.subscriberSavings > 0 && (
                                        <div className="flex justify-between text-[#1c524f] text-sm font-bold mt-2 pt-2 border-t border-dashed border-gray-200">
                                            <span>Total Subscriber Savings</span>
                                            <span>Rs. {stats.subscriberSavings.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-900 font-bold text-lg border-t border-gray-200 pt-3 mt-1">
                                        <span>Total Amount</span>
                                        <span>Rs. {order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Print Footer */}
                <div className="p-8 text-center text-xs text-gray-400 print:block hidden">
                    <p>Thank you for shopping with Attitude.pk</p>
                    <p>For support, contact support@attitude.pk</p>
                </div>
            </div>
        </div>
    );
}
