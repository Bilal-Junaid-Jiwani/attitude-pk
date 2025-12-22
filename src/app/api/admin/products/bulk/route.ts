import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';

export async function PUT(req: Request) {
    await dbConnect();
    try {
        const { ids, action } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No products selected' }, { status: 400 });
        }

        let update = {};

        switch (action) {
            case 'activate':
                update = { isActive: true, isArchived: false };
                break;
            case 'draft':
                update = { isActive: false, isArchived: false };
                break;
            case 'archive':
                update = { isArchived: true, isActive: false };
                break;
            case 'delete':
                // Special case for delete
                await Product.deleteMany({ _id: { $in: ids } });
                return NextResponse.json({ message: 'Products deleted successfully' });
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Apply update for non-delete actions
        await Product.updateMany(
            { _id: { $in: ids } },
            { $set: update }
        );

        return NextResponse.json({ message: `Products updated to ${action}` });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
