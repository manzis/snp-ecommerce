import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ProductsClient from './ProductsClient';
import { fetchProductsPaginatedAction } from '@/app/actions/productActions';

export const metadata: Metadata = {
  title: 'Products Management | SNP Admin',
  description: 'Manage your product catalog, inventory, and variants.',
};

export default async function ProductsPage() {
  const result = await fetchProductsPaginatedAction(1, 8, { search: '' });
  
  return (
    <Suspense fallback={null}>
      <ProductsClient initialData={result} />
    </Suspense>
  );
}
