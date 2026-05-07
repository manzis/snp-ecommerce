import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { Banner } from './bannerService';

/**
 * SERVER-ONLY cached banner fetcher.
 * Replaces the fetchActiveBannersAction server action call from the homepage,
 * eliminating the HTTP round-trip overhead of calling a server action from
 * a server component.
 */
export const fetchActiveBannersCached = cache(unstable_cache(
  async (): Promise<Banner[]> => {
    try {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        console.warn('[bannerService.cached] Admin client unavailable');
        return [];
      }

      const { data, error } = await supabase
        .from('banners')
        .select(`
          *,
          products!banners_target_product_id_fkey(id, name, title, slug)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[bannerService.cached] Error:', error);
        return [];
      }

      return (data as any[]).map(b => ({
        ...b,
        product: Array.isArray(b.products) ? b.products[0] : (b.products || null)
      })) as Banner[];
    } catch (err) {
      console.error('[bannerService.cached] Unexpected error:', err);
      return [];
    }
  },
  ['active-banners'],
  { revalidate: 120, tags: ['banners'] }
));
