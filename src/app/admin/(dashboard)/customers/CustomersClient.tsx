'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AdminModal from '@/components/admin/shared/AdminModal';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import CustomerActionMenu from '@/components/admin/customers/CustomerActionMenu';
import CustomerFilters from '@/components/admin/customers/CustomerFilters';
import {
    fetchCustomerManagementDataAction,
    deleteCustomerAction,
    CustomerData,
    CustomerStats
} from '@/app/actions/customerActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';
import { AlertTriangle, Trash2, Users, Star, Zap, UserPlus, ArrowUpRight, Zap as ZapIcon, Trophy, TrendingUp, Medal, ChevronLeft, ChevronRight } from 'lucide-react';

import CustomerDetailsModal from '@/components/admin/customers/CustomerDetailsModal';

// --- Types ---
type FilterStatus = 'all' | 'active' | 'new' | 'vip' | 'at_risk';

// --- Shared KPI Component ---
const MetricCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 group hover:bg-gray-50/50 transition-all duration-500"
    >
        <div className="flex justify-between items-start">
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-[#242424] group-hover:text-white transition-colors duration-300">
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                    <span className="text-[10px] font-bold text-green-600">{trend}%</span>
                </div>
            )}
        </div>
        <div>
            <p className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-semibold text-[#242424] tracking-tighter">{value}</h3>
            <p className="text-[10px] text-[#a1a1aa] font-normal mt-1 uppercase tracking-wider">{subValue}</p>
        </div>
    </motion.div>
);

