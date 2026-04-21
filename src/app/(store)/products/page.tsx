import React from 'react';
import { fetchProducts, fetchCategories, fetchBrands } from '@/services/productService';
import ClientProductsLayout from './ClientProductsLayout';
import type { Metadata } from 'next';
import { getSeoPage, getSeoGlobal } from '@/lib/seo/getSeoData';

export async function generateMetadata(): Promise<Metadata> {
  const [pSeo, gSeo] = await Promise.all([
    getSeoPage('products'),
    getSeoGlobal(),
  ]);

  const title = pSeo?.title || 'All Supplements & Proteins | SNP Store Nepal';
  const description = pSeo?.description || gSeo?.default_description || 'Browse Nepal\'s largest collection of authentic supplements. Whey protein, pre-workouts, vitamins, and more with fast nationwide delivery.';

  return {
    title,
    description,
    robots: pSeo?.robots || gSeo?.default_robots || 'index, follow',
    alternates: { canonical: pSeo?.canonical_url || 'https://brightsupplements.store/products' },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function ProductsPage() {
    // Execute all heavy database fetches concurrently on the edge server instantly
    const [products, brands, categories] = await Promise.all([
        fetchProducts(),
        fetchBrands(),
        fetchCategories()
    ]);

    // Pass the strictly resolved cache payload directly into the client framework
    // Eliminates all loading spinners and prevents layout shift delays
    return (
        <ClientProductsLayout 
            initialProducts={products}
            brandsData={brands}
            categoriesData={categories}
        />
    );
}
