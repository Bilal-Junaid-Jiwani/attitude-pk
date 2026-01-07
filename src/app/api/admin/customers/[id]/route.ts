import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;

        let customer;
        let orders;

        if (id.startsWith('guest_')) {
            // Handle Guest Customer
            const guestEmail = id.replace('guest_', '');

            // Fetch all orders for this guest
            orders = await Order.find({ 'shippingAddress.email': guestEmail }).sort({ createdAt: -1 });

            if (!orders || orders.length === 0) {
                return NextResponse.json({ error: 'Guest customer not found' }, { status: 404 });
            }

            // Construct mock customer object from latest order info
            const latestOrder = orders[0];
            customer = {
                _id: id,
                name: latestOrder.shippingAddress.fullName,
                email: latestOrder.shippingAddress.email,
                phone: latestOrder.shippingAddress.phone,
                address: latestOrder.shippingAddress.address,
                city: latestOrder.shippingAddress.city,
                postcode: latestOrder.shippingAddress.postalCode,
                createdAt: orders[orders.length - 1].createdAt, // First order creation
                type: 'Guest'
            };

        } else {
            // Handle Registered User
            customer = await User.findById(id).select('-password');
            if (!customer) {
                return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
            }
            orders = await Order.find({ user: id }).sort({ createdAt: -1 });
        }

        // Fetch active coupons
        const activeCoupons = await import('@/lib/models/Coupon').then(m => m.default.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        }).select('code discountValue discountType'));

        return NextResponse.json({
            customer,
            orders,
            activeCoupons
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;

        if (id.startsWith('guest_')) {
            return NextResponse.json({ error: 'Cannot delete guest customers directly. Delete their orders instead.' }, { status: 400 });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Optional: Unlink orders?
        // await Order.updateMany({ user: id }, { $set: { user: null } });

        return NextResponse.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
