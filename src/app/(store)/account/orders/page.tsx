import React from 'react';
import { fetchUserOrdersAction } from '@/app/actions/orderActions';
import ClientOrdersLayout from './ClientOrdersLayout';

export default async function OrdersPage() {
    const result = await fetchUserOrdersAction(1, 100);
    const orders = result.success ? (result.orders || []) : [];

    return <ClientOrdersLayout initialOrders={orders} />;
}
