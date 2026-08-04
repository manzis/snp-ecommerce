import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { SeoGlobal, SeoPage, SeoProduct } from './seoTypes';

export const getSeoGlobal = cache(async (): Promise<SeoGlobal | null> => {
  return unstable_cache(
    async () => {
      try {
        const supabase = getSupabaseAdmin();
        if (!supabase) throw new Error("Supabase admin client uninitialized");
        const { data } = await supabase
          .from('seo_global')
          .select('*')
          .eq('id', 1)
          .single();
        return data;
      } catch (err) {
        console.error('Error fetching global SEO:', err);
        return null;
      }
    },
    ['seo-global'],
    { revalidate: 31536000, tags: ['seo'] }
  )();
});

export const getSeoPage = cache(async (pageIdentifier: string): Promise<SeoPage | null> => {
  return unstable_cache(
    async () => {
      try {
        const supabase = getSupabaseAdmin();
        if (!supabase) throw new Error("Supabase admin client uninitialized");
        const { data } = await supabase
          .from('seo_pages')
          .select('*')
          .eq('page_identifier', pageIdentifier)
          .single();
        return data;
      } catch (err) {
        console.warn(`No SEO page data found or error for ${pageIdentifier}`);
        return null;
      }
    },
    [`seo-page-${pageIdentifier}`],
    { revalidate: 31536000, tags: ['seo'] }
  )();
});

export const getSeoProduct = cache(async (productId: string): Promise<SeoProduct | null> => {
  return unstable_cache(
    async () => {
      try {
        const supabase = getSupabaseAdmin();
        if (!supabase) throw new Error("Supabase admin client uninitialized");
        const { data } = await supabase
          .from('seo_products')
          .select('*')
          .eq('product_id', productId)
          .single();
        return data;
      } catch (err) {
        return null;
      }
    },
    [`seo-product-${productId}`],
    { revalidate: 31536000, tags: ['seo', 'products'] }
  )();
});

export const getSeoProductBySlug = cache(async (slug: string): Promise<SeoProduct | null> => {
  return unstable_cache(
    async () => {
      try {
        const supabase = getSupabaseAdmin();
        if (!supabase) throw new Error("Supabase admin client uninitialized");
        const { data } = await supabase
          .from('seo_products')
          .select('*')
          .eq('custom_slug', slug)
          .maybeSingle();
        return data;
      } catch (err) {
        return null;
      }
    },
    [`seo-product-slug-${slug}`],
    { revalidate: 31536000, tags: ['seo', 'products'] }
  )();
});

