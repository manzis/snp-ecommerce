'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminSheet from '@/components/admin/shared/AdminSheet';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CustomerData,
    fetchDetailedCustomerDataAction
} from '@/app/actions/customerActions';
import { useAdminToast } from '../ui/AdminToastProvider';
import {
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    ShoppingCart,
    Eye,
    Target,
    Zap,
    Clock,
    ChevronRight,
    TrendingUp,
    Package,
    ExternalLink,
    History,
    Gift,
    MessageCircle
} from 'lucide-react';
import CustomerOfferModal from './CustomerOfferModal';

interface CustomerDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerData | null;
}

export default function CustomerDetailsModal({
    isOpen,
    onClose,
    customer
}: CustomerDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<any>(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const { showAdminToast } = useAdminToast();

    useEffect(() => {
        if (isOpen && customer) {
            loadCustomerDetails();
        } else if (!isOpen) {
            setDetails(null);
        }
    }, [isOpen, customer]);

    const loadCustomerDetails = async () => {
        if (!customer) return;
        setLoading(true);
        const res = await fetchDetailedCustomerDataAction(customer.id);
        if (res.success) {
            setDetails(res.data);
        } else {
            showAdminToast(res.message || 'Failed to load details', 'error');
        }
        setLoading(false);
    };

    if (!customer) return null;

    const kpis = [
        {
            label: 'Success Buy Rate',
            value: `${details?.metrics?.successBuyRate || 0}%`,
            icon: Target,
            color: 'text-[#242424]',
            bg: 'bg-gray-50'
        },
        {
            label: 'Total Lifetime Value',
            value: `रु ${(details?.metrics?.ltv || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-[#242424]',
            bg: 'bg-gray-50'
        },
        {
            label: 'Avg. Order Value',
            value: `रु ${(details?.metrics?.aov || 0).toLocaleString()}`,
            icon: Zap,
            color: 'text-[#242424]',
            bg: 'bg-gray-50'
        },
        {
            label: 'Active Cart Items',
            value: details?.metrics?.cartItemsCount || 0,
            icon: ShoppingCart,
            color: 'text-[#242424]',
            bg: 'bg-gray-50'
        }
    ];

    return (
        <AdminSheet
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#71717a]" />
                    <span>Customer Intelligence</span>
                </div>
            }
            description={`Profile Overview for ${customer?.name || ''}`}
        >
            <div className="space-y-10 pb-10">
                {/* Section 1: Identity Header */}
                <section className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center shrink-0">
                        {customer?.avatar ? (
                            <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-gray-200" />
                        )}
                    </div>
                    <div className="flex-1 flex flex-col items-center md:items-start gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[18px] font-semibold text-[#242424] tracking-tight">{customer?.name || ''}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest ${customer?.status === 'vip' ? 'bg-[#242424] text-white' : 'bg-gray-100 text-[#71717a]'
                                }`}>
                                {customer?.status || 'Customer'}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-4 mt-2">
                            <div className="flex items-center gap-1.5 text-[12px] text-[#71717a] font-normal">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#71717a] font-normal">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#71717a] font-normal">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Joined {customer.createdAt}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Core Metrics (KPIs) */}
                <section className="grid grid-cols-2 gap-4">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-all duration-500 group cursor-default">
                            <div className={`w-9 h-9 bg-gray-50 text-[#242424] group-hover:bg-[#242424] group-hover:text-white rounded-xl flex items-center justify-center mb-3 transition-colors duration-300`}>
                                <kpi.icon className="w-4.5 h-4.5" />
                            </div>
                            <p className="text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1">{kpi.label}</p>
                            <h4 className="text-[15px] font-semibold text-[#242424] tracking-tight">{loading ? '...' : kpi.value}</h4>
                        </div>
                    ))}
                </section>

                {/* Section 3: Active Orders & Lifecycle */}
                <section className="space-y-4">
                    <h4 className="text-[12px] font-semibold text-[#71717a] flex items-center gap-2 uppercase tracking-widest">
                        <Clock className="w-4 h-4" /> Active Fulfillments
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                        {loading ? (
                            <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                        ) : details?.activeOrders?.length > 0 ? (
                            details.activeOrders.map((order: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#242424] border border-gray-100">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-semibold text-[#242424]">Order #{order.shortId || order.id.slice(0, 8)}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-normal text-[#a1a1aa] uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] font-semibold text-[#242424] uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{order.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[14px] font-semibold text-[#242424]">रु {order.totalAmount?.toLocaleString()}</p>
                                        <p className="text-[10px] text-[#a1a1aa] font-medium uppercase tracking-widest">{order.itemsCount || 0} Items</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center bg-gray-50/50 border border-dashed rounded-xl">
                                <p className="text-[12px] text-gray-400 font-medium">No orders in processing state</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 4: Purchase History Overview */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-semibold text-[#71717a] flex items-center gap-2 uppercase tracking-widest">
                            <History className="w-4 h-4" /> Order History
                        </h4>
                        <span className="text-[10px] text-[#a1a1aa] font-semibold uppercase tracking-wider">{details?.orders?.length || 0} Total</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                        {loading ? (
                            <div className="h-40 bg-gray-50 animate-pulse" />
                        ) : details?.orders?.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {details.orders.slice(0, 5).map((order: any, i: number) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-semibold text-[#242424]">#{order.shortId || order.id.slice(0, 8)}</span>
                                                <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${order.status === 'DELIVERED' ? 'bg-[#242424] text-white' : 'bg-gray-100 text-[#71717a]'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-[#a1a1aa] font-normal uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-[13px] font-semibold text-[#242424]">रु {order.totalAmount?.toLocaleString()}</span>
                                            <span className={`text-[9px] font-semibold uppercase ${order.paymentStatus === 'paid' ? 'text-[#242424]' : 'text-[#71717a]'
                                                }`}>
                                                {order.paymentStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {details?.orders?.length > 5 && (
                                    <button className="w-full py-3 text-[11px] font-semibold text-[#71717a] hover:text-[#242424] transition-colors bg-gray-50/50 uppercase tracking-widest border-t border-gray-50">
                                        View Full History ({details.orders.length})
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-[12px] text-gray-400 font-medium italic">No purchase history available</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 5: Behavioral Analysis (Recent Activity & Active Cart) */}
                <div className="space-y-8 pt-4 border-t border-gray-100">
                    {/* Currently Viewing */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-semibold text-[#71717a] flex items-center gap-2 uppercase tracking-widest">
                                <Eye className="w-4 h-4" /> Recent Activity
                            </h4>
                            <span className="text-[10px] text-[#a1a1aa] font-semibold uppercase tracking-wider">{details?.metrics?.totalViews || 0} Views</span>
                        </div>
                        <div className="space-y-2">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)
                            ) : details?.views?.length > 0 ? (
                                details.views.slice(0, 3).map((product: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group">
                                        <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-100 bg-white shrink-0">
                                            <img src={product.images?.[0] || '/images/protein.webp'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold text-[#242424] truncate">{product.name}</p>
                                            <p className="text-[9px] text-[#a1a1aa] font-semibold uppercase tracking-tight">{product.brands?.name || 'SNP'}</p>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#242424] transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-gray-400 italic py-4 text-center border border-dashed rounded-lg">No recent viewing history</p>
                            )}
                        </div>
                    </section>

                    {/* Current Cart Status */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-semibold text-[#71717a] flex items-center gap-2 uppercase tracking-widest">
                                <ShoppingCart className="w-4 h-4" /> Active Cart
                            </h4>
                            <span className="text-[10px] text-[#a1a1aa] font-semibold uppercase tracking-wider">{details?.metrics?.cartItemsCount || 0} Items</span>
                        </div>
                        <div className="space-y-2">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)
                            ) : details?.cartItems?.length > 0 ? (
                                details.cartItems.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-lg border border-gray-100">
                                        <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-100 bg-white shrink-0">
                                            <img src={item.product?.images?.[0] || '/images/protein.webp'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold text-[#242424] truncate">{item.product?.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-semibold text-[#242424] bg-white border border-gray-100 px-1.5 py-0.5 rounded">Qty: {item.quantity}</span>
                                                <span className="text-[10px] font-semibold text-[#242424]">रु {item.product?.discounted_price?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[11px] text-gray-400 italic py-4 text-center border border-dashed rounded-lg">Cart is currently empty</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Section 6: Direct Actions */}
                <section className="mt-8 pt-8 border-t border-gray-100">
                    <button
                        onClick={() => setIsOfferModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 p-3.5 bg-[#242424] text-white rounded-xl hover:bg-black transition-all group overflow-hidden relative shadow-lg shadow-black/5"
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Zap className="w-4 h-4 text-white" />
                        <span className="text-[14px] font-medium">Send an Exclusive Offer</span>
                    </button>
                </section>

                {customer && (
                    <CustomerOfferModal
                        isOpen={isOfferModalOpen}
                        onClose={() => setIsOfferModalOpen(false)}
                        customer={customer}
                    />
                )}
            </div>
        </AdminSheet>
    );
}
