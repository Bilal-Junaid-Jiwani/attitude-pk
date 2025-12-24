import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db/connect';
import ProductModel from '@/lib/models/Product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://attitudepk.com';

    // Static Routes
    const routes = [
        '',
        '/contact',
        '/track-order', // Add other static routes here
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        await dbConnect();
        const products = await ProductModel.find({ isActive: true }).select('_id updatedAt').lean();

        productRoutes = products.map((product: any) => ({
            url: `${baseUrl}/product/${product._id}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));
    } catch (error) {
        console.error('Sitemap generation failed to fetch products:', error);
    }

    return [...routes, ...productRoutes];
}
