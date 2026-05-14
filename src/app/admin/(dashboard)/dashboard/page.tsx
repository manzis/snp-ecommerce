import React, { Suspense } from 'react';
import DashboardClient from './DashboardClient';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';

export const dynamic = 'force-dynamic';

// Loading Skeleton mirroring the Analytics Loading Skeleton
const MetricSkeleton = () => (
  <div className="bg-white p-6 rounded-[12px] border border-gray-100 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.03)] animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
      <div className="w-16 h-4 bg-gray-100 rounded" />
    </div>
    <div className="w-24 h-8 bg-gray-200 rounded mb-2" />
    <div className="w-32 h-4 bg-gray-100 rounded" />
  </div>
);

const DashboardLoadingSkeleton = () => (
  <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8 bg-[#FAFAFA] h-full">
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 w-full h-[400px] bg-white rounded-[12px] border border-gray-100 animate-pulse" />
      <div className="w-full h-[400px] bg-gray-100 rounded-[12px] border border-gray-200 animate-pulse" />
    </div>
    <div className="w-full h-[400px] bg-white rounded-[12px] border border-gray-100 animate-pulse" />
  </div>
);

async function DashboardDataWrapper() {
  const result = await getDashboardDataAction();
  
  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4 bg-white m-6 rounded-2xl border border-gray-100">
        <p className="text-red-500 font-semibold">Failed to load dashboard data.</p>
      </div>
    );
  }

  return <DashboardClient initialData={result.data} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardDataWrapper />
    </Suspense>
  );
}
