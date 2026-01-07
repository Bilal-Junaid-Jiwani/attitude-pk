import React from 'react';
import Skeleton from './Skeleton';

const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
            {/* Image Placeholder */}
            <div className="aspect-square relative bg-gray-50 p-4">
                <Skeleton className="w-full h-full rounded-md" />
            </div>

            {/* Content Placeholder */}
            <div className="p-4 flex flex-col gap-2 flex-grow">
                <Skeleton className="h-3 w-1/3 rounded-full" />
                <Skeleton className="h-5 w-3/4 rounded-md" />

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <Skeleton className="h-6 w-1/4 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
