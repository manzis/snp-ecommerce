import React, { Suspense } from 'react';
import OffersClient from './OffersClient';
import { fetchAllSalesAction } from '@/app/actions/saleActions';
import { fetchAllProductsAction } from '@/app/actions/productActions';

export const metadata = {
    title: 'Offers & Sales | Admin Dashboard',
    description: 'Manage storefront sales, discounts, and promotional offers',
};

const OffersSkeleton = () => (
    <div className="flex flex-col h-full bg-white rounded-[12px] p-6 gap-6">
        <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />
            ))}
        </div>
        <div className="h-[400px] w-full bg-gray-50 rounded-xl animate-pulse mt-4" />
    </div>
);

async function OffersDataWrapper() {
    // Fetch sales and products in parallel
    const [salesResult, productsResult] = await Promise.all([
        fetchAllSalesAction(),
        fetchAllProductsAction()
    ]);

    const initialSales = salesResult.success ? salesResult.data : [];
    const availableProducts = productsResult.success ? productsResult.data : [];

    return (
        <OffersClient 
            initialSales={initialSales || []} 
            availableProducts={availableProducts || []} 
        />
    );
}

export default function OffersPage() {
    return (
        <Suspense fallback={<OffersSkeleton />}>
            <OffersDataWrapper />
        </Suspense>
    );
}
