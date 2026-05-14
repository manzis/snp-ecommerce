'use server';

import { fetchFinanceDashboardDataAction } from './financeActions';
import { getAnalyticsDataAction } from './analyticsActions';
import { fetchAllOrdersAdminAction } from './orderActions';

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
    };
    recentOrders: RecentOrder[];
    revenueChart: { revenue?: number; date?: string; [key: string]: unknown }[];
}

export async function getDashboardDataAction(): Promise<{ success: boolean; data?: DashboardData; message?: string }> {
    try {
        const dateRange = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        };

        const [financeResult, analyticsResult, ordersResult] = await Promise.all([
            fetchFinanceDashboardDataAction(dateRange.start, dateRange.end),
            getAnalyticsDataAction(),
            fetchAllOrdersAdminAction(1, 10)
        ]);

        if (!financeResult.success || !financeResult.data) {
            return { success: false, message: 'Failed to fetch dashboard finance data.' };
        }

        const stats = {
            totalOrders: financeResult.data.stats.totalOrders || 0,
            grossRevenue: financeResult.data.stats.totalGrossRevenue || 0,
            totalCustomers: analyticsResult.success && analyticsResult.data ? analyticsResult.data.stats.customers || 0 : 0,
            avgOrderValue: financeResult.data.stats.avgOrderValue || 0
        };

        return {
            success: true,
            data: {
                stats,
                recentOrders: ordersResult.success ? (ordersResult.orders || []) : [],
                revenueChart: financeResult.data.timeSeries || []
            }
        };
    } catch (error: unknown) {
        console.error('Error in getDashboardDataAction:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch dashboard data.' };
    }
}
