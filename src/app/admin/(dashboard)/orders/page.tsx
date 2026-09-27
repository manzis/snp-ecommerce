import React from 'react';
import { Metadata } from 'next';
import OrdersClient from './OrdersClient';
import { fetchAllOrdersAdminAction, fetchOrdersStatsAction } from '@/app/actions/orderActions';
import { OrderGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';

export const metadata: Metadata = {
  title: 'Orders Management | SNP Admin',
  description: 'Manage customer orders, tracking, and fulfillment.',
};

async function OrdersDataWrapper() {
  const [initialData, statsResult] = await Promise.all([
    fetchAllOrdersAdminAction(1, 12, { search: '', status: 'all', hideCancelled: false }),
    fetchOrdersStatsAction()
  ]);
  return <OrdersClient initialOrdersData={initialData} initialStats={statsResult?.stats} />;
}

export default function OrdersPage() {
  return (
    <React.Suspense fallback={<div className="p-4 md:p-6 lg:p-8"><OrderGridSkeleton count={8} /></div>}>
      <OrdersDataWrapper />
    </React.Suspense>
  );
}
