import React, { Suspense } from 'react';
import AnalyticsClient from './AnalyticsClient';
import { getAnalyticsDataAction } from '@/app/actions/analyticsActions';

// Skeletons
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

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8">
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
    </div>
    <div className="w-full h-[400px] bg-gray-50 rounded-[12px] animate-pulse" />
  </div>
);

async function AnalyticsDataWrapper() {
  const result = await getAnalyticsDataAction();
  
  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <p className="text-red-500 font-semibold">Failed to load analytics data.</p>
        <button className="text-sm text-gray-500 underline">Retry</button>
      </div>
    );
  }

  return <AnalyticsClient initialData={result.data} />;
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AnalyticsDataWrapper />
    </Suspense>
  );
}
