'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Activity,
    Zap,
    Package,
    PackageCheck,
    PackageX,
    BarChart3
} from 'lucide-react';
import { MetricCard } from '@/components/admin/analytics/MetricCard';
import { DashboardData, getDashboardDataAction } from '@/app/actions/dashboardActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import Link from 'next/link';



export default function DashboardClient({ initialData }: { initialData?: DashboardData }) {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(!initialData);
    const [data, setData] = useState<DashboardData | null>(initialData || null);
    const [searchQuery, setSearchQuery] = useState('');

    const { showAdminToast } = useAdminToast();
    const { setPrimaryAction, setOverrideTitle } = useAdminUI();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const result = await getDashboardDataAction();
            if (result.success && result.data) {
                setData(result.data);
            } else {
                showAdminToast(result.message || 'Failed to load dashboard data', 'error');
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            showAdminToast('An unexpected error occurred', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        setOverrideTitle(null);
        setPrimaryAction(null);
        if (!initialData) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredOrders = React.useMemo(() => {
        if (!data?.recentOrders) return [];
        return data.recentOrders.filter(order => {
            const matchesSearch =
                (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.shortId && order.shortId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.title && order.title.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [data, searchQuery]);

    if (!isMounted) return null;

    const stats = data?.stats || { totalOrders: 0, grossRevenue: 0, totalCustomers: 0, avgOrderValue: 0 };
    const chartData = data?.revenueChart || [];

    // Simple max calculation for chart
    const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => Number(d.revenue || 0)), 100) : 100;
    const chartMax = maxRevenue * 1.15;

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] rounded-[12px] overflow-hidden font-rubik tracking-tight">
            <AdminSubNav
                onSearch={setSearchQuery}
                searchPlaceholder="Search recent orders..."
                searchOnLeft={true}
                onRefresh={loadData}
                refreshLoading={isLoading}
            />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[200px] flex flex-col gap-8 md:gap-10">
                {isLoading ? (
                    <div className="flex flex-col gap-8 md:gap-10 animate-pulse">
                        {/* KPI Grid Skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[140px] bg-white border border-gray-100 rounded-[12px]" />
                            ))}
                        </div>

                        {/* Chart and Quick Actions Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                            <div className="lg:col-span-2 h-[400px] bg-white border border-gray-100 rounded-[12px]" />
                            <div className="h-[400px] bg-gray-100 border border-gray-200 rounded-[12px]" />
                        </div>

                        {/* Recent Orders Table Skeleton */}
                        <div className="h-[400px] bg-white border border-gray-100 rounded-[12px]" />
                    </div>
                ) : (
                    <>
                        {searchQuery && (
                            <div className="bg-[#bef264]/10 border border-[#bef264]/20 p-6 rounded-2xl">
                                <h2 className="text-sm font-semibold text-[#242424] mb-4">
                                    Search Results for &quot;{searchQuery}&quot;
                                </h2>
                                <div className="py-[100px] text-center bg-white border border-gray-100 rounded-[12px]">
                                    <p className="text-[#a1a1aa] text-sm font-semibold">Filtering recent orders for your search term.</p>
                                </div>
                            </div>
                        )}

                        {!searchQuery && (
                            <>
                                {/* KPI Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <MetricCard
                                        title="Gross Revenue"
                                        value={`रु ${stats.grossRevenue.toLocaleString()}`}
                                        subtext="Last 30 Days"
                                        icon={Wallet}
                                        trend={12.5}
                                    />
                                    <MetricCard
                                        title="Total Orders"
                                        value={stats.totalOrders.toLocaleString()}
                                        subtext="Last 30 Days"
                                        icon={ShoppingBag}
                                        trend={8.4}
                                    />
                                    <MetricCard
                                        title="Active Customers"
                                        value={stats.totalCustomers.toLocaleString()}
                                        subtext="Total Registered"
                                        icon={Users}
                                        trend={5.2}
                                    />
                                    <MetricCard
                                        title="Avg Order Value"
                                        value={`रु ${Math.round(stats.avgOrderValue).toLocaleString()}`}
                                        subtext="Per Order"
                                        icon={TrendingUp}
                                    />
                                </div>

                                {/* Unified Product & Inventory Insights */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                                    {/* Market Performance Card */}
                                    <div className="bg-[#242424] p-8 md:p-10 rounded-[20px] text-white flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-500 min-h-[220px]">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-8 text-[#bef264]">
                                                <BarChart3 className="w-5 h-5" />
                                                <span className="text-sm font-medium opacity-90">Market & Inventory Insights</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                                {/* Total Sold */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-gray-400 mb-1">Total Sold</h3>
                                                    <p className="text-2xl font-semibold text-[#bef264] font-rubik tracking-tight">
                                                        {data?.productStats.totalSold.toLocaleString()}
                                                    </p>
                                                </div>
                                                
                                                {/* Catalog Size */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-gray-400 mb-1">Catalog Size</h3>
                                                    <p className="text-2xl font-semibold text-white font-rubik tracking-tight">
                                                        {data?.productStats.totalProducts.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* In Stock */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-gray-400 mb-1">In Stock</h3>
                                                    <p className="text-2xl font-semibold text-white font-rubik tracking-tight">
                                                        {data?.productStats.inStock.toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Out of Stock */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-gray-400 mb-1">Out of Stock</h3>
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-2xl font-semibold font-rubik tracking-tight ${(data?.productStats?.outOfStock ?? 0) > 0 ? 'text-red-400' : 'text-white'}`}>
                                                            {data?.productStats?.outOfStock.toLocaleString() ?? '0'}
                                                        </p>
                                                        {(data?.productStats?.outOfStock ?? 0) > 0 && (
                                                            <span className="px-1.5 py-0.5 bg-red-400/20 text-red-400 text-[10px] font-semibold rounded-md animate-pulse border border-red-400/20">ALERT</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 mt-8 flex items-center gap-4 pt-6 border-t border-white/5">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#242424] bg-white/10 flex items-center justify-center overflow-hidden shadow-sm">
                                                        <div className="w-full h-full bg-gradient-to-br from-[#bef264] to-[#86efac] opacity-60" />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-xs font-medium text-white/50 tracking-wide">Tracking metrics across all active orders and current inventory</span>
                                        </div>

                                        {/* Background Decoration */}
                                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
                                            <ShoppingBag className="w-64 h-64 rotate-12" />
                                        </div>
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#bef264] blur-[120px] opacity-10 group-hover:opacity-20 transition-opacity" />
                                    </div>

                                    {/* Store Health / Customer Insights Card */}
                                    <div className="bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] p-8 md:p-10 rounded-[20px] text-[#242424] flex flex-col justify-between relative overflow-hidden group transition-all duration-500 min-h-[220px]">
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 bg-[radial-gradient(#bef264_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500" />
                                        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#bef264] blur-[100px] opacity-[0.15] group-hover:opacity-40 transition-all duration-700" />
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-8 text-[#4d7c0f]">
                                                <Users className="w-5 h-5" />
                                                <span className="text-sm font-medium text-[#71717a]">Customer Insights</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                                {/* Total Customers */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-[#71717a] mb-1">Total Users</h3>
                                                    <p className="text-2xl font-semibold text-[#242424] font-rubik tracking-tight">
                                                        {data?.stats.totalCustomers.toLocaleString() || '0'}
                                                    </p>
                                                </div>
                                                
                                                {/* Active Sessions (Mock) */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-[#71717a] mb-1">Active Now</h3>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-2xl font-semibold text-[#242424] font-rubik tracking-tight">
                                                            24
                                                        </p>
                                                        <span className="w-2 h-2 bg-[#86efac] rounded-full animate-pulse shadow-[0_0_8px_0_#86efac]"></span>
                                                    </div>
                                                </div>

                                                {/* Returning Customers (Mock) */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-[#71717a] mb-1">Return Rate</h3>
                                                    <p className="text-2xl font-semibold text-[#242424] font-rubik tracking-tight">
                                                        18<span className="text-base text-[#a1a1aa] ml-0.5">%</span>
                                                    </p>
                                                </div>

                                                {/* Avg Order Value */}
                                                <div>
                                                    <h3 className="text-sm font-normal text-[#71717a] mb-1">Avg Order</h3>
                                                    <p className="text-2xl font-semibold text-[#242424] font-rubik tracking-tight">
                                                        रु {Math.round(data?.stats.avgOrderValue || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#bef264]/20 flex items-center justify-center text-[#4d7c0f]">
                                                    <TrendingUp className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-semibold text-[#71717a]">Customer growth up 12%</span>
                                            </div>
                                            <ArrowDownRight className="w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                                    {/* Simplified Revenue Chart */}
                                    <div className="lg:col-span-2 bg-white p-6 rounded-[12px] border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] h-[400px] flex flex-col">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-base font-semibold text-[#242424] font-rubik flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-[#242424]" />
                                                    Revenue Trend
                                                </h3>
                                                <p className="text-xs text-[#71717a] font-normal mt-1">Last 30 Days visualization</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#242424]" />
                                                <span className="text-xs font-semibold text-[#71717a]">Daily</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 px-1 relative">
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2 z-0">
                                                {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-gray-200"></div>)}
                                            </div>

                                            {chartData.slice(-15).map((item, i: number) => {
                                                const rev = item.revenue || 0;
                                                const heightPercent = (rev / chartMax) * 100;
                                                return (
                                                    <div key={i} className="relative flex-1 flex flex-col items-center group h-full justify-end min-w-0 z-10">
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#242424] text-white text-[10px] font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-[150] shadow-xl pointer-events-none scale-75 group-hover:scale-100 border border-white/10">
                                                            रु {rev.toLocaleString()}
                                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#242424]"></div>
                                                        </div>

                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                                                            transition={{ duration: 0.8, delay: i * 0.03, type: 'spring' }}
                                                            className={`w-full max-w-[20px] rounded-t-[4px] relative overflow-hidden transition-colors ${heightPercent > 0 ? 'bg-[#242424] group-hover:bg-[#bef264]' : 'bg-gray-100'}`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Shortcuts or Mini Info Panel */}
                                    <div className="bg-[#242424] p-8 rounded-[12px] text-white overflow-hidden relative h-full flex flex-col">
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-center gap-2 mb-4 text-[#bef264]">
                                                <Zap className="w-5 h-5" />
                                                <span className="text-sm font-semibold">Quick Actions</span>
                                            </div>
                                            <h3 className="text-2xl font-semibold font-rubik mb-2">Store Management</h3>
                                            <p className="text-gray-400 text-sm mb-6 max-w-md font-normal">Frequently used shortcuts and store operations.</p>

                                            <div className="flex flex-col gap-3 mt-auto">
                                                <Link href="/admin/orders/create" className="bg-[#bef264] text-[#242424] px-6 py-3 rounded-[10px] font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-center w-full block">
                                                    <span className="flex items-center justify-center gap-2">
                                                        Create Manual Order
                                                        <ArrowUpRight className="w-4 h-4 opacity-70" />
                                                    </span>
                                                </Link>
                                                <Link href="/admin/abandoned-carts" className="bg-white/10 text-white px-6 py-3 rounded-[10px] font-semibold text-sm hover:bg-white/20 transition-all text-center w-full block">
                                                    <span className="flex items-center justify-center gap-2">
                                                        Abandoned Carts
                                                        <ArrowUpRight className="w-4 h-4 opacity-70" />
                                                    </span>
                                                </Link>
                                                <div className="flex gap-3">
                                                    <Link href="/admin/products/add" className="flex-1 bg-white/10 text-white px-4 py-3 rounded-[10px] font-semibold text-sm hover:bg-white/20 transition-all text-center block whitespace-nowrap">
                                                        <span className="flex items-center justify-center gap-1.5">
                                                            Add Product
                                                            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                                                        </span>
                                                    </Link>
                                                    <Link href="/admin/coupons" className="flex-1 bg-white/10 text-white px-4 py-3 rounded-[10px] font-semibold text-sm hover:bg-white/20 transition-all text-center block whitespace-nowrap">
                                                        <span className="flex items-center justify-center gap-1.5">
                                                            Coupons
                                                            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -right-10 -bottom-10 opacity-10">
                                            <ShoppingBag className="w-64 h-64" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Recent Orders Table */}
                        <div className="grid grid-cols-1">
                            <div className="bg-white rounded-[12px] border border-gray-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                            <History className="w-4 h-4 text-[#242424]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-[#242424]">Recent Orders</h3>
                                            <p className="text-xs text-[#71717a] font-normal mt-0.5">Latest activity</p>
                                        </div>
                                    </div>
                                    <Link href="/admin/orders" className="text-xs font-semibold text-[#242424] bg-gray-50 hover:bg-gray-100 border border-gray-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                                        View All
                                        <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-gray-50/50 text-[#71717a] text-xs font-semibold border-b border-gray-100">
                                                <th className="px-6 py-4">Order Info</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredOrders.length > 0 ? filteredOrders.slice(0, 10).map((order) => (
                                                <tr key={order.id} className="group hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-[#242424] truncate max-w-[200px]">
                                                                {order.title || 'Products'}
                                                            </span>
                                                            <span className="text-[11px] text-[#71717a] font-normal mt-1 bg-gray-100 px-1.5 py-0.5 rounded-md inline-block w-fit border border-gray-200">
                                                                #{order.shortId}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-[#242424]">{order.customerName || 'Guest'}</span>
                                                            {order.customerPhone && <span className="text-[11px] text-[#a1a1aa] font-normal mt-0.5">{order.customerPhone}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${order.status === 'DELIVERED' ? 'bg-[#bef264]/20 text-[#4d7c0f] border border-[#bef264]/30' :
                                                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                'bg-amber-50 text-amber-600 border border-amber-100'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-[#71717a] font-normal">{order.dateText}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-sm font-semibold text-[#242424]">रु {(order.totalAmount || 0).toLocaleString()}</span>
                                                            <span className="text-[11px] text-[#a1a1aa] font-normal mt-0.5 capitalize">{order.paymentMethod}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-[12px] font-semibold text-[#a1a1aa]">
                                                        No recent orders found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
