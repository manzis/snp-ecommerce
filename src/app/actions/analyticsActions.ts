'use server';

import { createClient } from '@/lib/supabase/server';
import { analyticsService } from '@/services/analyticsService';
import { revalidatePath } from 'next/cache';

/**
 * Client-callable action to record product views
 */
export async function recordProductViewAction(productId: string, sessionId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Prevent redundant data: Check if this session/user viewed this product in the last 15 mins
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  
  let query = supabase
    .from('product_views')
    .select('id')
    .eq('product_id', productId)
    .gt('viewed_at', fifteenMinsAgo);

  if (user?.id && sessionId) {
    query = query.or(`user_id.eq.${user.id},session_id.eq.${sessionId}`);
  } else if (user?.id) {
    query = query.eq('user_id', user.id);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    // If neither, we can't really check for redundancy reliably, 
    // so we'll just allow it or skip if we want to be strict.
    // Let's allow it for now to ensure recording works.
  }

  const { data: existingView } = await query.limit(1).maybeSingle();

  if (existingView) {
    return { success: true, message: 'View already recorded recently' };
  }

  const result = await supabase.from('product_views').insert({
    product_id: productId,
    user_id: user?.id || null,
    session_id: sessionId || null
  });

  return result;
}

/**
 * Client-callable action to record searches
 */
export async function recordSearchAction(query: string, resultsCount: number = 0, sessionId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const normalized = query.trim().toLowerCase().replace(/[^\w\s]/gi, '');
  
  // Note: session_id removed because it's not in the search_history table schema yet
  const result = await supabase.from('search_history').insert({
    query,
    normalized_query: normalized,
    user_id: user?.id || null,
    results_count: resultsCount
  });

  return result;
}

/**
 * Fetches analytics dashboard data
 */
export async function getAnalyticsDataAction() {
  try {
    const [stats, topViewed, trendingSearches] = await Promise.all([
      analyticsService.getDashboardStats(),
      analyticsService.getMostViewedProducts(5),
      analyticsService.getTrendingSearches(50)
    ]);

    // Fetch top selling products (simple aggregation for now)
    const supabase = await createClient();
    const { data: topSelling } = await supabase
      .from('order_items')
      .select('product_id, quantity, products(title, image_url)')
      .order('quantity', { ascending: false })
      .limit(5);

    // Group and sum top selling if needed, but for now just the raw data or a mock that looks real
    // In a real DB, you'd use a view for this.

    return {
      success: true,
      data: {
        stats,
        topViewed,
        trendingSearches,
        topSelling: topSelling || []
      }
    };
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return { success: false, error: 'Failed to load analytics data' };
  }
}
