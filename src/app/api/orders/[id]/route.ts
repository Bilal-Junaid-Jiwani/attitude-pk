import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const log = console.log;

    try {
        log('--- API Call Started ---');
        await dbConnect();

        // 1. Get Params
        const { id } = await params;
        log(`Raw Param ID: ${id}`);

        // Remove ANY non-hex characters
        const cleanId = id?.replace(/[^0-9a-fA-F]/g, '');

        if (!cleanId || cleanId.length !== 24) {
            log('Invalid ID Format');
            return NextResponse.json({ message: 'Invalid ID Format' }, { status: 400 });
        }

        // 3. Fetch Order
        const order = await Order.findById(cleanId).lean();

        if (!order) {
            log('Order Not Found');
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // 4. Manually populate product details
        const itemsWithProductDetails = await Promise.all(order.items.map(async (item: any) => {
            try {
                let pId = item.product_id;
                if (typeof pId === 'string' && pId.endsWith('-sub')) {
                    pId = pId.replace('-sub', '');
                }

                const product = await Product.findById(pId).select('price compareAtPrice name');

                return {
                    ...item,
                    product_details: product ? {
                        price: product.price,
                        compareAtPrice: product.compareAtPrice,
                        name: product.name
                    } : null
                };
            } catch (err) {
                console.error(`Error looking up product ${item.product_id}:`, err);
                return item;
            }
        }));

        order.items = itemsWithProductDetails;

        log('Sending Response');
        return NextResponse.json({ order });

    } catch (error) {
        console.error('Fetch order error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
    }
}
