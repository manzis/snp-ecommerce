'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface CustomerBehavior {
    lastActive: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    abandonedCarts: number;
    isVIP: boolean;
    isAtRisk: boolean;
    frequentCategories: string[];
    monthlyConsistency: boolean;
}

export interface CustomerData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    createdAt: string;
    status: 'active' | 'inactive' | 'new' | 'vip';
    behavior: CustomerBehavior;
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

    // 1. Verify Admin Role (Security check)
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

    try {
        // 2. Fetch data from multiple sources
        // A. Auth Users (using service role admin client)
        let authUsers: any[] = [];
        if (adminClient) {
            const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
            if (!listError) authUsers = users;
        }

        // B. Profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*');
        if (profileError) throw profileError;

        // C. Orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('user_id, total_amount, created_at, status')
            .not('user_id', 'is', null);
        if (ordersError) throw ordersError;

        // 3. Process and Merge Data
        const customerMap: Record<string, CustomerData> = {};
        const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

        // Initialize from Auth Users (Truth source for existence)
        authUsers.forEach(u => {
            const p = profileMap[u.id];
            
            // SKIP current admin or anyone with admin role
            if (u.id === currentUser.id || p?.role === 'admin') return;

            customerMap[u.id] = {
                id: u.id,
                name: p?.full_name || u.user_metadata?.full_name || u.user_metadata?.name || 'Customer User',
                email: u.email || p?.email || 'N/A',
                phone: u.phone || p?.phone || u.user_metadata?.phone || 'N/A',
                avatar: p?.avatar_url || u.user_metadata?.avatar_url || u.user_metadata?.picture,
                createdAt: new Date(u.created_at).toLocaleDateString(),
                status: 'new',
                behavior: {
                    lastActive: 'Never',
                    totalOrders: 0,
                    totalSpent: 0,
                    avgOrderValue: 0,
                    abandonedCarts: 0,
                    isVIP: false,
                    isAtRisk: false,
                    frequentCategories: [],
                    monthlyConsistency: false
                }
            };
        });

        // Add logic for profiles that might not be in authUsers (if any)
        profiles?.forEach(p => {
            if (customerMap[p.id] || p.role === 'admin' || p.id === currentUser.id) return;
            
            customerMap[p.id] = {
                id: p.id,
                name: p.full_name || 'Guest/Profile Customer',
                email: p.email || 'N/A',
                phone: p.phone || 'N/A',
                avatar: p.avatar_url,
                createdAt: new Date(p.created_at).toLocaleDateString(),
                status: 'new',
                behavior: {
                    lastActive: 'Never',
                    totalOrders: 0,
                    totalSpent: 0,
                    avgOrderValue: 0,
                    abandonedCarts: 0,
                    isVIP: false,
                    isAtRisk: false,
                    frequentCategories: [],
                    monthlyConsistency: false
                }
            };
        });

        // Calculate Behavioral Metrics from Orders
        orders?.forEach(o => {
            if (!customerMap[o.user_id]) return;
            
            const amount = Number(o.total_amount) || 0;
            const behavior = customerMap[o.user_id].behavior;
            
            behavior.totalOrders += 1;
            behavior.totalSpent += amount;
            
            const orderDate = new Date(o.created_at);
            if (behavior.lastActive === 'Never' || orderDate > new Date(behavior.lastActive)) {
                behavior.lastActive = orderDate.toLocaleDateString();
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
                customers: customers.sort((a, b) => b.behavior.totalSpent - a.behavior.totalSpent),
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

        return { success: true, message: 'Customer successfully deleted.' };
    } catch (error: any) {
        console.error('Action Error: deleteCustomerAction:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}
