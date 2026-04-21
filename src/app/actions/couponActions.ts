'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Server action to fetch all coupons for admin
 */
export async function fetchCouponsAction() {
  const supabase = await createClient();

  // 1. Verify Admin Role
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
    const { data, error } = await supabase
      .from('coupons')
      .select('*, products(id, title)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Action Error: fetchCouponsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch coupons.' };
  }
}

/**
 * Server action to delete a coupon
 */
export async function deleteCouponAction(id: string) {
  const supabase = await createClient();

  // 1. Verify Admin Role
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
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteCouponAction:', error);
    return { success: false, message: error.message || 'Failed to delete coupon.' };
  }
}

/**
 * Server action to update an existing coupon
 */
export async function updateCouponAction(id: string, updates: any) {
  const supabase = await createClient();

  // 1. Verify Admin Role
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

    // Handle empty product_id
    if (updates.product_id === '') updates.product_id = null;

    const { data, error } = await finalClient
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    revalidatePath('/admin/coupons');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: updateCouponAction:', error);
    return { success: false, message: error.message || 'Failed to update coupon.' };
  }
}

/**
 * Server action to create a new coupon
 */
export async function createCouponAction(couponData: any) {
  const supabase = await createClient();

  // 1. Verify Admin Role
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

    // Handle empty product_id
    if (couponData.product_id === '') couponData.product_id = null;

    const { data, error } = await finalClient
      .from('coupons')
      .insert([couponData])
      .select();

    if (error) throw error;

    revalidatePath('/admin/coupons');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: createCouponAction:', error);
    return { success: false, message: error.message || 'Failed to create coupon.' };
  }
}
