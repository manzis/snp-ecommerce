'use server';

import { revalidatePath } from 'next/cache';
import * as bannerService from '@/services/bannerService';
import { createClient } from '@/lib/supabase/server';

export async function fetchBannersAction() {
    const supabase = await createClient();
    const banners = await bannerService.fetchBanners(supabase);
    return { success: true, data: banners };
}

export async function fetchActiveBannersAction() {
    const supabase = await createClient();
    const banners = await bannerService.fetchActiveBanners(supabase);
    return { success: true, data: banners };
}

export async function createBannerAction(banner: Partial<bannerService.Banner>) {
    const supabase = await createClient();
    const res = await bannerService.createBanner(banner, supabase);
    if (res.success) {
        revalidatePath('/admin/layouts');
        revalidatePath('/product/[slug]', 'page');
    }
    return res;
}

export async function updateBannerAction(id: string, updates: Partial<bannerService.Banner>) {
    const supabase = await createClient();
    const res = await bannerService.updateBanner(id, updates, supabase);
    if (res.success) {
        revalidatePath('/admin/layouts');
        revalidatePath('/product/[slug]', 'page');
    }
    return res;
}

export async function deleteBannerAction(id: string) {
    const supabase = await createClient();
    const res = await bannerService.deleteBanner(id, supabase);
    if (res.success) {
        revalidatePath('/admin/layouts');
        revalidatePath('/product/[slug]', 'page');
    }
    return res;
}

export async function linkBannersToProductAction(productId: string, bannerIds: string[]) {
    const supabase = await createClient();
    const success = await bannerService.linkBannersToProduct(productId, bannerIds, supabase);
    if (success) {
        revalidatePath('/admin/products');
        revalidatePath('/product/[slug]', 'page');
    }
    return { success };
}
