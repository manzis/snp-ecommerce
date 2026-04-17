import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Skeleton for administrative tables (Orders, Categories, Brands, Sellers)
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => {
    return (
        <div className="w-full bg-white rounded-xl overflow-hidden animate-in fade-in duration-500">
            {/* Header row */}
            <div className="flex bg-zinc-50/50 px-6 py-4 border-b border-gray-100 gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="flex-1">
                        <Skeleton variant="text" width="60%" height={16} />
                    </div>
                ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex px-6 py-5 border-b border-gray-50 gap-4 items-center">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <div key={colIndex} className="flex-1">
                            {colIndex === 0 ? (
                                <div className="flex items-center gap-3">
                                    <Skeleton variant="circular" width={32} height={32} />
                                    <Skeleton variant="text" width="70%" height={14} />
                                </div>
                            ) : (
                                <Skeleton variant="text" width="80%" height={12} />
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

/**
 * Skeleton for card-based grids (Brands, Categories)
 */
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 animate-in fade-in duration-500">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                    <Skeleton variant="rectangular" width="100%" height={160} className="rounded-[24px]" />
                    <div className="px-1 flex flex-col gap-2">
                        <Skeleton variant="text" width="60%" height={16} />
                        <Skeleton variant="text" width="40%" height={12} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Skeleton for the Product Form / Detail pages
 */
export const FormSkeleton = () => {
    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header / Title area */}
            <div className="flex justify-between items-center mb-10">
                <div className="space-y-3 w-1/3">
                    <Skeleton variant="text" width="40%" height={14} />
                    <Skeleton variant="text" width="80%" height={28} />
                </div>
                <div className="flex gap-3">
                    <Skeleton variant="rectangular" width={100} height={40} className="rounded-full" />
                    <Skeleton variant="rectangular" width={140} height={40} className="rounded-full" />
                </div>
            </div>

            {/* Form Tabs / Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main section */}
                <div className="lg:col-span-8 space-y-6">
                    <Skeleton variant="rectangular" width="100%" height={400} className="rounded-2xl" />
                    <Skeleton variant="rectangular" width="100%" height={200} className="rounded-2xl" />
                </div>
                {/* Sidebar area */}
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton variant="rectangular" width="100%" height={180} className="rounded-2xl" />
                    <Skeleton variant="rectangular" width="100%" height={250} className="rounded-2xl" />
                    <Skeleton variant="rectangular" width="100%" height={150} className="rounded-2xl" />
                </div>
            </div>
        </div>
    );
};
