import React from 'react';
import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Products Management | SNP Admin',
  description: 'Manage your product catalog, inventory, and variants.',
};

export default function ProductsPage() {
  return <ProductsClient />;
}
