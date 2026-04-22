import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchProducts, fetchBrands } from '@/services/productService.server';
import SearchPageClient from './SearchPageClient';

export const metadata: Metadata = {
  title: 'Search Products | Bright Supplements Nepal',
  description: 'Search for 100% genuine supplements, whey protein, and vitamins in Nepal.',
};

export default async function SearchPage() {
  // Pre-fetch data on the server for instant hydration
  // These use our optimized unstable_cache + React.cache service
  const [initialProducts, initialBrands] = await Promise.all([
    fetchProducts(),
    fetchBrands(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="animate-pulse flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-[#308026] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <SearchPageClient 
        initialProducts={initialProducts} 
        initialBrands={initialBrands} 
      />
    </Suspense>
  );
}