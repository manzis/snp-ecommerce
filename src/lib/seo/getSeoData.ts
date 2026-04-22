import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { SeoGlobal, SeoPage, SeoProduct } from './seoTypes';

export const getSeoGlobal = unstable_cache(
  async (): Promise<SeoGlobal | null> => {
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
  { revalidate: 300, tags: ['seo'] }
);

export const getSeoPage = unstable_cache(
  async (pageIdentifier: string): Promise<SeoPage | null> => {
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
  ['seo-page'],
  { revalidate: 300, tags: ['seo'] }
);

export const getSeoProduct = unstable_cache(
  async (productId: string): Promise<SeoProduct | null> => {
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
      return null; // Silent for products without override
    }
  },
  ['seo-product'],
  { revalidate: 300, tags: ['seo'] }
);
