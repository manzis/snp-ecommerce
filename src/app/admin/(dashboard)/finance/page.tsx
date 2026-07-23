import React, { Suspense } from 'react';
import FinanceClient from './FinanceClient';
import { fetchFinanceDashboardDataAction } from '@/app/actions/financeActions';

const FinanceSkeleton = () => (
    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[200px] flex flex-col gap-8 md:gap-10 pt-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="lg:col-span-2 h-[400px] bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
            <div className="h-[400px] bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
        </div>
    </div>
);

async function FinanceDataWrapper() {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const result = await fetchFinanceDashboardDataAction(start, end);
    const initialData = result.success ? result.data : undefined;
    return <FinanceClient initialData={initialData} serverDateRange={{ start, end }} />;
}

export default function FinancePage() {
    return (
        <Suspense fallback={<FinanceSkeleton />}>
            <FinanceDataWrapper />
        </Suspense>
    );
}
