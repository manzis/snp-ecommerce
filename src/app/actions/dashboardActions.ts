'use server';

import { fetchFinanceDashboardDataAction } from './financeActions';
import { fetchAllOrdersAdminAction } from './orderActions';
import { getProductStatsAction } from './productActions';
import { analyticsService } from '@/services/analyticsService';

export interface RecentOrder {
    id: string;
    shortId: string;
    title?: string;
    customerName?: string;
    customerPhone?: string;
    status: string;
    dateText: string;
    totalAmount?: number;
    paymentMethod?: string;
}

export interface DashboardData {
    stats: {
        totalOrders: number;
        grossRevenue: number;
        totalCustomers: number;
        avgOrderValue: number;
        activeNow?: number;
        returnRate?: number;
        customerGrowthRate?: number;
    };
    productStats: {
        totalProducts: number;
        outOfStock: number;
        inStock: number;
        totalSold: number;
    };
    recentOrders: RecentOrder[];
    revenueChart: { revenue?: number; date?: string; [key: string]: unknown }[];
    recentlyViewed: any[];
    recentViewsTable: any[];
}

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function getDashboardDataAction(): Promise<{ success: boolean; data?: DashboardData; message?: string }> {
    try {
        const dateRange = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        };

        const adminClient = getSupabaseAdmin() || await createClient();

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
        const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();

        const [
            financeResult,
            customerCountRes,
            ordersResult,
            productStatsResult,
            recentlyViewed,
            recentViewsTable,
            activeViewsRes,
            repeatOrdersRes,
            newProfilesRes,
            prevProfilesRes
        ] = await Promise.all([
            fetchFinanceDashboardDataAction(dateRange.start, dateRange.end),
            adminClient.from('profiles').select('id', { count: 'exact', head: true }),
            fetchAllOrdersAdminAction(1, 10),
            getProductStatsAction(),
            analyticsService.getRecentlyViewedProducts(10),
            analyticsService.getRecentProductViewsTable(100),
            adminClient.from('product_views').select('session_id, user_id').gte('viewed_at', fifteenMinsAgo).limit(300),
            adminClient.from('orders').select('id, user_id, contact_details, status').limit(5000),
            adminClient.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
            adminClient.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo)
        ]);

        if (!financeResult.success || !financeResult.data) {
            return { success: false, message: 'Failed to fetch dashboard finance data.' };
        }

        // 1. Calculate Active Now (unique visitors/sessions within last 15 minutes)
        const activeSessions = new Set<string>();
        (activeViewsRes.data || []).forEach((v: any) => {
            const key = v.user_id || v.session_id;
            if (key) activeSessions.add(key);
        });
        const activeNow = activeSessions.size;

        // 2. Calculate Return Rate (Repeat Customer Rate: Customers with >= 2 non-cancelled orders)
        const validOrders = (repeatOrdersRes.data || []).filter((o: any) => {
            const s = (o.status || '').toLowerCase();
            return s !== 'cancelled' && s !== 'failed';
        });

        const customerOrderCounts: Record<string, number> = {};
        validOrders.forEach((o: any) => {
            const contact = o.contact_details as any;
            const key = o.user_id || contact?.phone || contact?.email;
            if (key) {
                customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1;
            }
        });

        const totalOrderingCustomers = Object.keys(customerOrderCounts).length;
        const repeatCustomers = Object.values(customerOrderCounts).filter(count => count >= 2).length;
        const returnRate = totalOrderingCustomers > 0
            ? Math.round((repeatCustomers / totalOrderingCustomers) * 100)
            : 0;

        // 3. Calculate Customer Growth Rate (new profiles in last 30d vs previous 30d)
        const currentNewUsers = newProfilesRes.count || 0;
        const prevNewUsers = prevProfilesRes.count || 0;
        let customerGrowthRate = 0;
        if (prevNewUsers > 0) {
            customerGrowthRate = Math.round(((currentNewUsers - prevNewUsers) / prevNewUsers) * 100);
        } else if (currentNewUsers > 0) {
            customerGrowthRate = 100;
        } else {
            customerGrowthRate = 0;
        }

        const stats = {
            totalOrders: financeResult.data.stats.totalOrders || 0,
            grossRevenue: financeResult.data.stats.totalGrossRevenue || 0,
            totalCustomers: customerCountRes.count || 0,
            avgOrderValue: financeResult.data.stats.avgOrderValue || 0,
            activeNow,
            returnRate,
            customerGrowthRate
        };

        return {
            success: true,
            data: {
                stats,
                productStats: productStatsResult.success && productStatsResult.data ? productStatsResult.data : {
                    totalProducts: 0,
                    outOfStock: 0,
                    inStock: 0,
                    totalSold: 0
                },
                recentOrders: ordersResult.success ? (ordersResult.orders || []) : [],
                revenueChart: financeResult.data.timeSeries || [],
                recentlyViewed: recentlyViewed || [],
                recentViewsTable: recentViewsTable || []
            }
        };
    } catch (error: unknown) {
        console.error('Error in getDashboardDataAction:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch dashboard data.' };
    }
}
