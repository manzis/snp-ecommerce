import React, { Suspense } from 'react';
import { fetchProducts, fetchCategories, fetchBrands } from '@/services/productService';
import ClientProductsLayout from './ClientProductsLayout';
import type { Metadata } from 'next';
import { getSeoPage, getSeoGlobal } from '@/lib/seo/getSeoData';

export async function generateMetadata(): Promise<Metadata> {
  const [pSeo, gSeo] = await Promise.all([
    getSeoPage('products'),
    getSeoGlobal(),
  ]);

  const title = pSeo?.title || 'Buy Supplements Online Nepal | Best Price | Supplyment Nepal';
  const description = pSeo?.description || gSeo?.default_description || "Browse Supplyment Nepal's widest collection of 100% authentic supplements. Whey protein, mass gainers, creatine, vitamins & more — best prices with fast nationwide delivery. Cash on delivery available.";
  const keywords = pSeo?.keywords || 'buy supplements online nepal, protein powder price nepal, mass gainer nepal, creatine nepal, supplement store kathmandu, pre-workout nepal, gym nutrition nepal, Supplyment Nepal, Supplyment Nepal Nepal';
  const canonical = pSeo?.canonical_url || 'https://www.brightsupplements.store/products';
  const ogImage = pSeo?.og_image || gSeo?.default_og_image || '';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: { 'en-NP': canonical },
    },
    robots: pSeo?.robots || gSeo?.default_robots || 'index, follow',
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Supplyment Nepal',
      locale: 'en_NP',
      images: [
        {
          url: ogImage || '/icon.png',
          width: 1200,
          height: 1200,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage || '/icon.png'],
    },
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
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <ClientProductsLayout 
                initialProducts={products}
                brandsData={brands}
                categoriesData={categories}
            />
        </Suspense>
    );
}
