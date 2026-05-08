import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Skeleton for the Admin Orders Table
 */
export const OrderTableSkeleton = ({ rows = 8 }: { rows?: number }) => {
    return (
        <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            <div className="flex bg-[#fafafa] px-6 py-4 border-b border-gray-100 gap-4">
                <div className="w-[40px] flex justify-center"><Skeleton variant="rectangular" width={18} height={18} className="rounded" /></div>
                <div className="w-[140px]"><Skeleton variant="text" width="60%" height={14} /></div>
                <div className="w-[170px]"><Skeleton variant="text" width="60%" height={14} /></div>
                <div className="flex-1"><Skeleton variant="text" width="40%" height={14} /></div>
                <div className="w-[100px]"><Skeleton variant="text" width="60%" height={14} /></div>
                <div className="w-[100px] text-right"><Skeleton variant="text" width="60%" height={14} className="ml-auto" /></div>
                <div className="w-[80px] text-center"><Skeleton variant="text" width="40%" height={14} className="mx-auto" /></div>
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex px-6 py-5 border-b border-gray-50 gap-4 items-center">
                    <div className="w-[40px] flex justify-center"><Skeleton variant="rectangular" width={18} height={18} className="rounded" /></div>
                    <div className="w-[140px] flex flex-col gap-2">
                        <Skeleton variant="text" width="80%" height={14} />
                        <Skeleton variant="text" width="60%" height={12} />
                    </div>
                    <div className="w-[170px] flex flex-col gap-2">
                        <Skeleton variant="text" width="90%" height={14} />
                        <Skeleton variant="text" width="70%" height={12} />
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                        <Skeleton variant="rectangular" width={52} height={52} className="rounded-lg" />
                        <div className="flex-1 flex flex-col gap-2">
                            <Skeleton variant="text" width="70%" height={14} />
                            <div className="flex gap-3">
                                <Skeleton variant="text" width={40} height={10} />
                                <Skeleton variant="text" width={40} height={10} />
                            </div>
                        </div>
                    </div>
                    <div className="w-[100px]">
                        <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
                    </div>
                    <div className="w-[100px] flex flex-col items-end gap-2">
                        <Skeleton variant="text" width="70%" height={16} />
                        <Skeleton variant="rectangular" width={40} height={6} className="rounded-full" />
                    </div>
                    <div className="w-[80px] flex justify-center">
                        <Skeleton variant="circular" width={32} height={32} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Skeleton for Admin Orders Grid
 */
export const OrderGridSkeleton = ({ count = 8 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex px-[14px] py-[12px] justify-between items-center bg-gray-50/50 border-b border-gray-100">
                        <div className="flex gap-2 items-center">
                            <Skeleton variant="text" width={40} height={12} />
                            <Skeleton variant="text" width={60} height={14} />
                        </div>
                        <Skeleton variant="circular" width={24} height={24} />
                    </div>
                    
                    {/* Body */}
                    <div className="flex p-[14px] flex-col gap-[16px]">
                        {/* ID row */}
                        <div className="flex justify-between items-center">
                            <Skeleton variant="text" width={80} height={12} />
                            <Skeleton variant="text" width={40} height={10} />
                        </div>

                        {/* Product Info */}
                        <div className="flex gap-[12px] items-stretch">
                            <Skeleton variant="rectangular" width={88} height={88} className="rounded-lg" />
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div className="space-y-2">
                                    <Skeleton variant="text" width="40%" height={10} />
                                    <Skeleton variant="text" width="90%" height={14} />
                                    <div className="flex gap-2">
                                        <Skeleton variant="rectangular" width={30} height={14} className="rounded" />
                                        <Skeleton variant="text" width={60} height={12} />
                                    </div>
                                </div>
                                <Skeleton variant="text" width="50%" height={18} />
                            </div>
                        </div>

                        {/* Bottom Table */}
                        <div className="flex h-[83px] border border-gray-100 rounded-lg overflow-hidden bg-white">
                            <div className="w-[68px] p-3 border-r border-gray-100 flex flex-col gap-1.5">
                                <Skeleton variant="text" width="60%" height={10} />
                                <Skeleton variant="text" width="100%" height={14} />
                            </div>
                            <div className="flex-1 p-3 border-r border-gray-100 flex flex-col gap-1.5">
                                <Skeleton variant="text" width="40%" height={10} />
                                <Skeleton variant="text" width="90%" height={14} />
                                <Skeleton variant="text" width="70%" height={12} />
                            </div>
                            <div className="w-[95px] p-3 flex flex-col gap-1.5 bg-gray-50/30">
                                <Skeleton variant="text" width="60%" height={10} />
                                <Skeleton variant="text" width="100%" height={16} />
                                <Skeleton variant="text" width="50%" height={10} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Skeleton for Admin Products Grid
 */
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col p-3 bg-white rounded-xl border border-gray-100 gap-3">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3 items-stretch">
                            <Skeleton variant="rectangular" width={104} height={104} className="rounded-lg" />
                            <div className="flex-1 flex flex-col justify-center gap-2 pr-8">
                                <div className="flex gap-2">
                                    <Skeleton variant="rectangular" width={40} height={18} className="rounded-full" />
                                    <Skeleton variant="rectangular" width={60} height={18} className="rounded-full" />
                                </div>
                                <Skeleton variant="text" width="40%" height={10} />
                                <Skeleton variant="text" width="100%" height={14} />
                                <Skeleton variant="text" width="100%" height={14} />
                                <div className="flex gap-2">
                                    <Skeleton variant="text" width={40} height={14} />
                                    <Skeleton variant="text" width={60} height={16} />
                                </div>
                            </div>
                        </div>
                        <div className="flex h-[83px] border border-gray-100 rounded-lg overflow-hidden bg-white">
                            <div className="w-[70px] p-2.5 border-r border-gray-100 flex flex-col gap-1.5">
                                <Skeleton variant="text" width="60%" height={10} />
                                <Skeleton variant="text" width="100%" height={12} />
                            </div>
                            <div className="flex-1 p-2.5 border-r border-gray-100 flex flex-col gap-1.5">
                                <Skeleton variant="text" width="30%" height={10} />
                                <Skeleton variant="text" width="100%" height={12} />
                                <Skeleton variant="text" width="80%" height={12} />
                            </div>
                            <div className="w-[82px] p-2.5 flex flex-col gap-1.5">
                                <Skeleton variant="text" width="60%" height={10} />
                                <Skeleton variant="text" width="100%" height={14} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Skeleton for Admin Products Table
 */
export const ProductTableSkeleton = ({ rows = 8 }: { rows?: number }) => {
    return (
        <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden animate-in fade-in duration-500">
            <div className="flex bg-[#fafafa] px-6 py-4 border-b border-gray-100 gap-4">
                <div className="w-[40px] flex justify-center"><Skeleton variant="rectangular" width={18} height={18} className="rounded" /></div>
                <div className="flex-1"><Skeleton variant="text" width="30%" height={14} /></div>
                <div className="w-[150px]"><Skeleton variant="text" width="60%" height={14} /></div>
                <div className="w-[200px]"><Skeleton variant="text" width="60%" height={14} /></div>
                <div className="w-[120px] text-right"><Skeleton variant="text" width="60%" height={14} className="ml-auto" /></div>
                <div className="w-[80px] text-center"><Skeleton variant="text" width="40%" height={14} className="mx-auto" /></div>
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex px-6 py-5 border-b border-gray-50 gap-4 items-center">
                    <div className="w-[40px] flex justify-center"><Skeleton variant="rectangular" width={18} height={18} className="rounded" /></div>
                    <div className="flex-1 flex items-center gap-4">
                        <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
                        <div className="flex-1 flex flex-col gap-1.5">
                            <Skeleton variant="text" width="20%" height={10} />
                            <Skeleton variant="text" width="70%" height={14} />
                            <Skeleton variant="text" width="40%" height={12} />
                        </div>
                    </div>
                    <div className="w-[150px] flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Skeleton variant="rectangular" width={50} height={18} className="rounded-full" />
                            <Skeleton variant="rectangular" width={60} height={18} className="rounded-full" />
                        </div>
                        <Skeleton variant="text" width="60%" height={12} />
                    </div>
                    <div className="w-[200px] flex flex-col gap-2">
                        <div className="flex gap-3">
                            <Skeleton variant="text" width="20%" height={10} />
                            <Skeleton variant="text" width="70%" height={12} />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton variant="text" width="20%" height={10} />
                            <Skeleton variant="text" width="70%" height={12} />
                        </div>
                    </div>
                    <div className="w-[120px] flex flex-col items-end gap-1.5">
                        <Skeleton variant="text" width="40%" height={12} />
                        <Skeleton variant="text" width="80%" height={16} />
                    </div>
                    <div className="w-[80px] flex justify-center">
                        <Skeleton variant="circular" width={32} height={32} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Generic Table Skeleton (Backward compatibility)
 */
export const TableSkeleton = OrderTableSkeleton;

/**
 * Generic Card Grid Skeleton (Backward compatibility)
 */
export const CardGridSkeleton = ProductGridSkeleton;

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
