'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface FinanceDashboardData {
    stats: {
        totalGrossRevenue: number;
        totalNetRevenue: number;
        totalPendingRevenue: number;
        totalDeliveryCharges: number;
        totalCouponDiscount: number;
        totalOrders: number;
        avgOrderValue: number;
        totalCodFees: number;
    };
    paymentMethods: {
        method: string;
        amount: number;
        count: number;
    }[];
    timeSeries: {
        date: string;
        revenue: number;
        orders: number;
    }[];
    recentTransactions: {
        id: string;
        customer: string;
        amount: number;
        date: string;
        status: string;
        method: string;
    }[];
}

export async function fetchFinanceDashboardDataAction(startDate?: string, endDate?: string): Promise<{ success: boolean; data?: FinanceDashboardData; message?: string }> {
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
        // Build Date Range Filter
        let query = supabase.from('orders').select('*');
        
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        
        const { data: orders, error: ordersError } = await query.order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Calculate Metrics
        let totalGrossRevenue = 0;
        let totalNetRevenue = 0;
        let totalPendingRevenue = 0;
        let totalDeliveryCharges = 0;
        let totalCouponDiscount = 0;
        let totalCodFees = 0;
        const totalOrders = orders.length;

        const paymentMethodMap: Record<string, { amount: number; count: number }> = {};
        const timeSeriesMap: Record<string, { revenue: number; orders: number }> = {};

        orders.forEach(order => {
            const amount = Number(order.total_amount) || 0;
            const shipping = Number(order.shipping_amount) || 0;
            const coupon = Number(order.coupon_discount) || 0;
            const cod = Number(order.cod_fees) || 0;
            const status = order.status?.toLowerCase();
            const payStatus = order.payment_status?.toLowerCase();
            const method = order.payment_method || 'Unknown';
            const date = new Date(order.created_at).toISOString().split('T')[0];

            if (status !== 'cancelled') {
                totalGrossRevenue += amount;
                totalDeliveryCharges += shipping;
                totalCouponDiscount += coupon;
                totalCodFees += cod;

                if (payStatus === 'paid') {
                    totalNetRevenue += amount;
                } else if (payStatus === 'pending') {
                    totalPendingRevenue += amount;
                }

                // Payment Method Breakdown
                if (!paymentMethodMap[method]) paymentMethodMap[method] = { amount: 0, count: 0 };
                paymentMethodMap[method].amount += amount;
                paymentMethodMap[method].count += 1;

                // Time Series Breakdown
                if (!timeSeriesMap[date]) timeSeriesMap[date] = { revenue: 0, orders: 0 };
                timeSeriesMap[date].revenue += amount;
                timeSeriesMap[date].orders += 1;
            }
        });

        const avgOrderValue = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0;

        const paymentMethods = Object.entries(paymentMethodMap).map(([method, data]) => ({
            method,
            amount: data.amount,
            count: data.count
        }));

        const timeSeries = Object.entries(timeSeriesMap)
            .map(([date, data]) => ({
                date,
                revenue: data.revenue,
                orders: data.orders
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const recentTransactions = orders.slice(0, 10).map(order => ({
            id: order.id,
            customer: order.contact_details?.name || order.contact_details?.full_name || 'Guest',
            amount: Number(order.total_amount) || 0,
            date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: order.payment_status || 'Pending',
            method: order.payment_method || 'Unknown'
        }));

        return {
            success: true,
            data: {
                stats: {
                    totalGrossRevenue,
                    totalNetRevenue,
                    totalPendingRevenue,
                    totalDeliveryCharges,
                    totalCouponDiscount,
                    totalOrders,
                    avgOrderValue,
                    totalCodFees
                },
                paymentMethods,
                timeSeries,
                recentTransactions
            }
        };

    } catch (error: any) {
        console.error('Action Error: fetchFinanceDashboardDataAction:', error);
        return { success: false, message: error.message || 'Failed to fetch finance data.' };
    }
}
