import React, { Suspense } from 'react';
import DashboardClient from './DashboardClient';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';

export const dynamic = 'force-dynamic';

const DashboardSkeleton = () => (
    <div className="flex flex-col gap-8 md:gap-10 animate-pulse p-4 md:p-6 lg:p-8 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[140px] bg-white border border-gray-100 rounded-[12px]" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="lg:col-span-2 h-[400px] bg-white border border-gray-100 rounded-[12px]" />
            <div className="h-[400px] bg-gray-100 border border-gray-200 rounded-[12px]" />
        </div>
        <div className="h-[400px] bg-white border border-gray-100 rounded-[12px]" />
    </div>
);

async function DashboardDataWrapper() {
  const result = await getDashboardDataAction();
  return <DashboardClient initialData={result.success ? result.data : undefined} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardDataWrapper />
    </Suspense>
  );
}
