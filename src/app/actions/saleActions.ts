'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { revalidateProduct } from '@/lib/cacheUtils';

export interface SaleOffer {
    id: string;
    slug: string;
    name: string;
    banner_image: string | null;
    discount_type: 'AMOUNT' | 'PERCENTAGE';
    discount_value: number;
    ends_at: string;
    is_active: boolean;
    created_at: string;
    products?: any[]; // Joined products
}

/**
 * Creates a new sale offer and links it to multiple products.
 */
export async function createSaleAction(formData: {
    name: string;
    slug: string;
    banner_image: string | null;
    discount_type: 'AMOUNT' | 'PERCENTAGE';
    discount_value: number;
    ends_at: string;
    product_ids: string[];
    max_discount_percentage?: number;
}) {
    const supabase = await createClient();

    // Verify Admin Role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { success: false, message: 'Forbidden' };

    try {
        // 1. Insert Sale Offer
        const { data: sale, error: saleError } = await supabase
            .from('sales_offers')
            .insert({
                name: formData.name,
                slug: formData.slug,
                banner_image: formData.banner_image,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                ends_at: formData.ends_at,
                is_active: true,
                max_discount_percentage: formData.max_discount_percentage || 0
            })
            .select()
            .single();

        if (saleError) throw saleError;

        // 2. Insert Products to junction table
        if (formData.product_ids.length > 0) {
            const junctionData = formData.product_ids.map(productId => ({
                sale_id: sale.id,
                product_id: productId
            }));

            const { error: junctionError } = await supabase
                .from('sales_offers_products')
                .insert(junctionData);

            if (junctionError) throw junctionError;
        }

        revalidatePath('/admin/offers');
        revalidatePath('/');
        revalidateTag('sales', 'max');
        for (const pid of formData.product_ids) {
            revalidateProduct(pid);
        }

        return { success: true, data: sale };
    } catch (error: any) {
        console.error('Action Error: createSaleAction:', error);
        return { success: false, message: error.message || 'Failed to create sale.' };
    }
}

/**
 * Updates an existing sale offer and its linked products.
 */
export async function updateSaleAction(saleId: string, formData: {
    name: string;
    slug: string;
    banner_image: string | null;
    discount_type: 'AMOUNT' | 'PERCENTAGE';
    discount_value: number;
    ends_at: string;
    product_ids: string[];
    max_discount_percentage?: number;
}) {
    const supabase = await createClient();

    // Verify Admin Role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { success: false, message: 'Forbidden' };

    try {
        // 1. Update Sale Offer
        const { data: sale, error: saleError } = await supabase
            .from('sales_offers')
            .update({
                name: formData.name,
                slug: formData.slug,
                banner_image: formData.banner_image,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                ends_at: formData.ends_at,
                max_discount_percentage: formData.max_discount_percentage || 0
            })
            .eq('id', saleId)
            .select()
            .single();

        if (saleError) throw saleError;

        // Fetch old products to invalidate them too
        const { data: oldJunction } = await supabase.from('sales_offers_products').select('product_id').eq('sale_id', saleId);
        const oldProductIds = oldJunction?.map(j => j.product_id) || [];
        const allAffectedProductIds = Array.from(new Set([...oldProductIds, ...formData.product_ids]));

        // 2. Clear old linked products
        const { error: deleteError } = await supabase
            .from('sales_offers_products')
            .delete()
            .eq('sale_id', saleId);

        if (deleteError) throw deleteError;

        // 3. Insert new Products to junction table
        if (formData.product_ids.length > 0) {
            const junctionData = formData.product_ids.map(productId => ({
                sale_id: saleId,
                product_id: productId
            }));

            const { error: junctionError } = await supabase
                .from('sales_offers_products')
                .insert(junctionData);

            if (junctionError) throw junctionError;
        }

        revalidatePath('/admin/offers');
        revalidatePath('/');
        revalidateTag('sales', 'max');
        for (const pid of allAffectedProductIds) {
            revalidateProduct(pid);
        }

        return { success: true, data: sale };
    } catch (error: any) {
        console.error('Action Error: updateSaleAction:', error);
        return { success: false, message: error.message || 'Failed to update sale.' };
    }
}

/**
 * Fetches all sales for the admin dashboard.
 */
