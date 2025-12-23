
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';

import fs from 'fs';
import path from 'path';

import Product from '@/lib/models/Product';
// import fs ... (keep existing imports)

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Expecting 'params' to be a Promise in newer Next.js versions
) {
    const logPath = path.join(process.cwd(), 'debug_invoice.log');
    const log = (msg: string) => fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`);

    try {
        log('--- API Call Started ---');
        await dbConnect();
        log('DB Connected');

        // 1. Get Params
        const { id } = await params;
        log(`Raw Param ID: ${id}`);

        // Remove ANY non-hex characters (newlines, spaces, hidden unicode)
        const cleanId = id?.replace(/[^0-9a-fA-F]/g, '');
        log(`Cleaned ID: ${cleanId}`);

        if (!cleanId || cleanId.length !== 24) {
            log('Invalid ID Format');
            return NextResponse.json({ message: 'Invalid ID Format' }, { status: 400 });
        }

        // 3. Fetch Order
        const order = await Order.findById(cleanId).lean(); // Use lean() for easier modification
        log(`Order Found: ${order ? 'YES' : 'NO'}`);

        if (!order) {
            log('Returning 404');
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // 4. Manually populate product details
        // We use static import now to avoid runtime import issues
        log('Starting Product Lookup...');

        const itemsWithProductDetails = await Promise.all(order.items.map(async (item: any) => {
            try {
                // Ensure product_id is treated as string for logic, but passed correctly to mongoose
                let pId = item.product_id;

                // Handle "Subscribe & Save" suffix if present (e.g., "-sub")
                if (typeof pId === 'string' && pId.endsWith('-sub')) {
                    pId = pId.replace('-sub', '');
                    log(`Stripped identifier suffix: ${pId}`);
                }

                log(`Looking up Product ID: ${pId}`);

                const product = await Product.findById(pId).select('price compareAtPrice name');
                log(`Product Found: ${product ? 'YES' : 'NO'}`);

                return {
                    ...item,
                    product_details: product ? {
                        price: product.price,
                        compareAtPrice: product.compareAtPrice,
                        name: product.name
                    } : null
                };
            } catch (err) {
                log(`Error looking up product ${item.product_id}: ${err}`);
                return item; // Fallback to original item without details
            }
        }));

        log('Product Lookup Complete');

        // Replace items with enriched items
        order.items = itemsWithProductDetails;

        log('Sending Response');
        return NextResponse.json({ order });

    } catch (error) {
        log(`CRITICAL ERROR: ${error}`);
        console.error('Fetch order error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
    }
}
