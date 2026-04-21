'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { OrderProps, OrderStatus } from '@/components/orders/OrderCard';
import AdminSheet from '@/components/admin/shared/AdminSheet';
import TickIcon from '@/components/icons/TickIcon';
import CaretDownIcon from '@/components/icons/CaretDownIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: (OrderProps & { payment_screenshot_url?: string; payment_remarks?: string }) | null;
    onUpdateStatus?: (order: OrderProps) => void;
    onCancelOrder?: (order: OrderProps) => void;
}

// Timeline Rank Configuration
const STATUS_RANK: Record<string, number> = {
    'PENDING': 1, 'CONFIRMED': 2, 'PROCESSING': 3,
    'SHIPPED': 4, 'IN_TRANSIT': 5, 'SHIPMENT_ARRIVED': 6,
    'OUT_FOR_DELIVERY': 7, 'DELIVERED': 8,
    'RETURNED': 8, 'FAILED': 8, 'CANCELLED': 8,
    'RESCHEDULED': 8
};

// Timeline lifecycle milestones
const MILESTONES = [
    { id: 'ORDERED', label: 'Order Placed', rankRange: [1, 3] },
    { id: 'SHIPPED', label: 'Processing & Shipping', rankRange: [4, 6] },
    { id: 'DELIVERY', label: 'Out for Delivery / Final', rankRange: [7, 8] }
];

