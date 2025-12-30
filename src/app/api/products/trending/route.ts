
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import Review from '@/lib/models/Review';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '8');
        const skip = (page - 1) * limit;

        // Start aggregation from Product to include ALL products, even those with 0 reviews
        const result = await Product.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { isArchived: false },
                        { isArchived: { $exists: false } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    reviewCount: { $size: '$reviews' },
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: '$reviews' }, 0] },
                            then: { $avg: '$reviews.rating' },
                            else: 0
                        }
                    }
                }
            },
            // Sort by reviewCount DESC, then _id ASC for stability
            { $sort: { reviewCount: -1, _id: 1 } },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                price: 1,
                                compareAtPrice: 1,
                                imageUrl: 1,
                                images: 1,
                                slug: 1,
                                category: 1,
                                subCategory: 1,
                                stock: 1,
                                reviewCount: 1,
                                averageRating: 1
                            }
                        }
                    ]
                }
            }
        ]);

        if (!result || result.length === 0) {
            return NextResponse.json({ products: [], total: 0, hasMore: false, page });
        }

        const products = result[0].data;
        const total = result[0].metadata.length > 0 ? result[0].metadata[0].total : 0;
        const hasMore = skip + products.length < total;

        return NextResponse.json({ products, total, hasMore, page });
    } catch (error) {
        console.error('Error fetching trending products:', error);
        return NextResponse.json({ error: 'Failed to fetch trending products' }, { status: 500 });
    }
}
