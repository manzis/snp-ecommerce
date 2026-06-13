'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapToOrderProps } from '@/services/orderService';

export interface CustomerData {
    id: string;
    email: string;
    name: string;
    phone: string;
    avatar: string;
    status: 'new' | 'active' | 'vip' | 'inactive';
    createdAt: string;
    behavior: {
        totalOrders: number;
        totalSpent: number;
        lastActive: string;
        avgOrderValue: number;
        isVIP: boolean;
        monthlyConsistency: boolean;
    }
}

export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
    highValueCustomers: number;
}

export async function fetchCustomerManagementDataAction(): Promise<{ success: boolean; data?: { customers: CustomerData[]; stats: CustomerStats }; message?: string }> {
    const supabase = await createClient();
    const adminClient = getSupabaseAdmin();

    // 1. Verify Admin Role
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) return { success: false, message: 'Unauthorized.' };

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

    if (currentProfile?.role !== 'admin') {
        return { success: false, message: 'Forbidden. Admin access required.' };
    }

    if (!adminClient) {
        return { success: false, message: 'Server configuration error (Admin Client).' };
    }

    try {
        // 2. Fetch all profiles and orders using admin client to bypass RLS
        const [profilesRes, ordersRes] = await Promise.all([
            adminClient
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false }),
            adminClient
                .from('orders')
                .select('id, user_id, total_amount, created_at, status')
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (ordersRes.error) throw ordersRes.error;

        const profiles = profilesRes.data || [];
        const allOrders = ordersRes.data || [];

        // 2.5 Fetch auth users to get Google metadata (e.g. avatars)
        let authMetadataMap = new Map();
        try {
            const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers();
            authUsers.forEach(au => {
                authMetadataMap.set(au.id, {
                    avatar: au.user_metadata?.avatar_url || au.user_metadata?.picture || '',
                    email: au.email || '',
                    name: au.user_metadata?.full_name || au.email?.split('@')[0] || ''
                });
            });
        } catch (e) {
            console.error('Failed to fetch auth metadata for customers:', e);
        }

        // 3. Aggregate Behavioral Data
        const customerMap: Record<string, CustomerData> = {};

        profiles.forEach(p => {
            const authMeta = authMetadataMap.get(p.id);
            customerMap[p.id] = {
                id: p.id,
                email: p.email || authMeta?.email || 'N/A',
                name: p.full_name || authMeta?.name || 'Customer User',
                phone: p.phone || 'N/A',
                avatar: p.avatar_url || authMeta?.avatar || '',
                status: 'new',
                createdAt: p.created_at, // Use raw ISO string for sorting
                behavior: {
                    totalOrders: 0,
                    totalSpent: 0,
                    lastActive: 'Never',
                    avgOrderValue: 0,
                    isVIP: false,
                    monthlyConsistency: false
                }
            };
        });

        allOrders.forEach(o => {
            if (!o.user_id || !customerMap[o.user_id]) return;

            const behavior = customerMap[o.user_id].behavior;
            
            // Only count non-cancelled/failed orders towards metrics
            const status = (o.status || '').toLowerCase();
            if (status !== 'cancelled' && status !== 'failed') {
                behavior.totalOrders++;
                behavior.totalSpent += o.total_amount || 0;
            }

            const orderDate = new Date(o.created_at);
            if (behavior.lastActive === 'Never' || orderDate > new Date(behavior.lastActive)) {
                behavior.lastActive = o.created_at; // Use raw ISO string
            }
        });

        // 4. Finalize Metrics and Stats
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        let activeCustomers = 0;
        let newThisMonth = 0;
        let highValueCustomers = 0;

        const customers = Object.values(customerMap).map(c => {
            c.behavior.avgOrderValue = c.behavior.totalOrders > 0 ? c.behavior.totalSpent / c.behavior.totalOrders : 0;
            
            // VIP Tier (Spent > 25k)
            if (c.behavior.totalSpent > 25000) {
                c.behavior.isVIP = true;
                c.status = 'vip';
                highValueCustomers++;
            }
            
            // New Tier (Joined in last 30 days)
            const joinDate = new Date(c.createdAt);
            if (joinDate > thirtyDaysAgo) {
                newThisMonth++;
                if (c.status !== 'vip') c.status = 'new';
            }

            // Active Tier (Has placed orders)
            if (c.behavior.totalOrders > 0) {
                activeCustomers++;
                if (c.status === 'new') c.status = 'active';
            }

            // Consistency Check
            if (c.behavior.totalOrders >= 2) {
                c.behavior.monthlyConsistency = true;
            }

            return c;
        });

        return {
            success: true,
            data: {
                customers, // We'll handle sorting on the client
                stats: {
                    totalCustomers: customers.length,
                    activeCustomers,
                    newThisMonth,
                    highValueCustomers
                }
            }
        };

    } catch (error: any) {
        console.error('Action Error: fetchCustomerManagementDataAction:', error);
        return { success: false, message: 'Failed to fetch customer data.' };
    }
}

