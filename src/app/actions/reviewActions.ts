'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag } from 'next/cache';
import { revalidateProduct } from '@/lib/cacheUtils';

/**
 * Server action to fetch all reviews
 */
export async function fetchReviewsAction() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.', reviews: [] };

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        product_review_mapping (
          product:products (id, title, name, images)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize mapping results back into a clean product array/object
    const normalizedReviews = (data || []).map(r => ({
      ...r,
      products_data: (r.product_review_mapping || []).map((m: any) => m.product),
      // Keep legacy single 'products' field for compatibility if needed (take the first one)
      products: r.product_review_mapping?.[0]?.product || null
    }));

    return { success: true, reviews: normalizedReviews };
  } catch (error: any) {
    console.error('Action Error: fetchReviewsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch reviews.', reviews: [] };
  }
}

/**
 * Server action to create a review — inserts one row per product_id.
 * If no products selected, inserts one row with product_id = null.
 */
export async function createReviewAction(reviewData: any, productIds: string[] = []) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    // 1. Insert the single unique review row
    const { data: review, error: reviewError } = await finalClient
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    if (reviewError) throw reviewError;

    // 2. If productIds provided, create the mappings
    if (productIds.length > 0) {
      const mappings = productIds.map(pid => ({
        product_id: pid,
        review_id: review.id
      }));

      const { error: mapError } = await finalClient
        .from('product_review_mapping')
        .insert(mappings);

      if (mapError) throw mapError;
    }

    // 3. Fetch the full merged data back for consistency
    const { data: finalData, error: fetchError } = await finalClient
      .from('reviews')
      .select(`
        id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        product_review_mapping (
          product:products (id, title, name, images)
        )
      `)
      .eq('id', review.id)
      .single();

    if (fetchError) throw fetchError;

    const normalizedData = {
      ...finalData,
      products_data: (finalData.product_review_mapping || []).map((m: any) => m.product),
      products: finalData.product_review_mapping?.[0]?.product || null
    };

    revalidatePath('/admin/reviews');
    for (const pid of productIds) {
      revalidateProduct(pid);
    }
    return { success: true, data: normalizedData };
  } catch (error: any) {
    console.error('Action Error: createReviewAction:', error);
    return { success: false, message: error.message || 'Failed to create review.' };
  }
}

/**
 * Server action to update a review
 */
export async function updateReviewAction(id: string, updates: any, productIds: string[] = []) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    // 1. Update the review content
    const { data, error } = await finalClient
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        product_review_mapping (
          product:products (id, title, name, images)
        )
      `);

    if (error) throw error;

    // 2. Synchronize mappings (Replace existing mappings with new set)
    if (productIds.length > 0) {
      // Clear old mappings
      await finalClient.from('product_review_mapping').delete().eq('review_id', id);
      
      // Insert new mappings
      const mappings = productIds.map(pid => ({
        product_id: pid,
        review_id: id
      }));
      await finalClient.from('product_review_mapping').insert(mappings);
    }

    // 3. Fetch fresh normalized data
    const { data: refreshed, error: rError } = await finalClient
      .from('reviews')
      .select(`
        id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        product_review_mapping (
          product:products (id, title, name, images)
        )
      `)
      .eq('id', id)
      .single();

    if (rError) throw rError;

    const { product_review_mapping, ...reviewCore } = refreshed;
    const normalizedReview = {
      ...reviewCore,
      products_data: (product_review_mapping || []).map((m: any) => m.product),
      products: product_review_mapping?.[0]?.product || null
    };

    revalidatePath('/admin/reviews');
    for (const pid of productIds) {
      revalidateProduct(pid);
    }
    return { success: true, data: normalizedReview as any };
  } catch (error: any) {
    console.error('Action Error: updateReviewAction:', error);
    return { success: false, message: error.message || 'Failed to update review.' };
  }
}

/**
 * Server action to delete a review
 */
export async function deleteReviewAction(id: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    // Fetch product mappings before deletion to revalidate them
    const { data: mappings } = await finalClient.from('product_review_mapping').select('product_id').eq('review_id', id);
    const pids = mappings?.map(m => m.product_id) || [];

    const { error } = await finalClient
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/reviews');
    for (const pid of pids) {
      revalidateProduct(pid);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteReviewAction:', error);
    return { success: false, message: error.message || 'Failed to delete review.' };
  }
}
