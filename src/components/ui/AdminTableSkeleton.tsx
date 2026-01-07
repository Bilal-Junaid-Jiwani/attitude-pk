import React from 'react';

export default function AdminTableSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="h-6 w-32 bg-gray-100 rounded animate-pulse"></div>
                <div className="flex gap-2">
                    <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="p-0">
                <div className="w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>

                    {/* Rows */}
                    {[1, 2, 3, 4, 5].map((row) => (
                        <div key={row} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-50 items-center">
                            <div className="flex items-center gap-3 col-span-2">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                                    <div className="h-3 w-20 bg-gray-50 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-4 w-20 bg-gray-50 rounded animate-pulse"></div>
                            <div className="h-4 w-16 bg-gray-50 rounded animate-pulse"></div>
                            <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                            <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse ml-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
