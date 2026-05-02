import React from 'react';
import { fetchBrands } from '@/services/productService';
import ClientBrandList from './ClientBrandList';

export default async function BrandsPage() {
  const brands = await fetchBrands();
  return <ClientBrandList brands={brands} />;
}
