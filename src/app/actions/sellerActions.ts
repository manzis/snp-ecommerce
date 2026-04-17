'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Server action to delete a seller
 */
export async function deleteSellerAction(id: string) {
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
      .from('sellers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/sellers');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteSellerAction:', error);
    return { success: false, message: error.message || 'Failed to delete seller.' };
  }
}

/**
 * Server action to update an existing seller
 */
export async function updateSellerAction(id: string, updates: any) {
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
      .from('sellers')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    revalidatePath('/admin/sellers');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: updateSellerAction:', error);
    return { success: false, message: error.message || 'Failed to update seller.' };
  }
}

/**
 * Server action to create a new seller
 */
export async function createSellerAction(sellerData: any) {
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
      .from('sellers')
      .insert([sellerData])
      .select();

    if (error) throw error;

    revalidatePath('/admin/sellers');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: createSellerAction:', error);
    return { success: false, message: error.message || 'Failed to create seller.' };
  }
}
