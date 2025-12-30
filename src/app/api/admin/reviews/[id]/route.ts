
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Review from '@/lib/models/Review';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
