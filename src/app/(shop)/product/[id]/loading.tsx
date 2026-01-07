import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-white pb-20 pt-10 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    <Skeleton className="h-4 w-12" />
                    <span className="text-gray-300">/</span>
                    <Skeleton className="h-4 w-24" />
                    <span className="text-gray-300">/</span>
                    <Skeleton className="h-4 w-48" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* LEFT COLUMN: Gallery Skeleton */}
                    <div className="lg:col-span-7">
                        <div className="flex flex-col md:flex-row gap-4 sticky top-24">
                            {/* Thumbnails */}
                            <div className="hidden md:flex flex-col gap-4 w-20">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="w-20 h-24 rounded-md" />
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1 relative">
                                <div className="w-full aspect-square md:aspect-[4/5] lg:aspect-square rounded-lg overflow-hidden bg-gray-100 animate-pulse relative">
                                    {/* Center Icon placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-200">
                                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Info Skeleton */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            {/* Title */}
                            <Skeleton className="h-10 w-3/4 mb-4" />
                            {/* Price */}
                            <Skeleton className="h-8 w-1/3 mb-4" />
                            {/* Reviews */}
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="w-4 h-4 rounded-full" />
                                    ))}
                                </div>
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Selectors */}
                        <div className="space-y-4">
                            <Skeleton className="h-5 w-20" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-24 rounded-md" />
                                <Skeleton className="h-10 w-24 rounded-md" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-12 w-full rounded-md" />
                        </div>

                        {/* Purchase Options Box */}
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-4">
                            <Skeleton className="h-12 w-full rounded" />
                            <Skeleton className="h-12 w-full rounded" />
                        </div>

                        {/* Add to Cart */}
                        <div className="flex gap-4">
                            <Skeleton className="w-32 h-12 rounded-md" />
                            <Skeleton className="flex-1 h-12 rounded-md" />
                        </div>

                        {/* Accordions */}
                        <div className="space-y-4 pt-4">
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                            <Skeleton className="h-14 w-full rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
