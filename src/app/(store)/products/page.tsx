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

  const title = pSeo?.title || 'Buy Supplements Online Nepal | Best Price | Bright Supplements';
  const description = pSeo?.description || gSeo?.default_description || "Browse Nepal's widest collection of 100% authentic supplements. Whey protein, mass gainers, creatine, vitamins & more — best prices with fast nationwide delivery. Cash on delivery available.";
  const keywords = pSeo?.keywords || 'buy supplements online nepal, protein powder price nepal, mass gainer nepal, creatine nepal, supplement store kathmandu, pre-workout nepal, gym nutrition nepal';
  const canonical = pSeo?.canonical_url || 'https://brightsupplements.store/products';
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
      siteName: 'Bright Supplements',
      locale: 'en_NP',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
        <ClientProductsLayout 
            initialProducts={products}
            brandsData={brands}
            categoriesData={categories}
        />
    );
}
