import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import BusinessExpense from '@/lib/models/BusinessExpense';

// GET: Fetch expenses for a month or all
export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');

        let query = {};
        if (month) {
            query = { month };
        }

        const expenses = await BusinessExpense.find(query).sort({ month: -1 }).lean();
        return NextResponse.json(expenses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create or Update expense for a month (upsert)
export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();

        if (!body.month) {
            return NextResponse.json({ error: 'Month is required (YYYY-MM format)' }, { status: 400 });
        }

        // Upsert: Update if exists, create if not
        const expense = await BusinessExpense.findOneAndUpdate(
            { month: body.month },
            {
                $set: {
                    advertising: body.advertising || 0,
                    packaging: body.packaging || 0,
                    returnShipping: body.returnShipping || 0,
                    staffSalary: body.staffSalary || 0,
                    rent: body.rent || 0,
                    utilities: body.utilities || 0,
                    other: body.other || 0,
                    packagingPerOrder: body.packagingPerOrder || 0,
                    shippingPerOrder: body.shippingPerOrder || 0,
                    notes: body.notes || ''
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(expense);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete expense for a month
export async function DELETE(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');

        if (!month) {
            return NextResponse.json({ error: 'Month is required' }, { status: 400 });
        }

        await BusinessExpense.deleteOne({ month });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
