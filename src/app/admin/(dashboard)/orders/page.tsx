import React from 'react';
import { Metadata } from 'next';
import OrdersClient from './OrdersClient';
import { fetchAllOrdersAdminAction } from '@/app/actions/orderActions';

export const metadata: Metadata = {
  title: 'Orders Management | SNP Admin',
  description: 'Manage customer orders, tracking, and fulfillment.',
};

export default async function OrdersPage() {
  // Pre-fetch first page of orders server-side for instant render
  const initialData = await fetchAllOrdersAdminAction(1, 12, { search: '', status: 'all', hideCancelled: false });

  return (
    <React.Suspense fallback={null}>
      <OrdersClient initialOrdersData={initialData} />
    </React.Suspense>
  );
}
