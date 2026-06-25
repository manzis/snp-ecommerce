import { supabase } from '@/lib/supabase/client';
import { Product } from './productService';

export interface Banner {
    id: string;
    image_url: string;
    target_product_id: string | null;
    is_active: boolean;
    is_published: boolean;
    display_type: 'home' | 'product';
    display_order?: number;
    created_at: string;
    updated_at: string;
    product?: Partial<Product>;
}

export async function fetchBanners(client = supabase): Promise<Banner[]> {
    const { data, error } = await client
        .from('banners')
        .select('*, products!banners_target_product_id_fkey(id, name, title, slug)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[bannerService] Error fetching banners:', error);
        return [];
    }
    return (data as any[]).map(b => ({
        ...b,
        product: Array.isArray(b.product) ? b.product[0] : (b.product || null)
    })) as Banner[];
}

export async function fetchActiveBanners(client = supabase): Promise<Banner[]> {
    const { data, error } = await client
        .from('banners')
        .select(`
            *,
            products!banners_target_product_id_fkey(id, name, title, slug)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[bannerService] Error details:', JSON.stringify(error, null, 2));
        return [];
    }
    return (data as any[]).map(b => ({
        ...b,
        product: Array.isArray(b.products) ? b.products[0] : (b.products || null)
    })) as Banner[];
}

export async function createBanner(banner: Partial<Banner>, client = supabase): Promise<{ success: boolean; data?: Banner; message?: string }> {
    const { data, error } = await client
        .from('banners')
        .insert([banner])
        .select()
        .single();

    if (error) return { success: false, message: error.message };
    return { success: true, data };
}

export async function updateBanner(id: string, updates: Partial<Banner>, client = supabase): Promise<{ success: boolean; message?: string }> {
    const { error } = await client
        .from('banners')
        .update(updates)
        .eq('id', id);

    if (error) return { success: false, message: error.message };
    return { success: true };
}

export async function deleteBanner(id: string, client = supabase): Promise<{ success: boolean; message?: string }> {
    const { error } = await client
        .from('banners')
        .delete()
        .eq('id', id);

    if (error) return { success: false, message: error.message };
    return { success: true };
}

export async function fetchBannersByProduct(productId: string, client = supabase): Promise<Banner[]> {
    const { data, error } = await client
        .from('product_banners')
        .select('banner_id, banner:banners(*, products!banners_target_product_id_fkey(id, slug))')
        .eq('product_id', productId);

    if (error) {
        console.error('[bannerService] Error fetching product banners:', error);
        return [];
    }
    return (data as any[]).map(item => item.banner) as Banner[];
}

export async function linkBannersToProduct(productId: string, bannerIds: string[], client = supabase): Promise<boolean> {
    // 1. Delete existing
    const { error: deleteError } = await client
        .from('product_banners')
        .delete()
        .eq('product_id', productId);

    if (deleteError) return false;

    if (bannerIds.length === 0) return true;

    // 2. Insert new
    const assignments = bannerIds.map(bid => ({
        product_id: productId,
        banner_id: bid
    }));

    const { error: insertError } = await client
        .from('product_banners')
        .insert(assignments);

    return !insertError;
}

export async function updateBannerOrder(orderedIds: string[], client = supabase): Promise<{ success: boolean; message?: string }> {
    // Supabase JS does not have bulk updates, so we iterate.
    // It's generally fine for a few banners.
    for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const { error } = await client
            .from('banners')
            .update({ display_order: i })
            .eq('id', id);

        if (error) {
            console.error('[bannerService] Error updating banner order:', error);
            return { success: false, message: error.message };
        }
    }
    return { success: true };
}
