import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import * as baseService from './productService';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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

/**
 * HOMEPAGE-SPECIFIC CACHED FETCHERS
 * Aggressively cached to eliminate DB queries on every homepage visit.
 */

export const fetchHomepageProducts = cache(async (sectionKey?: string) => {
  return unstable_cache(
    async (key?: string) => baseService.fetchHomepageProducts(key),
    ['homepage-products', sectionKey || 'default'],
    { revalidate: 120, tags: ['products', 'homepage'] }
  )(sectionKey);
});

export const fetchBrands = cache(unstable_cache(
  async (includeCounts: boolean = true) => baseService.fetchBrands(includeCounts),
  ['brands-list'],
  { revalidate: 120, tags: ['brands'] }
));

export const fetchHomeTestimonials = cache(unstable_cache(
  async () => baseService.fetchHomeTestimonials(),
  ['home-testimonials'],
  { revalidate: 120, tags: ['reviews'] }
));

/**
 * MEGA-FETCHER: fetchHomepageFullData
 * Batches all core homepage data into ONE single cached blob.
 * This is the ultimate optimization for homepage speed.
 */
export const fetchHomepageFullData = cache(unstable_cache(
  async () => {
    const [productsGrouped, brands, testimonials, banners] = await Promise.all([
      baseService.fetchAllHomepageProductsGrouped(),
      baseService.fetchBrands(true),
      baseService.fetchHomeTestimonials(),
      // Directly fetch banners to avoid nested unstable_cache issues
      (async () => {
        const admin = getSupabaseAdmin();
        if (!admin) return [];
        
        const { data } = await admin
          .from('banners')
          .select('*, products!banners_target_product_id_fkey(id, name, title, slug)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        return (data as any[] || []).map(b => ({
          ...b,
          product: Array.isArray(b.products) ? b.products[0] : (b.products || null)
        }));
      })()
    ]);

    return {
      productsGrouped,
      brands,
      testimonials,
      banners
    };
  },
  ['homepage-full-data-v1'],
  { revalidate: 120, tags: ['products', 'brands', 'banners', 'reviews', 'homepage'] }
));