export async function fetchAllSalesAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        // Fetch sales with products to calculate count
        const { data, error } = await supabase
            .from('sales_offers')
            .select(`
                *,
                sales_offers_products (product_id)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            // If table doesn't exist yet, return empty gracefully for local dev
            if (error.code === '42P01') {
                return { success: true, data: [] };
            }
            throw error;
        }

        const formattedData = data.map(sale => ({
            ...sale,
            product_count: sale.sales_offers_products?.length || 0,
            product_ids: sale.sales_offers_products?.map((sop: any) => sop.product_id) || [],
            sales_offers_products: undefined // clean up response
        }));

        return { success: true, data: formattedData };
    } catch (error: any) {
        console.error('Action Error: fetchAllSalesAction:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return { success: false, message: error?.message || 'Failed to fetch sales.' };
    }
}

/**
 * Toggles a sale's active status
 */
export async function toggleSaleActiveAction(saleId: string, isActive: boolean) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    try {
        const { error } = await supabase
            .from('sales_offers')
            .update({ is_active: isActive })
            .eq('id', saleId);

        if (error) throw error;

        const { data: junction } = await supabase.from('sales_offers_products').select('product_id').eq('sale_id', saleId);
        const productIds = junction?.map(j => j.product_id) || [];

        revalidatePath('/admin/offers');
        revalidatePath('/');
        revalidateTag('sales', 'max');
        for (const pid of productIds) {
            revalidateProduct(pid);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Action Error: toggleSaleActiveAction:', error);
        return { success: false, message: error.message || 'Failed to toggle sale status.' };
    }
}

/**
 * Deletes a sale offer completely
 */
export async function deleteSaleAction(saleId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { success: false, message: 'Forbidden' };

    try {
        const { data: junction } = await supabase.from('sales_offers_products').select('product_id').eq('sale_id', saleId);
        const productIds = junction?.map(j => j.product_id) || [];

        const { error: deleteJunctionError } = await supabase
            .from('sales_offers_products')
            .delete()
            .eq('sale_id', saleId);

        if (deleteJunctionError) throw deleteJunctionError;

        const { error: deleteError } = await supabase
            .from('sales_offers')
            .delete()
            .eq('id', saleId);

        if (deleteError) throw deleteError;

        revalidatePath('/admin/offers');
        revalidatePath('/');
        revalidateTag('sales', 'max');
        for (const pid of productIds) {
            revalidateProduct(pid);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Action Error: deleteSaleAction:', error);
        return { success: false, message: error.message || 'Failed to delete sale.' };
    }
}

/**
 * Fetches active sales for the storefront (Homepage)
 */
export async function fetchActiveSalesAction() {
    return unstable_cache(
        async () => {
            const supabase = getSupabaseAdmin();
            if (!supabase) return { success: true, data: [] };

            try {
                const { data, error } = await supabase
                    .from('sales_offers')
                    .select('*')
                    .eq('is_active', true)
                    .gt('ends_at', new Date().toISOString())
                    .order('ends_at', { ascending: true });

                if (error) {
                    if (error.code === '42P01') return { success: true, data: [] };
                    throw error;
                }

                return { success: true, data };
            } catch (error: any) {
                console.error('Action Error: fetchActiveSalesAction:', error);
                return { success: false, message: error.message };
            }
        },
        ['active-sales-global'],
        { revalidate: 31536000, tags: ['sales'] }
    )();
}

/**
 * Fetches a specific sale by slug along with its products
 */
export async function fetchSaleBySlugAction(slug: string) {
    return unstable_cache(
        async () => {
            const supabase = getSupabaseAdmin();
            if (!supabase) return { success: false, message: 'Supabase client not initialized.' };

            try {
                const { data: sale, error } = await supabase
                    .from('sales_offers')
                    .select(`
                        *,
                        sales_offers_products (
                            products (
                                id, slug, name, title, images,
                                original_price, discounted_price, discount_percentage,
                                stock_status, rating,
                                brands (id, name, slug)
                            )
                        )
                    `)
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single();

                if (error) {
                    if (error.code === '42P01' || error.code === 'PGRST116') return { success: false, message: 'Sale not found.' };
                    throw error;
                }

                // Format the products array cleanly
                const formattedSale = {
                    ...sale,
                    products: sale.sales_offers_products
                        .map((sop: any) => sop.products)
                        .filter(Boolean)
                };
                delete formattedSale.sales_offers_products;

                return { success: true, data: formattedSale };
            } catch (error: any) {
                console.error('Action Error: fetchSaleBySlugAction:', error);
                return { success: false, message: error.message };
            }
        },
        [`sale-by-slug-${slug}`],
        { revalidate: 31536000, tags: ['sales'] }
    )();
}

/**
 * Fetches the active sale for a specific product (if any)
 */
export async function fetchActiveSaleForProductAction(productId: string) {
    return unstable_cache(
        async () => {
            const supabase = getSupabaseAdmin();
            if (!supabase) return { success: true, data: null };

            try {
                const { data, error } = await supabase
                    .from('sales_offers_products')
                    .select(`
                        sales_offers (
                            id, name, slug, discount_type, discount_value, ends_at, is_active
                        )
                    `)
                    .eq('product_id', productId);

                if (error) {
                    if (error.code === '42P01' || error.code === 'PGRST116') return { success: true, data: null };
                    throw error;
                }

                if (!data || data.length === 0) return { success: true, data: null };

                // Find the first active sale that hasn't expired
                const activeSale = data.map((d: any) => d.sales_offers).find((sale: any) =>
                    sale && sale.is_active && new Date(sale.ends_at) > new Date()
                );

                return { success: true, data: activeSale || null };
            } catch (error: any) {
                console.error('Action Error: fetchActiveSaleForProductAction:', error);
                return { success: false, message: error.message };
            }
        },
        [`active-sale-product-${productId}`],
        { revalidate: 31536000, tags: [`product-related-${productId}`] }
    )();
}

/**
 * Fetches the active sale for a specific product by SLUG (For parallel data fetching)
 */
export async function fetchActiveSaleForProductBySlugAction(slug: string) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: true, data: null };

    try {
        const { data, error } = await supabase
            .from('sales_offers_products')
            .select(`
                sales_offers (
                    id, name, slug, discount_type, discount_value, ends_at, is_active
                ),
                products!inner(slug)
            `)
            .eq('products.slug', slug);

        if (error) {
            if (error.code === '42P01' || error.code === 'PGRST116') return { success: true, data: null };
            throw error;
        }

        if (!data || data.length === 0) return { success: true, data: null };

        // Find the first active sale that hasn't expired
        const activeSale = data.map((d: any) => d.sales_offers).find((sale: any) =>
            sale && sale.is_active && new Date(sale.ends_at) > new Date()
        );

        return { success: true, data: activeSale || null };
    } catch (error: any) {
        console.error('Action Error: fetchActiveSaleForProductBySlugAction:', error);
        return { success: false, message: error.message };
    }
}