// --- Customer Card (Grid View - Parity with OrderCard) ---
const DashboardCustomerCard = ({
    customer,
    isNew,
    onDelete,
    onClick
}: {
    customer: CustomerData,
    isNew?: boolean,
    onDelete?: (c: CustomerData) => void,
    onClick?: (c: CustomerData) => void
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const getStatusColors = (status: string, isConstant?: boolean) => {
        if (status === 'vip') return { bg: 'bg-[#242424]', text: 'text-white', border: 'border-[#242424]', dot: 'bg-white' };
        if (isConstant) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' };

        // Active and New
        return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', dot: 'bg-gray-400' };
    };

    const colors = getStatusColors(customer.status, customer.behavior.monthlyConsistency);

    return (
        <article
            onClick={() => !isMenuOpen && onClick?.(customer)}
            className={`flex w-full max-w-[378px] mx-auto flex-col rounded-[12px] relative group transition-all duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] font-rubik tracking-tight hover:-translate-y-[2px] border cursor-pointer ${isMenuOpen ? 'z-[60]' : 'z-[1]'} ${isNew ? 'border-transparent' : 'bg-white border-gray-100'}`}
            style={isNew ? {
                background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #ffffff, #18181b) border-box',
                border: '1px solid transparent',
            } : {}}
        >
            <div className="flex flex-col w-full h-full relative">
                <header className={`flex px-[14px] py-[12px] justify-between items-center self-stretch shrink-0 ${colors.bg} relative z-[20] rounded-t-[12px] transition-colors duration-300`}>
                    <div className="flex gap-[8px] items-center shrink-0 relative z-[2]">
                        <span className={`shrink-0 text-[13px] font-[400] opacity-70 text-[#71717a] uppercase tracking-wider`}>Tier:</span>
                        <span className={`text-[13px] font-semibold uppercase  ${colors.text}`}>
                            {customer.behavior.monthlyConsistency ? 'Constant' : customer.status}
                        </span>
                    </div>
                    <CustomerActionMenu
                        customer={customer}
                        onOpenChange={setIsMenuOpen}
                        onDelete={onDelete}
                    />
                </header>

                <div className="flex p-[14px] flex-col gap-[16px] items-start self-stretch grow relative z-[1]">
                    <div className="flex items-center justify-between self-stretch shrink-0 relative z-[10]">
                        <div className="flex items-center gap-[6px]">
                            <h3 className="shrink-0 text-[12px] font-[400] leading-[14px] text-[#71717a] uppercase tracking-wider whitespace-nowrap">
                                Joined On {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h3>
                            {isNew && (
                                <span className="flex h-[18px] px-[6px] py-[2px] justify-center items-center shrink-0 bg-[#242424] text-white rounded-[4px] text-[9px] font-bold tracking-wider animate-pulse">
                                    NEW
                                </span>
                            )}
                        </div>
                        {customer.behavior.monthlyConsistency && (
                            <span className="flex items-center gap-1 text-[10px] text-[#242424] font-bold uppercase tracking-tighter">
                                <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" /> Constant
                            </span>
                        )}
                    </div>

                    <div className="flex gap-[12px] items-center self-stretch relative z-[13]">
                        <div className="w-[64px] h-[64px] shrink-0 rounded-2xl relative overflow-hidden bg-[#f4f4f5] z-[14] border border-[#f5f5f5] flex items-center justify-center shadow-inner">
                            {customer.avatar && !imgError ? (
                                <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <span className="text-xl font-bold text-gray-300">{customer.name[0]}</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-[4px] justify-center items-start self-stretch grow relative z-[15] overflow-hidden">
                            <h4 className="text-[15px] font-semibold text-[#242424] truncate w-full group-hover:text-blue-600 transition-colors">
                                {customer.name}
                            </h4>
                            <span className="text-[11px] text-[#71717a] truncate w-full font-normal tracking-tight">
                                {customer.email}
                            </span>
                            <span className="text-[11px] text-[#71717a] truncate w-full font-normal tracking-tight">
                                {customer.phone}
                            </span>
                        </div>
                    </div>

                    <div className="flex h-[72px] items-start self-stretch shrink-0 rounded-[8px] border-[1px] border-[#f3f4f6] relative overflow-hidden z-[24] bg-white mt-2">
                        <div className="flex w-[68px] px-[12px] py-[10px] flex-col gap-[4px] items-start self-stretch shrink-0 border-r-[1px] border-[#f3f4f6] relative z-[25]">
                            <span className="shrink-0 text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-wider">Orders</span>
                            <span className="shrink-0 text-[14px] font-semibold text-[#242424]">{customer.behavior.totalOrders}</span>
                        </div>
                        <div className="flex px-[12px] py-[10px] flex-col gap-[4px] items-start self-stretch grow basis-[0px] relative z-[28] overflow-hidden border-r-[1px] border-[#f3f4f6]">
                            <span className="shrink-0 text-[9px] font-semibold text-[#a1a1aa] uppercase tracking-wider">AOV</span>
                            <span className="text-[13px] font-semibold text-[#242424] truncate">रु {Math.round(customer.behavior.avgOrderValue).toLocaleString()}</span>
                        </div>
                        <div className={`flex w-[100px] px-[12px] py-[10px] flex-col gap-[4px] items-start self-stretch shrink-0 ${customer.status === 'vip' ? 'bg-[#242424]' : 'bg-gray-50/50'} relative z-[31]`}>
                            <span className={`shrink-0 text-[9px] font-semibold ${customer.status === 'vip' ? 'text-white/70' : 'text-[#a1a1aa]'} uppercase tracking-wider`}>LTV Amount</span>
                            <span className={`shrink-0 text-[14px] font-semibold ${customer.status === 'vip' ? 'text-white' : 'text-[#242424]'}`}>रु {customer.behavior.totalSpent.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default function CustomersClient({ initialData }: { initialData?: { customers: CustomerData[]; stats: CustomerStats } | null }) {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(!initialData);
    const [data, setData] = useState<{ customers: CustomerData[]; stats: CustomerStats } | null>(initialData || null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
    const [sortBy, setSortBy] = useState('newest'); // default to newest first
    const [seenIds, setSeenIds] = useState<string[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Deletion State
    const [customerToDelete, setCustomerToDelete] = useState<CustomerData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Details Modal State
    const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState<CustomerData | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { showAdminToast } = useAdminToast();

    // Reset pagination on filter or view mode change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery, viewMode]);

    const { setPrimaryAction, setOverrideTitle } = useAdminUI();

    useEffect(() => {
        setIsMounted(true);
        setOverrideTitle(null);
        setPrimaryAction(null);

        // 1. Load seen IDs from localStorage
        const stored = localStorage.getItem('snp_admin_seen_customers');
        let currentSeen: string[] = [];
        if (stored) {
            try {
                currentSeen = JSON.parse(stored);
                setSeenIds(currentSeen);
            } catch (e) {
                console.error('Failed to parse seen customers');
            }
        }

        if (!initialData) {
            loadData();
        } else {
             // 2. If data is already loaded via SSR, mark these current IDs as "seen" for the NEXT visit
             const allIds = initialData.customers.map(c => c.id);
             const updatedSeen = Array.from(new Set([...currentSeen, ...allIds]));
             localStorage.setItem('snp_admin_seen_customers', JSON.stringify(updatedSeen));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchCustomerManagementDataAction();
        if (res.success && res.data) {
            setData(res.data);

            // 2. After data is loaded, mark these current IDs as "seen" for the NEXT visit
            const allIds = res.data.customers.map(c => c.id);
            const stored = localStorage.getItem('snp_admin_seen_customers');
            const currentSeen = stored ? JSON.parse(stored) : [];
            const updatedSeen = Array.from(new Set([...currentSeen, ...allIds]));
            localStorage.setItem('snp_admin_seen_customers', JSON.stringify(updatedSeen));
        } else {
            showAdminToast(res.message || 'Failed to load customers', 'error');
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;
        setIsDeleting(true);

        const res = await deleteCustomerAction(customerToDelete.id);
        if (res.success) {
            showAdminToast('Customer deleted permanently', 'success');
            setCustomerToDelete(null);
            loadData(); // Refresh list
        } else {
            showAdminToast(res.message || 'Failed to delete customer', 'error');
        }
        setIsDeleting(false);
    };

    const allFiltered = useMemo(() => {
        if (!data) return [];
        let filtered = data.customers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.phone.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // Apply Sorting
        return [...filtered].sort((a, b) => {
            if (sortBy === 'ltv') return b.behavior.totalSpent - a.behavior.totalSpent;
            if (sortBy === 'frequent') return b.behavior.totalOrders - a.behavior.totalOrders;
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'alpha') return a.name.localeCompare(b.name);
            return 0;
        });
    }, [data, searchQuery, statusFilter, sortBy]);

    // Grouping logic for "Recently Joined" (within last 7 days AND not seen before)
    const { recently, others } = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recently = allFiltered.filter(c => {
            const joinDate = new Date(c.createdAt);
            const isWithinTime = joinDate >= sevenDaysAgo;
            const isNotSeen = !seenIds.includes(c.id);
            return isWithinTime && isNotSeen;
        });

        const others = allFiltered.filter(c => !recently.includes(c));
        return { recently, others };
    }, [allFiltered, seenIds]);

    const insights = useMemo(() => {
        if (!data || data.customers.length === 0) return null;
        const customers = [...data.customers];

        const topSpender = customers[0]; // Sorted by LTV desc in action
        const highestAOV = [...customers].sort((a, b) => b.behavior.avgOrderValue - a.behavior.avgOrderValue)[0];
        const mostOrders = [...customers].sort((a, b) => b.behavior.totalOrders - a.behavior.totalOrders)[0];

        return { topSpender, highestAOV, mostOrders };
    }, [data]);

    const PAGE_SIZE = viewMode === 'grid' ? 8 : 20;
    const totalPages = Math.ceil(others.length / PAGE_SIZE);
    const paginatedOthers = others.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (!isMounted) return null;

    const renderGrid = (list: CustomerData[]) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((c) => (
                <DashboardCustomerCard
                    key={c.id}
                    customer={c}
                    isNew={recently.includes(c)}
                    onDelete={setCustomerToDelete}
                    onClick={(customer) => {
                        setSelectedCustomerForDetails(customer);
                        setIsDetailsOpen(true);
                    }}
                />
            ))}
        </div>
    );

    const renderTable = (list: CustomerData[]) => (
        <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white font-rubik">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                    <tr className="border-b border-gray-50 bg-[#fafafa]">
                        <th className="py-4 px-6 w-[40px] border-b border-gray-100 first:rounded-tl-[12px]">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#242424] cursor-pointer" />
                        </th>
                        <th className="py-4 px-6 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-b border-gray-100">Customer</th>
                        <th className="py-4 px-6 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-b border-gray-100">Contact</th>
                        <th className="py-4 px-6 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-b border-gray-100">Behavior</th>
                        <th className="py-4 px-6 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-b border-gray-100 text-right">LTV Metric</th>
                        <th className="py-4 px-6 text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-widest border-b border-gray-100 text-center last:rounded-tr-[12px]">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {list.map((c) => (
                        <tr
                            key={c.id}
                            className="group hover:bg-[#fafafa] transition-colors duration-200 cursor-pointer"
                            onClick={() => {
                                setSelectedCustomerForDetails(c);
                                setIsDetailsOpen(true);
                            }}
                        >
                            <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#242424] cursor-pointer" />
                            </td>
                            <td className="py-5 px-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[13px] font-bold text-gray-400 border border-gray-200 shadow-sm overflow-hidden">
                                        {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : c.name[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-semibold text-[#242424] tracking-tight">{c.name}</span>
                                        <span className="text-[11px] text-[#a1a1aa] font-normal">ID: {c.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 px-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[13px] font-normal text-[#71717a]">{c.email}</span>
                                    <span className="text-[11px] text-[#a1a1aa]">{c.phone}</span>
                                </div>
                            </td>
                            <td className="py-5 px-6">
                                <div className="flex items-center gap-3">
                                    <div className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase tracking-widest ${c.status === 'vip' ? 'bg-[#242424] border-[#242424] text-white' :
                                            c.behavior.monthlyConsistency ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                'bg-gray-50 border-gray-100 text-gray-500'
                                        }`}>
                                        {c.behavior.monthlyConsistency ? 'Constant' : c.status}
                                    </div>
                                    {c.behavior.monthlyConsistency && (
                                        <div className="flex items-center gap-1 text-[#242424] text-[10px] font-bold uppercase">
                                            <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-5 px-6 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="text-[15px] font-semibold text-[#242424] tracking-tighter">रु {c.behavior.totalSpent.toLocaleString()}</span>
                                    <span className="text-[10px] text-[#a1a1aa] font-semibold uppercase tracking-wider">{c.behavior.totalOrders} Orders</span>
                                </div>
                            </td>
                            <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-center">
                                    <CustomerActionMenu
                                        customer={c}
                                        onDelete={setCustomerToDelete}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const Pagination = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex items-center justify-between px-2 py-6 border-t border-gray-50 mt-4 font-rubik">
                <p className="text-[12px] font-normal text-[#a1a1aa]">
                    Showing <span className="text-[#242424] font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="text-[#242424] font-semibold">{Math.min(currentPage * PAGE_SIZE, others.length)}</span> of <span className="text-[#242424] font-semibold">{others.length}</span> customers
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-[#242424]" />
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-all ${currentPage === i + 1 ? 'bg-[#242424] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-[#242424]" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik tracking-tight">
            {/* DynamicAdminNav is now in Layout */}

            <AdminSubNav
                showViewMode
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSearch={setSearchQuery}
                onRefresh={loadData}
                refreshLoading={isLoading}
                searchPlaceholder="Search customers by name, email or phone..."
                filterDropdown={
                    <CustomerFilters
                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />
                }
            />

            <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px] flex flex-col gap-10">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : data && (
                    <>
                        {!searchQuery && (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <MetricCard
                                        title="All Customers"
                                        value={data.stats.totalCustomers.toLocaleString()}
                                        subValue="Registered Users"
                                        icon={Users}
                                    />
                                    <MetricCard
                                        title="Active Monthly"
                                        value={data.stats.activeCustomers.toLocaleString()}
                                        subValue="Constant Shoppers"
                                        icon={Zap}
                                        trend={12.4}
                                    />
                                    <MetricCard
                                        title="New Growth"
                                        value={data.stats.newThisMonth.toLocaleString()}
                                        subValue="Past 30 Days"
                                        icon={UserPlus}
                                        trend={5.2}
                                    />
                                    <MetricCard
                                        title="VIP Loyalty"
                                        value={data.stats.highValueCustomers.toLocaleString()}
                                        subValue="High LTV Segment"
                                        icon={Star}
                                    />
                                </div>

                                {/* Monthly Insights Section */}
                                {insights && (
                                    <div className="flex flex-col gap-4">
                                        <h2 className="text-[12px] font-semibold text-[#71717a] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Monthly Insights
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 group transition-all duration-500">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#242424] group-hover:bg-[#242424] group-hover:text-white transition-all duration-300">
                                                    <Trophy className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider">Highest Spender</span>
                                                    <span className="text-[15px] font-semibold text-[#242424] truncate max-w-[150px]">{insights.topSpender.name}</span>
                                                    <span className="text-[11px] text-[#242424] font-semibold">रु {insights.topSpender.behavior.totalSpent.toLocaleString()} LTV</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 group transition-all duration-500">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#242424] group-hover:bg-[#242424] group-hover:text-white transition-all duration-300">
                                                    <ZapIcon className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-widest">Most Frequent</span>
                                                    <span className="text-[15px] font-semibold text-[#242424] truncate max-w-[150px]">{insights.mostOrders.name}</span>
                                                    <span className="text-[11px] text-[#242424] font-semibold">{insights.mostOrders.behavior.totalOrders} Orders Placed</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 group transition-all duration-500">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#242424] group-hover:bg-[#242424] group-hover:text-white transition-all duration-300">
                                                    <Medal className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-widest">Highest AOV</span>
                                                    <span className="text-[15px] font-semibold text-[#242424] truncate max-w-[150px]">{insights.highestAOV.name}</span>
                                                    <span className="text-[11px] text-[#242424] font-semibold">रु {Math.round(insights.highestAOV.behavior.avgOrderValue).toLocaleString()} Average</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {recently.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h2 className="text-[12px] font-semibold text-[#71717a] uppercase tracking-[0.2em] px-1">Recently Joined</h2>
                                {viewMode === 'grid' ? renderGrid(recently) : renderTable(recently)}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mt-4">
                            <h2 className="text-[12px] font-bold text-[#71717a] uppercase tracking-[0.2em] px-1">
                                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Customers'}
                            </h2>
                            {viewMode === 'grid' ? renderGrid(paginatedOthers) : renderTable(paginatedOthers)}
                            <Pagination />

                            {others.length === 0 && recently.length === 0 && (
                                <div className="py-[100px] text-center bg-white border border-gray-100 rounded-[12px]">
                                    <p className="text-[#a1a1aa] text-sm font-medium">No customers found matching your filters.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={!!customerToDelete}
                onClose={() => !isDeleting && setCustomerToDelete(null)}
                title="Delete Customer Profile"
                maxWidth="max-w-md"
                footerActions={
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={() => setCustomerToDelete(null)}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isDeleting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h4 className="text-[15px] font-bold text-[#242424] mb-2">Are you absolutely sure?</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                        You are about to delete <span className="font-bold text-[#242424]">{customerToDelete?.name}</span>. This action is irreversible and will remove all their access and profile data from the platform.
                    </p>
                </div>
            </AdminModal>

            <CustomerDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                customer={selectedCustomerForDetails}
            />
        </div>
    );
}
