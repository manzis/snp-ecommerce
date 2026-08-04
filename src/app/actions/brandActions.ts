'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Server action to delete a brand securely
 */
export async function deleteBrandAction(id: string) {
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
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/brands');
    revalidatePath('/brand/[slug]', 'page');
    revalidatePath('/');
    revalidateTag('brands', 'max');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteBrandAction:', error);
    return { success: false, message: error.message || 'Failed to delete brand.' };
  }
}

/**
 * Server action to update a brand
 */
export async function updateBrandAction(id: string, updates: any) {
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

    const { data, error } = await finalClient
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    revalidatePath('/admin/brands');
    revalidatePath('/brand/[slug]', 'page');
    revalidatePath('/');
    revalidateTag('brands', 'max');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: updateBrandAction:', error);
    return { success: false, message: error.message || 'Failed to update brand.' };
  }
}

/**
 * Server action to create a new brand
 */
export async function createBrandAction(brandData: any) {
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

    const { data, error } = await finalClient
      .from('brands')
      .insert([brandData])
      .select();

    if (error) throw error;

    revalidatePath('/admin/brands');
    revalidatePath('/brand/[slug]', 'page');
    revalidatePath('/');
    revalidateTag('brands', 'max');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: createBrandAction:', error);
    return { success: false, message: error.message || 'Failed to create brand.' };
  }
}
