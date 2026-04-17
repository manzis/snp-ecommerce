'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Server action to delete a category
 */
export async function deleteCategoryAction(id: string) {
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

  // 2. Perform Delete using Admin Client to bypass RLS if needed
  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    const { error } = await finalClient
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteCategoryAction:', error);
    return { success: false, message: error.message || 'Failed to delete category.' };
  }
}

/**
 * Server action to update an existing category
 */
export async function updateCategoryAction(id: string, updates: any) {
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
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: updateCategoryAction:', error);
    return { success: false, message: error.message || 'Failed to update category.' };
  }
}

/**
 * Server action to create a new category
 */
export async function createCategoryAction(categoryData: any) {
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
      .from('categories')
      .insert([categoryData])
      .select();

    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: createCategoryAction:', error);
    return { success: false, message: error.message || 'Failed to create category.' };
  }
}
