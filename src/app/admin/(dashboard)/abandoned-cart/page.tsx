import React, { Suspense } from 'react';
import { getAbandonedCartDataAction } from '@/app/actions/marketingActions';
import AbandonedCartClient from './AbandonedCartClient';
import { redirect } from 'next/navigation';

const AbandonedCartSkeleton = () => (
    <div className="space-y-12 animate-pulse w-full mx-auto px-4 md:px-8 lg:px-10 pb-20 pt-8 no-scrollbar bg-white">
        <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mx-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-[280px] bg-gray-200 rounded-[12px]" />
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[200px] bg-gray-200 rounded-[12px]" />
            ))}
        </div>
        <div className="h-[180px] bg-gray-200 rounded-[24px]" />
    </div>
);

async function AbandonedCartDataWrapper() {
    const result = await getAbandonedCartDataAction();
    return <AbandonedCartClient initialData={result.success ? result.data : null} />;
}

export default function AbandonedCartPage() {
    return (
        <Suspense fallback={<AbandonedCartSkeleton />}>
            <AbandonedCartDataWrapper />
        </Suspense>
    );
}
