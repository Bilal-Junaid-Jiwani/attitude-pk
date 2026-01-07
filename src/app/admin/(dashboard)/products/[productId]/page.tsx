'use client';

import { useState, useEffect, use } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import Skeleton from '@/components/ui/Skeleton';
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded" />
                        <Skeleton className="h-10 w-24 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-10 w-full rounded" />
                            <Skeleton className="h-32 w-full rounded" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="grid grid-cols-3 gap-4">
                                <Skeleton className="h-10 w-full rounded" />
                                <Skeleton className="h-10 w-full rounded" />
                                <Skeleton className="h-10 w-full rounded" />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="space-y-4">
                                <Skeleton className="h-20 w-full rounded" />
                                <Skeleton className="h-20 w-full rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-10 w-full rounded" />
                            <Skeleton className="h-10 w-full rounded" />
                            <Skeleton className="h-10 w-full rounded" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="grid grid-cols-2 gap-2">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    if (!product) return <div>Product not found</div>;

    return <ProductForm initialData={product} isEdit={true} />;
}
