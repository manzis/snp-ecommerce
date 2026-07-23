import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ProductsClient from './ProductsClient';
import { fetchProductsPaginatedAction } from '@/app/actions/productActions';
import { ProductGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';

export const metadata: Metadata = {
  title: 'Products Management | SNP Admin',
  description: 'Manage your product catalog, inventory, and variants.',
};

async function ProductsDataWrapper() {
  const result = await fetchProductsPaginatedAction(1, 8, { search: '' });
  return <ProductsClient initialData={result} />;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 lg:p-8"><ProductGridSkeleton count={8} /></div>}>
      <ProductsDataWrapper />
    </Suspense>
  );
}
