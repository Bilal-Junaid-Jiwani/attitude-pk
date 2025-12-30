import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://attitude-pk.vercel.app';

    // Static Routes
    const routes = [
        '',
        '/baby',
        '/kids',
        '/home',
        '/shipping',
        '/privacy',
        '/terms',
        '/conditions',
        '/faq',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Product Routes
    let productRoutes: MetadataRoute.Sitemap = [];

    try {
        await dbConnect();
        const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();

        productRoutes = products.map((product: any) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        }));
    } catch (error) {
        console.error("Sitemap Generation Error:", error);
        // Continue with static routes if DB fails
    }

    return [...routes, ...productRoutes];
}
