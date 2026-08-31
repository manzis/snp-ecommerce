'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface FinanceDashboardData {
    stats: {
        totalGrossRevenue: number;
        totalDeliveredRevenue: number;
        totalNetRevenue: number;
        totalDeliveredPendingRevenue: number;
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

export async function fetchFinanceDashboardDataAction(
    startDate?: string, 
    endDate?: string,
    orderStatus?: string,
    paymentStatus?: string
): Promise<{ success: boolean; data?: FinanceDashboardData; message?: string }> {
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

    // 2. Use the service-role admin client for the actual data fetch
    const adminClient = getSupabaseAdmin() || supabase;

    try {
        // Build Date Range & Status Filters
        let query = adminClient.from('orders').select('*');
        
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) {
            // Ensure end date includes the entire day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query = query.lte('created_at', end.toISOString());
        }

        // Order Status Filter (confirmed, shipped, delivered)
        if (orderStatus && orderStatus !== 'all') {
            const normOrder = orderStatus.toLowerCase();
            if (normOrder === 'confirmed') {
                query = query.in('status', ['confirmed', 'processing']);
            } else if (normOrder === 'shipped') {
                query = query.in('status', ['shipped', 'in_transit', 'out_for_delivery']);
            } else if (normOrder === 'delivered') {
                query = query.eq('status', 'delivered');
            } else {
                query = query.eq('status', normOrder);
            }
        }

        // Payment Status Filter (paid, pending, failed)
        if (paymentStatus && paymentStatus !== 'all') {
            const normPay = paymentStatus.toLowerCase();
            if (normPay === 'paid') {
                query = query.eq('payment_status', 'paid');
            } else if (normPay === 'pending') {
                query = query.or('payment_status.eq.pending,payment_status.eq.unpaid,payment_status.is.null');
            } else if (normPay === 'failed') {
                query = query.eq('payment_status', 'failed');
            }
        }
        
        const { data: orders, error: ordersError } = await query.order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        let deliveredGrossRevenue = 0; 
        let deliveredNetRevenue = 0;
        let deliveredPendingRevenue = 0;

        let totalGrossRevenue = 0; 
        let totalNetRevenue = 0;
        let totalPendingRevenue = 0; 
        
        let totalDeliveryCharges = 0;
        let totalCouponDiscount = 0;
        let totalCodFees = 0;
        const totalOrdersCount = orders ? orders.length : 0;

        const paymentMethodMap: Record<string, { amount: number; count: number }> = {};
        const timeSeriesMap: Record<string, { revenue: number; orders: number }> = {};

        const isFilteredByOrderStatus = Boolean(orderStatus && orderStatus !== 'all');

        if (orders) {
            orders.forEach(order => {
                const amount = Number(order.total_amount) || 0;
                const shipping = Number(order.shipping_amount) || 0;
                const coupon = Number(order.coupon_discount) || 0;
                const cod = Number(order.cod_fees) || 0;
                const status = order.status?.toLowerCase() || 'pending';
                const rawPayStatus = order.payment_status?.toLowerCase();
                const payStatus = rawPayStatus === 'paid' ? 'paid' : 'pending';
                let method = order.payment_method || 'Unknown';

                if (method.toLowerCase() === 'qr') {
                    if (method === 'QR') {
                        method = 'Link Payment (QR)';
                    } else if (method === 'qr') {
                        method = 'QR on Purchase';
                    } else {
                        method = 'QR Payment';
                    }
                }

                const date = new Date(order.created_at).toISOString().split('T')[0];

                if (status !== 'cancelled') {
                    totalGrossRevenue += amount;
                    totalDeliveryCharges += shipping;
                    totalCouponDiscount += coupon;
                    totalCodFees += cod;

                    if (payStatus === 'paid') {
                        totalNetRevenue += (amount - shipping - cod);
                    } else {
                        totalPendingRevenue += amount;
                    }

                    if (status === 'delivered') {
                        deliveredGrossRevenue += amount;
                        if (payStatus === 'paid') {
                            deliveredNetRevenue += (amount - shipping - cod);
                        } else {
                            deliveredPendingRevenue += amount;
                        }
                    }

                    // For chart: track revenue over time for all non-cancelled orders in dataset
                    if (isFilteredByOrderStatus || status === 'delivered') {
                        if (!timeSeriesMap[date]) timeSeriesMap[date] = { revenue: 0, orders: 0 };
                        timeSeriesMap[date].revenue += amount;
                        timeSeriesMap[date].orders += 1;
                    }

                    // Payment Method Breakdown
                    if (!paymentMethodMap[method]) paymentMethodMap[method] = { amount: 0, count: 0 };
                    paymentMethodMap[method].amount += amount;
                    paymentMethodMap[method].count += 1;
                }
            });
        }

        const avgOrderValue = totalOrdersCount > 0 ? totalGrossRevenue / totalOrdersCount : 0;

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

        const recentTransactions = (orders || []).slice(0, 15).map(order => ({
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
                    totalDeliveredRevenue: isFilteredByOrderStatus ? totalGrossRevenue : deliveredGrossRevenue, 
                    totalNetRevenue: isFilteredByOrderStatus ? totalNetRevenue : deliveredNetRevenue, 
                    totalDeliveredPendingRevenue: isFilteredByOrderStatus ? totalPendingRevenue : deliveredPendingRevenue,
                    totalPendingRevenue, 
                    totalDeliveryCharges,
                    totalCouponDiscount,
                    totalOrders: totalOrdersCount,
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
