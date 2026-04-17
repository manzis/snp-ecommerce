'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

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
        id, product_id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        products (title, name, images)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Normalize products array to single object
    const normalizedReviews = (data || []).map(r => ({
      ...r,
      products: Array.isArray(r.products) ? r.products[0] : r.products
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

    // Build one row per product (or one row with null product_id)
    const rows = productIds.length > 0
      ? productIds.map(pid => ({ ...reviewData, product_id: pid || null }))
      : [{ ...reviewData, product_id: null }];

    const { data, error } = await finalClient
      .from('reviews')
      .insert(rows)
      .select(`
        id, product_id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        products (title, name, images)
      `);

    if (error) throw error;

    const normalizedData = (data || []).map(r => ({
      ...r,
      products: Array.isArray(r.products) ? r.products[0] : r.products
    }));

    revalidatePath('/admin/reviews');
    return { success: true, data: normalizedData };
  } catch (error: any) {
    console.error('Action Error: createReviewAction:', error);
    return { success: false, message: error.message || 'Failed to create review.' };
  }
}

/**
 * Server action to update a review
 */
export async function updateReviewAction(id: string, updates: any) {
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

    const { data, error } = await finalClient
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        id, product_id, author, author_avatar, role, text, rating, image, is_verified, created_at,
        products (title, name, images)
      `);

    if (error) throw error;

    const normalizedReview = {
      ...data[0],
      products: Array.isArray(data[0].products) ? data[0].products[0] : data[0].products
    };

    revalidatePath('/admin/reviews');
    return { success: true, data: normalizedReview };
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

    const { error } = await finalClient
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteReviewAction:', error);
    return { success: false, message: error.message || 'Failed to delete review.' };
  }
}