export async function deleteCustomerAction(customerId: string): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient();
    const adminClient = getSupabaseAdmin();

    // 1. Verify Admin Role
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) return { success: false, message: 'Unauthorized.' };

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

    if (currentProfile?.role !== 'admin') {
        return { success: false, message: 'Forbidden. Admin access required.' };
    }

    if (!adminClient) {
        return { success: false, message: 'Server configuration error (Admin Client).' };
    }

    try {
        // 2. Delete from Auth (This is permanent)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(customerId);
        
        if (deleteError) {
            // Check if it's already gone or missing
            if (deleteError.message.includes('not found')) {
                // Try deleting profile anyway
            } else {
                return { success: false, message: `Failed to delete: ${deleteError.message}` };
            }
        }

        // 3. Delete from Profiles (Cleanup)
        await supabase.from('profiles').delete().eq('id', customerId);
        
        return { success: true, message: 'Customer successfully deleted from system.' };

    } catch (error: any) {
        console.error('Action Error: deleteCustomerAction:', error);
        return { success: false, message: 'Internal server error during deletion.' };
    }
}

export async function fetchDetailedCustomerDataAction(customerId: string) {
    const supabase = await createClient();
    const adminClient = getSupabaseAdmin();

    // 1. Verify Admin Role
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) return { success: false, message: 'Unauthorized.' };

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

    if (currentProfile?.role !== 'admin') {
        return { success: false, message: 'Forbidden. Admin access required.' };
    }

    // Use admin client if available to bypass RLS for behavioral data
    const queryClient = adminClient || supabase;

    try {
        // 2. Parallel Fetching for Efficiency
        const [ordersRes, viewsRes, cartRes] = await Promise.all([
            // Orders with items
            queryClient
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (id, name, title, images, brands(name))
                    )
                `)
                .eq('user_id', customerId)
                .order('created_at', { ascending: false }),

            // Recent Views
            queryClient
                .from('product_views')
                .select(`
                    *,
                    product:products (id, name, title, slug, images, brands(name), original_price, discounted_price)
                `)
                .eq('user_id', customerId)
                .order('viewed_at', { ascending: false })
                .limit(3),

            // Current Cart
            queryClient
                .from('cart_items')
                .select(`
                    *,
                    product:products (id, name, title, slug, images, brands(name), original_price, discounted_price)
                `)
                .eq('user_id', customerId)
                .order('updated_at', { ascending: false })
        ]);

        const rawOrders = ordersRes.data || [];
        const views = viewsRes.data || [];
        const cartItems = cartRes.data || [];

        // Map orders using standard helper
        const orders = rawOrders.map(mapToOrderProps);

        // 3. Calculate Advanced Metrics
        const totalViews = views.length;
        const totalOrders = orders.length;
        const successBuyRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
        
        // Active orders (not delivered or cancelled)
        const activeOrders = orders.filter(o => 
            !['DELIVERED', 'CANCELLED', 'RETURNED', 'FAILED'].includes(o.status)
        );

        // Revenue Metrics
        const paidOrders = orders.filter(o => 
            o.paymentStatus?.toLowerCase() === 'paid' && 
            o.status !== 'CANCELLED' && 
            o.status !== 'FAILED'
        );
        const ltv = paidOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        const aov = paidOrders.length > 0 ? ltv / paidOrders.length : 0;

        return {
            success: true,
            data: {
                orders,
                activeOrders,
                views: views.filter(v => v.product).map(v => ({ ...v.product, viewed_at: v.viewed_at })),
                cartItems,
                metrics: {
                    successBuyRate: Math.round(successBuyRate),
                    ltv,
                    aov: Math.round(aov),
                    totalOrders,
                    totalViews,
                    activeOrdersCount: activeOrders.length,
                    cartItemsCount: cartItems.length
                }
            }
        };

    } catch (error: any) {
        console.error('Action Error: fetchDetailedCustomerDataAction:', error);
        return { success: false, message: 'Failed to load customer details.' };
    }
}
