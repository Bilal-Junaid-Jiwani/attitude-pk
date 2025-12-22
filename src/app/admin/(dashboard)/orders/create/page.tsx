'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, X, Plus, CreditCard, Mail,
    ChevronDown, User as UserIcon, MapPin, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    sku?: string;
}

interface LineItem {
    product: Product;
    quantity: number;
    price: number;
}

export default function CreateOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    // Order State
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: 'Pakistan'
    });

    // Totals
    const [discount, setDiscount] = useState(0);
    const [shipping, setShipping] = useState(0);
    const [tax, setTax] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showCustomerSearch, setShowCustomerSearch] = useState<any[]>([]);

    // Coupon State
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [showCouponList, setShowCouponList] = useState(false);

    // Fetch products and settings
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, settingsRes] = await Promise.all([
                    fetch('/api/admin/products'),
                    fetch('/api/admin/settings')
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data);
                }

                if (settingsRes.ok) {
                    const settings = await settingsRes.json();
                    if (settings.shippingCost) setShipping(settings.shippingCost);
                    if (settings.coupons) setAvailableCoupons(settings.coupons);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    const subtotal = lineItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleApplyCoupon = () => {
        const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase() && c.isActive);

        if (!coupon) {
            toast.error('Invalid or inactive coupon');
            setAppliedCoupon(null);
            setCouponDiscount(0);
            return;
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);

        setCouponDiscount(discountAmount);
        setAppliedCoupon(coupon.code);
        toast.success(`Coupon ${coupon.code} applied!`);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addProductToOrder = (product: Product) => {
        setLineItems(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                return prev.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1, price: product.price }];
        });
        setShowProductSearch(false);
        setSearchQuery('');
    };

    const removeLineItem = (productId: string) => {
        setLineItems(prev => prev.filter(item => item.product._id !== productId));
    };

    const updateQuantity = (productId: string, newQty: number) => {
        if (newQty < 1) return;
        setLineItems(prev => prev.map(item =>
            item.product._id === productId ? { ...item, quantity: newQty } : item
        ));
    };

    const total = subtotal + shipping + tax - discount - couponDiscount;

    const handleCreateOrder = async () => {
        console.log('handleCreateOrder IS CALLED');
        console.log('Customer State:', customer);
        console.log('Line Items:', lineItems);

        if (lineItems.length === 0) {
            console.log('Validation Failed: No items');
            toast.error('Please add at least one product');
            return;
        }
        if (!customer.firstName || !customer.email) {
            console.log('Validation Failed: Missing Name/Email');
            toast.error('Customer name and email are required');
            return;
        }
        if (!customer.address || !customer.city || !customer.phone) {
            console.log('Validation Failed: Missing Address/City/Phone');
            toast.error('Address, City, and Phone are required for shipping');
            return;
        }

        setLoading(true);
        try {
            console.log('Sending request...');
            const orderData = {
                user: selectedCustomerId, // Link the order to the selected customer
                items: lineItems.map(item => ({
                    product_id: item.product._id,
                    name: item.product.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.product.imageUrl,
                    subCategory: 'General' // Default for now
                })),
                shippingAddress: {
                    fullName: `${customer.firstName} ${customer.lastName}`.trim(),
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address,
                    city: customer.city,
                    postalCode: customer.zip,
                },
                totalAmount: total,
                subtotal: subtotal,
                shippingCost: shipping,
                tax: tax,
                discount: discount + couponDiscount,
                couponCode: appliedCoupon || undefined,
                paymentMethod: paymentMethod,
                isPaid: paymentStatus === 'Paid',
                status: 'Pending'
            };

            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                toast.success('Order created successfully');
                router.push('/admin/orders');
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create order');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-[#F6F6F7] min-h-screen text-[#303030]">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-200 rounded-full border border-gray-300 bg-white">
                    <X size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Create order</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Product Search & List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-900">Order details</h2>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowProductSearch(true);
                                }}
                                onFocus={() => setShowProductSearch(true)}
                            />
                            {showProductSearch && searchQuery && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {filteredProducts.map(product => (
                                        <div
                                            key={product._id}
                                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0"
                                            onClick={() => addProductToOrder(product)}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative">
                                                {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500">Rs. {product.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="p-3 text-sm text-gray-500 text-center">No products found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Line Items */}
                        <div className="space-y-4">
                            {lineItems.map(item => (
                                <div key={item.product._id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 group">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 relative overflow-hidden">
                                            {item.product.imageUrl && <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#1c524f] hover:underline">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">SKU: {item.product.sku || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className="text-sm text-gray-900">Rs. {item.price}</p>
                                        <div className="flex items-center border border-gray-300 rounded">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                                                className="w-12 text-center text-sm p-1 outline-none"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 w-20 text-right">Rs. {item.price * item.quantity}</p>
                                        <button onClick={() => removeLineItem(item.product._id)} className="text-gray-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lineItems.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    Browse products to add items
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment & Totals */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="space-y-3 text-sm">
                            {/* Manual Discount */}
                            <div className="flex justify-between items-center text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span>Discount</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                        value={discount === 0 ? '' : discount}
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <span>- Rs. {discount}</span>
                            </div>

                            {/* Coupon Section */}
                            {!appliedCoupon ? (
                                <div className="relative">
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="Enter or select coupon"
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm uppercase pr-8"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                onFocus={() => setShowCouponList(true)}
                                            />
                                            <button
                                                onClick={() => setShowCouponList(!showCouponList)}
                                                className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200"
                                        >
                                            Apply
                                        </button>
                                    </div>

                                    {/* Custom Dropdown List */}
                                    {showCouponList && availableCoupons.length > 0 && (
                                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                                            {availableCoupons.filter(c => c.isActive).map(c => (
                                                <div
                                                    key={c._id}
                                                    className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center"
                                                    onClick={() => {
                                                        setCouponCode(c.code);
                                                        setShowCouponList(false);
                                                    }}
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{c.code}</p>
                                                        <p className="text-xs text-gray-500">{c.description || 'No description'}</p>
                                                    </div>
                                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue} OFF`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-green-600 bg-green-50 px-2 py-1.5 rounded border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} />
                                        <span className="text-sm font-medium">Coupon ({appliedCoupon})</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">- Rs. {couponDiscount}</span>
                                        <button
                                            onClick={() => {
                                                setAppliedCoupon(null);
                                                setCouponDiscount(0);
                                                setCouponCode('');
                                            }}
                                            className="text-green-700 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-gray-600">
                                <span>Subtotal</span>
                                <span>Rs. {subtotal}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span>Shipping</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                        value={shipping === 0 ? '' : shipping}
                                        onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <span>Rs. {shipping}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span>Tax</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-right outline-none focus:border-blue-500"
                                        value={tax === 0 ? '' : tax}
                                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <span>Rs. {tax}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>Rs. {total}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="COD">Cash on Delivery (COD)</option>
                                    <option value="Online Payment">Online Payment</option>
                                </select>
                            </div>

                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment Status</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPaymentStatus('Paid')}
                                    className={`px-3 py-2 text-sm font-medium border rounded shadow-sm ${paymentStatus === 'Paid' ? 'bg-[#1c524f] text-white border-[#1c524f]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Mark as paid
                                </button>
                                <button
                                    onClick={() => setPaymentStatus('Pending')}
                                    className={`px-3 py-2 text-sm font-medium border rounded shadow-sm ${paymentStatus === 'Pending' ? 'bg-[#1c524f] text-white border-[#1c524f]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Mark as pending
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
                        <input type="text" placeholder="Add a note..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                </div>

                {/* Right Column: Customer Details */}
                <div className="space-y-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-900">Customer</h2>
                            <X size={16} className="text-gray-400 cursor-pointer" />
                        </div>

                        <div className="space-y-3 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search or create customer"
                                    className="w-full pl-9 border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    onChange={(e) => {
                                        const query = e.target.value;
                                        // Simple debounce could be added here
                                        if (query.length > 1) {
                                            fetch(`/api/admin/customers?search=${query}`)
                                                .then(res => res.json())
                                                .then(data => setShowCustomerSearch(data));
                                        } else {
                                            setShowCustomerSearch([]);
                                        }
                                    }}
                                />
                                {showCustomerSearch.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                                        {showCustomerSearch.map((c: any) => (
                                            <div
                                                key={c._id}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                                                onClick={() => {
                                                    const nameParts = c.name.split(' ');
                                                    setCustomer({
                                                        firstName: nameParts[0] || '',
                                                        lastName: nameParts.slice(1).join(' ') || '',
                                                        email: c.email || '',
                                                        phone: c.phone || '',
                                                        address: c.address || '',
                                                        city: '', // User model doesn't seem to store city explicitly in top level? Let's leave empty or try to parse
                                                        zip: c.postcode || '',
                                                        country: 'Pakistan'
                                                    });
                                                    setSelectedCustomerId(c._id); // Track selected customer
                                                    setShowCustomerSearch([]);
                                                }}
                                            >
                                                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                                                <p className="text-xs text-gray-500">{c.email}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Manual Entry Fallback for now */}
                            <div className="bg-gray-50 p-3 rounded text-sm space-y-2 border border-gray-200">
                                <div className="flex gap-2">
                                    <input placeholder="First Name" className="w-1/2 p-1.5 border rounded" value={customer.firstName} onChange={e => setCustomer({ ...customer, firstName: e.target.value })} />
                                    <input placeholder="Last Name" className="w-1/2 p-1.5 border rounded" value={customer.lastName} onChange={e => setCustomer({ ...customer, lastName: e.target.value })} />
                                </div>
                                <input placeholder="Email" className="w-full p-1.5 border rounded" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                                <input placeholder="Phone" className="w-full p-1.5 border rounded" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                            </div>

                            <div className="pt-2 border-t border-gray-200">
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                                    <span>SHIPPING ADDRESS</span>
                                    <span className="text-blue-600 cursor-pointer">Edit</span>
                                </div>
                                <div className="space-y-2">
                                    <input placeholder="Address" className="w-full p-1.5 border rounded text-sm" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input placeholder="City" className="w-1/2 p-1.5 border rounded text-sm" value={customer.city} onChange={e => setCustomer({ ...customer, city: e.target.value })} />
                                        <input placeholder="ZIP" className="w-1/2 p-1.5 border rounded text-sm" value={customer.zip} onChange={e => setCustomer({ ...customer, zip: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold text-gray-900">Tags</h2>
                            <span className="text-blue-600 text-xs font-medium cursor-pointer">View all tags</span>
                        </div>
                        <input type="text" placeholder="Urgent, reviewed, wholesale" className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3 pb-6">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Discard
                </button>
                <button
                    onClick={handleCreateOrder}
                    disabled={loading}
                    className="px-4 py-2 bg-[#1c524f] text-white rounded text-sm font-medium shadow hover:bg-[#143d3b] disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create order'}
                </button>
            </div>
        </div>
    );
}
