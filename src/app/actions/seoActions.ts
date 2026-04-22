'use server';

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { SeoGlobal } from '@/lib/seo/seoTypes';
import { revalidatePath } from 'next/cache';

// GLOBAL SETTINGS ACTION
export async function updateSeoGlobalAction(payload: Partial<SeoGlobal>) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_global')
      .upsert({ id: 1, ...payload })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/', 'layout'); // clear everything since it's global
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update Global SEO:', err);
    return { success: false, error: err.message };
  }
}

// PAGES SEO ACTION
export async function upsertSeoPageAction(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_pages')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAllSeoPagesAction() {
  try {
     const supabase = getSupabaseAdmin();
     if (!supabase) return { success: false, data: [] };
     const { data } = await supabase.from('seo_pages').select('*');
     return { success: true, data: data || [] };
  } catch (err) {
     return { success: false, data: [] };
  }
}

export async function fetchSeoGlobalAction() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, data: null };
    const { data } = await supabase.from('seo_global').select('*').eq('id', 1).single();
    return { success: true, data };
  } catch (err) {
    return { success: false, data: null };
  }
}

export async function fetchSeoPageByIdentifierAction(identifier: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, data: null };
    const { data } = await supabase.from('seo_pages').select('*').eq('page_identifier', identifier).single();
    return { success: true, data };
  } catch (err) {
    return { success: false, data: null };
  }
}

// PRODUCTS SEO ACTION
export async function upsertSeoProductAction(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_products')
      .upsert(payload, { onConflict: 'product_id' })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchSeoOverrideForProductAction(productId: string) {
  try {
     const supabase = getSupabaseAdmin();
     if (!supabase) return { success: false, data: null };
     const { data } = await supabase.from('seo_products').select('*').eq('product_id', productId).single();
     return { success: true, data };
  } catch (err) {
     return { success: false, data: null };
  }
}

// SEO CONTENT BLOCKS ACTIONS
export async function upsertSeoContentBlockAction(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_content_blocks')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAllSeoContentBlocksAction() {
  try {
     const supabase = getSupabaseAdmin();
     if (!supabase) return { success: false, data: [] };
     const { data } = await supabase.from('seo_content_blocks').select('*').order('updated_at', { ascending: false });
     return { success: true, data: data || [] };
  } catch (err) {
     return { success: false, data: [] };
  }
}

export async function fetchSeoContentBlockByEntityAction(entityType: string, entityId: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, data: null };
    const { data } = await supabase
      .from('seo_content_blocks')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();
    return { success: true, data };
  } catch (err) {
    return { success: false, data: null };
  }
}

export async function deleteSeoContentBlockAction(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_content_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// REDIRECTS SEO ACTION
export async function fetchSeoRedirectsAction() {
  try {
     const supabase = getSupabaseAdmin();
     if (!supabase) return { success: false, data: [] };
     const { data } = await supabase.from('seo_redirects').select('*').order('created_at', { ascending: false });
     return { success: true, data: data || [] };
  } catch (err) {
     return { success: false, data: [] };
  }
}

export async function createSeoRedirectAction(payload: { from_url: string, to_url: string, type: number }) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_redirects')
      .insert({ ...payload, is_active: true })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleSeoRedirectAction(id: string, isActive: boolean) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_redirects')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSeoRedirectAction(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_redirects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// SITEMAP SEO ACTION
export async function fetchSeoSitemapAction() {
  try {
     const supabase = getSupabaseAdmin();
     if (!supabase) return { success: false, data: [] };
     const { data } = await supabase.from('seo_sitemap').select('*').order('path', { ascending: true });
     return { success: true, data: data || [] };
  } catch (err) {
     return { success: false, data: [] };
  }
}

export async function upsertSeoSitemapAction(payload: any) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_sitemap')
      .upsert(payload, { onConflict: 'path' })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSeoSitemapAction(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    const { error } = await supabase
      .from('seo_sitemap')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
