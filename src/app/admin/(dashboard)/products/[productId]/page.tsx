'use client';

import { useState, useEffect, use } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import CoolLoader from '@/components/ui/CoolLoader';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/admin/products/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                } else {
                    addToast('Product not found', 'error');
                    router.push('/admin/products');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                addToast('Error loading product', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, addToast, router]);

    if (loading) return <CoolLoader />;
    if (!product) return <div>Product not found</div>;

    return <ProductForm initialData={product} isEdit={true} />;
}
