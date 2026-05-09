import React from 'react';
import { Metadata } from 'next';
import OrdersClient from './OrdersClient';

export const metadata: Metadata = {
  title: 'Orders Management | SNP Admin',
  description: 'Manage customer orders, tracking, and fulfillment.',
};

export default function OrdersPage() {
  return (
    <React.Suspense fallback={null}>
      <OrdersClient />
    </React.Suspense>
  );
}
