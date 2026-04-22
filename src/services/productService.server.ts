import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import * as baseService from './productService';

// Re-export all types and non-cached functions from the base service
export * from './productService';

/**
 * SERVER-ONLY OPTIMIZED FETCHERS
 * These versions use Next.js unstable_cache for extreme performance.
 * They should ONLY be used in Server Components.
 */

export const fetchProducts = cache(unstable_cache(
  async (options?: { brandSlug?: string; categorySlug?: string; search?: string }) => 
    baseService.fetchProducts(options),
  ['products-list'],
  { revalidate: 300, tags: ['products'] }
));

export const fetchProductBySlug = cache(unstable_cache(
  async (slug: string, options?: { requirePublished?: boolean }) => 
    baseService.fetchProductBySlug(slug, options),
  ['product-by-slug'],
  { revalidate: 300, tags: ['products'] }
));

export const fetchCategoryBySlug = cache(unstable_cache(
  async (slug: string) => baseService.fetchCategoryBySlug(slug),
  ['category-by-slug'],
  { revalidate: 300, tags: ['categories'] }
));

export const fetchBrandBySlug = cache(unstable_cache(
  async (slug: string) => baseService.fetchBrandBySlug(slug),
  ['brand-by-slug'],
  { revalidate: 300, tags: ['brands'] }
));

export const fetchRelatedProducts = cache(unstable_cache(
  async (baseProductId: string, categoryId: string | null | undefined, limit: number = 10) => 
    baseService.fetchRelatedProducts(baseProductId, categoryId, limit),
  ['related-products'],
  { revalidate: 300, tags: ['products'] }
));

export const fetchProductReviews = cache(unstable_cache(
  async (productId: string) => baseService.fetchProductReviews(productId),
  ['product-reviews'],
  { revalidate: 300, tags: ['products'] }
));

export const fetchProductQA = cache(unstable_cache(
  async (productId: string) => baseService.fetchProductQA(productId),
  ['product-qa'],
  { revalidate: 300, tags: ['products'] }
));
