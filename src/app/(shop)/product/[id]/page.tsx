import { Metadata } from 'next';
import dbConnect from '@/lib/db/connect';
import ProductModel from '@/lib/models/Product';
// These two imports are required for Mongoose to register schemas
import Category from '@/lib/models/Category';
import Fragrance from '@/lib/models/Fragrance';
import Format from '@/lib/models/Format';
//
import ProductDetails from '@/components/shop/ProductDetails';
import { Product } from '@/types/product';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
    await dbConnect();
    try {
        const product = await ProductModel.findById(id)
            .setOptions({ strictPopulate: false })
            .populate({ path: 'category', select: 'name', model: Category, strictPopulate: false })
            .populate({ path: 'fragrance', select: 'name', model: Fragrance, strictPopulate: false })
            .populate({ path: 'format', select: 'name', model: Format, strictPopulate: false })
            .populate({ path: 'variants.fragrance', select: 'name', model: Fragrance, strictPopulate: false })
            .populate({ path: 'variants.format', select: 'name', model: Format, strictPopulate: false })
            .lean();
        if (!product) return null;
        return JSON.parse(JSON.stringify(product)); // Serialize for client component
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const title = product.name;
    const description = product.description.substring(0, 160) + '...';
    const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: images.map(url => ({
                url,
                width: 800,
                height: 600,
                alt: title,
            })),
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: images,
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    // JSON-LD for Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.imageUrl,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: 'Attitude PK',
        },
        offers: {
            '@type': 'Offer',
            url: `https://attitudepk.com/product/${product._id}`, // Fallback if no specific URL
            priceCurrency: 'PKR',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetails product={product} />
        </>
    );
}
