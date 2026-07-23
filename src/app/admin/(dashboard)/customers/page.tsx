import React, { Suspense } from 'react';
import { Metadata } from 'next';
import CustomersClient from './CustomersClient';
import { fetchCustomerManagementDataAction } from '@/app/actions/customerActions';

export const metadata: Metadata = {
    title: 'Customer Management | SNP Admin',
    description: 'Manage customers, analyze behavior, and track loyalty metrics.',
};

const CustomersSkeleton = () => (
    <div className="p-4 md:p-6 lg:p-8 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
        </div>
    </div>
);

async function CustomersDataWrapper() {
    const res = await fetchCustomerManagementDataAction();
    return <CustomersClient initialData={res.success ? res.data : null} />;
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<CustomersSkeleton />}>
            <CustomersDataWrapper />
        </Suspense>
    );
}