export default function OrderDetailsModal({ 
    isOpen, 
    onClose, 
    order,
    onUpdateStatus,
    onCancelOrder
}: OrderDetailsModalProps) {
    const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set(['ORDERED']));

    // Auto-expand the active milestone on mount or status change
    React.useEffect(() => {
        if (!order) return;
        const normalizedStatus = order.status.toUpperCase() as OrderStatus;
        const currentRank = STATUS_RANK[normalizedStatus] || 1;
        const activeMilestone = MILESTONES.find(m => currentRank >= m.rankRange[0] && currentRank <= m.rankRange[1]);
        if (activeMilestone) {
            setExpandedMilestones(new Set([activeMilestone.id]));
        }
    }, [order]);

    const getRelativeDate = (dateStr?: string): string => {
        if (!dateStr) return '';
        const orderDate = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - orderDate.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHrs = Math.floor(diffMins / 60);

        if (diffMins < 5) return 'just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHrs < 12) return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hrs'} ago`;

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
        const orderTime = orderDate.getTime();

        if (orderTime >= startOfToday) return 'Today';
        if (orderTime >= startOfYesterday) return 'yesterday';

        // Format: Apr 14 Thu
        const month = orderDate.toLocaleDateString('en-US', { month: 'short' });
        const day = orderDate.getDate();
        const weekday = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
        return `${month} ${day} ${weekday}`;
    };

    if (!order) return null;

    const normalizedStatus = order.status.toUpperCase() as OrderStatus;
    const currentRank = STATUS_RANK[normalizedStatus] || 1;

    // Config for status pill signaling
    const DEFAULT_STYLE = { text: 'text-[#71717a]', bg: 'bg-gray-50', border: 'border-gray-100' };
    const statusConfig: Record<string, { text: string; bg: string; border: string }> = {
        PENDING: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
        CONFIRMED: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
        PROCESSING: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        SHIPPED: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
        IN_TRANSIT: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
        DELIVERED: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
        CANCELLED: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
        FAILED: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
        RETURNED: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
        RESCHEDULED: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
    };

    const currentConfig = statusConfig[normalizedStatus] || DEFAULT_STYLE;

    const toggleMilestone = (id: string) => {
        setExpandedMilestones(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const footerActions = (
        <div className="flex w-full gap-3">
            <button
                onClick={() => onCancelOrder?.(order)}
                className="flex-1 px-4 py-3.5 text-[13px] font-medium text-[#71717a] bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all active:scale-95"
            >
                Cancel Order
            </button>
            <button
                onClick={() => onUpdateStatus?.(order)}
                className="flex-[2] px-4 py-3.5 text-[13px] font-medium text-white bg-[#242424] rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
            >
                Update Fulfillment Status
            </button>
        </div>
    );

    return (
        <AdminSheet
            isOpen={isOpen}
            onClose={onClose}
            title={`Order Fulfillment`}
            description={`#${order.shortId} — Ordered ${getRelativeDate(order.createdAt)}`}
            footerActions={footerActions}
        >
            <div className="space-y-12">
                
                {/* Section 1: Ordered Items (The manifest user wants at top) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Ordered Items</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    <div className="border border-dotted border-gray-300 rounded-[6px] divide-y divide-dotted divide-gray-300 overflow-hidden bg-white">
                        {(!order.order_items || order.order_items.length === 0) && (
                            <div className="px-5 py-8 text-center">
                                <p className="text-[12px] text-[#a1a1aa]">No item details available.</p>
                            </div>
                        )}

                        {order.order_items?.map((item, idx) => (
                            <div key={idx} className="p-4 flex gap-4 items-center">
                                {/* Thumbnail */}
                                <div className="w-14 h-14 bg-zinc-50 rounded-[6px] border border-gray-100 relative shrink-0 overflow-hidden">
                                    <Image
                                        src={item.products?.images?.[0] || order.image || '/images/product.png'}
                                        alt={item.products?.name || order.title || 'Product'}
                                        fill
                                        className="object-contain p-1.5"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] text-[#a1a1aa] uppercase font-medium tracking-wider block">
                                        {item.products?.brands?.name || order.brand || '—'}
                                    </span>
                                    <h5 className="text-[13px] font-medium text-[#242424] truncate leading-snug mt-0.5">
                                        {item.products?.name || order.title || 'Product'}
                                    </h5>
                                    {/* Size, Flavor, Qty, Price — all inline below name */}
                                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                        {item.selected_size && (
                                            <span className="text-[11px] font-mono text-[#71717a] bg-zinc-50 border border-gray-100 rounded px-1.5 py-0.5">
                                                {item.selected_size}
                                            </span>
                                        )}
                                        {item.selected_flavor && (
                                            <span className="text-[11px] text-[#71717a]">{item.selected_flavor}</span>
                                        )}
                                        <span className="text-[11px] text-[#a1a1aa]">·</span>
                                        <span className="text-[11px] font-medium text-black">×{item.quantity}</span>
                                        <span className="text-[11px] font-bold text-black ml-auto">Rs. {item.price * item.quantity}</span>
                                        {item.mrp > item.price && (
                                            <span className="text-[10px] text-[#a1a1aa] line-through">Rs. {item.mrp * item.quantity}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Section 1.5: Shipping & Logistics (Visible if info exists) */}
                {(order.carrierName || order.trackingNumber) && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Shipping & Logistics</h4>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <div className="border border-dotted border-gray-300 rounded-[6px] overflow-hidden bg-zinc-50/10">
                            <div className="flex divide-x divide-dotted divide-gray-300">
                                <div className="flex-1 p-5">
                                    <p className="text-[10px] font-medium text-[#71717a] uppercase mb-1">Carrier</p>
                                    <p className="text-[14px] font-medium text-black">{order.carrierName || 'Standard Delivery'}</p>
                                </div>
                                <div className="flex-1 p-5 flex justify-between items-center group">
                                    <div>
                                        <p className="text-[10px] font-medium text-[#71717a] uppercase mb-1">Tracking Number</p>
                                        <p className="text-[14px] font-mono font-medium text-black">#{order.trackingNumber || 'Pending'}</p>
                                    </div>
                                    {order.trackingNumber && (
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.trackingNumber || '');
                                                // showAdminToast('Tracking ID copied!', 'success');
                                            }}
                                            className="px-2.5 py-1.5 bg-white hover:bg-black hover:text-white rounded-[6px] border border-gray-200 transition-all text-[10px] font-bold uppercase active:scale-95"
                                        >
                                            Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Section 2: Fulfillment Lifecycle */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Fulfillment Lifecycle</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    
                    <div className="space-y-4">
                        {MILESTONES.map((m) => {
                            const isExpanded = expandedMilestones.has(m.id);
                            const milestoneLogs = order.statusUpdates?.filter(u => {
                                const rank = STATUS_RANK[u.status.toUpperCase()] || 0;
                                return rank >= m.rankRange[0] && rank <= m.rankRange[1];
                            }) || [];
                            
                            const isFinalMilestone = m.id === 'DELIVERY';
                            const isTerminal = ['DELIVERED', 'CANCELLED', 'FAILED', 'RETURNED'].includes(normalizedStatus);
                            const isCompleted = currentRank > m.rankRange[1] || (isFinalMilestone && isTerminal);
                            const isActive = currentRank >= m.rankRange[0] && currentRank <= m.rankRange[1] && !(isFinalMilestone && isTerminal);
                            
                            const isDelivered = normalizedStatus === 'DELIVERED';
                            
                            // Color logic: #308026 for success/completion
                            const activeColor = isDelivered || isCompleted ? 'bg-[#308026]' : 'bg-black';
                            const activeBorder = isDelivered || isCompleted ? 'border-[#308026]' : 'border-black';

                            return (
                                <div key={m.id} className="group">
                                    <div 
                                        onClick={() => toggleMilestone(m.id)}
                                        className={`flex items-center justify-between p-3 rounded-[10px] border border-dotted transition-all cursor-pointer ${
                                            isActive ? 'border-zinc-400 bg-zinc-50/50' : 'border-gray-200 hover:bg-zinc-50/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] ${
                                                isCompleted ? `${activeColor} ${activeBorder}` : isActive ? `${activeBorder} animate-pulse` : 'border-gray-200'
                                            }`}>
                                                {isCompleted && <TickIcon className="w-2.5 h-2.5 text-white" />}
                                                {isActive && <div className={`w-1 h-1 ${activeColor} rounded-full`} />}
                                            </div>
                                            <span className={`text-[12px] font-medium tracking-tight ${isActive || isCompleted ? 'text-black' : 'text-[#71717a]'}`}>
                                                {m.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {milestoneLogs.length > 0 && (
                                               <span className="text-[10px] font-mono text-[#a1a1aa] uppercase">{milestoneLogs.length} Events</span>
                                            )}
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-[#a1a1aa]"
                                            >
                                                <CaretDownIcon className="w-4 h-4" />
                                            </motion.div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (milestoneLogs.length > 0 || (m.id === 'SHIPPING' && (order.carrierName || order.trackingNumber))) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className={`overflow-hidden border-l border-dotted ${isCompleted || isActive ? 'border-[#308026]' : 'border-gray-300'} ml-5 pl-5 mt-2 mb-4 space-y-4`}
                                            >
                                                {/* Tracking Info for Shipping Milestone */}
                                                {m.id === 'SHIPPING' && (order.carrierName || order.trackingNumber) && (
                                                    <div className="mr-5 p-3.5 bg-zinc-50 rounded-[10px] border border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                                                                <span className="text-xs">🚚</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] text-[#a1a1aa] uppercase font-bold tracking-wider">Carrier & Tracking</p>
                                                                <p className="text-[12px] font-medium text-black">
                                                                    {order.carrierName || 'Standard'} · {order.trackingNumber || 'Pending'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {order.trackingNumber && (
                                                            <button 
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(order.trackingNumber || '');
                                                                }}
                                                                className="px-2 py-1 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all active:scale-95"
                                                            >
                                                                <span className="text-[9px] uppercase font-bold text-[#71717a] hover:text-black">Copy</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {milestoneLogs.map((log, idx) => {
                                                    const logRank = STATUS_RANK[log.status.toUpperCase()] || 0;
                                                    const isLogCompleted = currentRank > logRank || isTerminal;
                                                    return (
                                                    <div key={idx} className="relative">
                                                        <div className={`absolute -left-[23px] top-1.5 w-1 h-1 ${isLogCompleted ? 'bg-[#308026]' : 'bg-gray-300'} rounded-full`} />
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-medium text-black uppercase">{log.status}</span>
                                                                <span className="text-[10px] text-[#a1a1aa] font-mono">{new Date(log.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-[12px] text-[#71717a] leading-relaxed">{log.message}</p>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Section 3: Settlement Summary (The calculation breakdown) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Settlement Summary</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    <div className="border border-dotted border-gray-300 rounded-[6px] overflow-hidden bg-zinc-50/40 p-5 space-y-3">
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="text-[#a1a1aa]">Total MRP</span>
                            <span className="text-[#242424] font-medium">Rs. {order.mrp_amount || order.totalAmount}</span>
                        </div>
                        {!!order.discount_on_mrp && order.discount_on_mrp > 0 && (
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="text-[#a1a1aa]">Product Discount</span>
                                <span className="text-green-600 font-medium">- Rs. {order.discount_on_mrp}</span>
                            </div>
                        )}
                        {!!order.bundle_discount && order.bundle_discount > 0 && (
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="text-[#a1a1aa]">Bundle Savings</span>
                                <span className="text-green-600 font-medium">- Rs. {order.bundle_discount}</span>
                            </div>
                        )}
                        {!!order.coupon_discount && order.coupon_discount > 0 && (
                            <div className="flex justify-between items-center text-[12px]">
                                <div className="flex flex-col">
                                    <span className="text-[#a1a1aa]">Coupon Savings</span>
                                    <span className="text-[9px] font-mono text-zinc-400">Code: {order.coupon_code}</span>
                                </div>
                                <span className="text-green-600 font-medium">- Rs. {order.coupon_discount}</span>
                            </div>
                        )}
                        {!!order.shipping_amount && order.shipping_amount > 0 && (
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="text-[#a1a1aa]">Shipping & Delivery</span>
                                <span className="text-blue-600 font-medium">+ Rs. {order.shipping_amount}</span>
                            </div>
                        )}
                        {order.cod_fees && order.cod_fees > 0 && (
                            <div className="flex justify-between items-center text-[12px]">
                                <span className="text-[#a1a1aa]">COD Transaction Fee</span>
                                <span className="text-blue-600 font-medium">+ Rs. {order.cod_fees}</span>
                            </div>
                        )}
                        <div className="h-px bg-gray-100 my-2" />
                        <div className="flex justify-between items-center text-[15px] pt-1">
                            <span className="font-medium text-[#242424]">Settlement Total</span>
                            <span className="font-bold text-black tracking-tight">Rs. {order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center text-[12px] pt-3 mt-1 border-t border-dotted border-gray-200">
                            <span className="text-[#a1a1aa] font-medium uppercase tracking-wider text-[10px]">Payment Status</span>
                            <div className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' : order.paymentStatus?.toLowerCase() === 'partially_paid' ? 'bg-[#fef08a] text-[#854d0e]' : 'bg-zinc-100 text-[#3f3f46]'}`}>
                                {order.paymentStatus?.replace(/_/g, ' ') || 'Pending'}
                            </div>
                        </div>
                        {order.paymentStatus?.toLowerCase() === 'partially_paid' && (
                            <>
                                <div className="flex justify-between items-center text-[12px] pt-2">
                                    <span className="text-[#a1a1aa]">Amount Paid</span>
                                    <span className="font-semibold text-[#242424]">NPR {order.amountPaid}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] pt-1">
                                    <span className="text-[#ef4444] font-medium">Balance Due</span>
                                    <span className="font-bold text-[#ef4444]">NPR {(order.totalAmount || 0) - (order.amountPaid || 0)}</span>
                                </div>
                            </>
                        )}
                        
                        <div className="pt-3 mt-1 border-t border-dotted border-gray-200">
                            <button
                                onClick={() => alert('Invoice Generation Module linking...')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-lg text-[12px] font-semibold text-[#242424] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                Generate Invoice
                            </button>
                        </div>
                    </div>
                </section>
                
                {/* Section 3.5: Payment Proof (Visible for QR) */}
                {order.paymentMethod?.toLowerCase() === 'qr' && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">QR Payment Proof</h4>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <div className="border border-dotted border-gray-300 rounded-[6px] overflow-hidden bg-zinc-50/10 p-5 space-y-4">
                            {order.payment_screenshot_url ? (
                                <div className="space-y-3">
                                    <div className="relative w-full aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm group">
                                        <Image
                                            src={order.payment_screenshot_url}
                                            alt="Payment Receipt"
                                            fill
                                            className="object-contain p-2"
                                        />
                                        <a 
                                            href={order.payment_screenshot_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="px-3 py-1.5 bg-white shadow-md rounded-lg text-[11px] font-bold uppercase tracking-wider text-black">View Full Size</span>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center border border-dashed border-gray-200 rounded-lg">
                                    <p className="text-[12px] text-[#a1a1aa]">No screenshot uploaded.</p>
                                </div>
                            )}

                            {order.payment_remarks && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Customer Remarks</label>
                                    <p className="text-[13px] text-black bg-white p-3 rounded-lg border border-gray-100 leading-relaxed shadow-sm italic">
                                        "{order.payment_remarks}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Section 4: Customer Logistics */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Customer Logistics</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="border border-dotted border-gray-300 rounded-[6px] divide-y divide-dotted divide-gray-300 overflow-hidden bg-zinc-50/10">
                        <div className="grid grid-cols-2 divide-x divide-dotted divide-gray-300">
                             <div className="p-5 flex flex-col gap-1.5">
                                <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Contact Payload</label>
                                <p className="text-[13px] font-medium text-black">{order.customerName}</p>
                                <p className="text-[11px] text-[#71717a]">{order.customerEmail || 'No Email'}</p>
                                <p className="text-[11px] text-[#71717a]">{order.customerPhone || 'No Phone'}</p>
                             </div>
                             <div className="p-5 flex flex-col gap-1.5">
                                <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Payment Architecture</label>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                  <p className="text-[13px] font-medium text-black uppercase">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                                </div>
                                <span className="text-[10px] text-[#a1a1aa] mt-0.5">Automated settlement active</span>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-dotted divide-gray-300 border-t border-dotted border-gray-300">
                             <div className="p-5 flex flex-col gap-1.5">
                                 <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Destination Protocol</label>
                                 {order.shippingAddress ? (
                                    <div className="text-[13px] leading-relaxed text-[#242424] space-y-0.5 max-w-sm">
                                        <p className="font-medium">{order.shippingAddress.first_name || order.shippingAddress.addressDetails?.first_name} {order.shippingAddress.last_name || order.shippingAddress.addressDetails?.last_name || ''}</p>
                                        <p className="text-[#71717a]">{order.shippingAddress.address_line_1 || order.shippingAddress.addressDetails?.address_line_1}</p>
                                        <p className="text-[#a1a1aa] text-[12px]">{order.shippingAddress.area || order.shippingAddress.addressDetails?.area}, {order.shippingAddress.city || order.shippingAddress.addressDetails?.city}, {order.shippingAddress.pincode || order.shippingAddress.addressDetails?.pincode}</p>
                                        {(order.shippingAddress.phone || order.shippingAddress.addressDetails?.phone) && (
                                            <p className="text-[#242424] font-medium pt-1">
                                                <span className="text-[#a1a1aa] font-normal">Phone:</span> {order.shippingAddress.phone || order.shippingAddress.addressDetails?.phone}
                                            </p>
                                        )}
                                    </div>
                                 ) : (
                                    <p className="text-[13px] text-gray-400 italic">Static address unassigned</p>
                                 )}
                             </div>
                             
                             <div className="p-5 flex flex-col gap-1.5">
                                 <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Preferred Shipping Mode</label>
                                 <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${order.shippingAddress?.option === 'pickup' ? 'bg-[#A16207]' : 'bg-[#308026]'}`} />
                                    <p className="text-[13px] font-medium text-black">
                                        {order.shippingAddress?.option === 'pickup' ? 'Pickup from Station' : 'Home Delivery'}
                                    </p>
                                 </div>
                             </div>
                        </div>
                    </div>
                </section>
                
                {/* Meta payload */}
                <div className="text-center pt-4">
                    <p className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-[0.3em]">
                        Payload Internal: {order.id}
                    </p>
                </div>
            </div>
        </AdminSheet>
    );
}
