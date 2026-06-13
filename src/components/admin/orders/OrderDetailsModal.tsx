'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { OrderProps, OrderStatus } from '@/components/orders/OrderCard';
import AdminSheet from '@/components/admin/shared/AdminSheet';
import AdminModal from '@/components/admin/shared/AdminModal';
import TickIcon from '@/components/icons/TickIcon';
import CaretDownIcon from '@/components/icons/CaretDownIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminToast } from '../ui/AdminToastProvider';
import { resolveOrderPhone, openWhatsAppForOrder, getWhatsAppButtonLabel } from '@/lib/whatsappTemplates';
import PhoneIcon from '@/components/icons/PhoneIcon';
import CopyIcon from '@/components/icons/CopyIcon';
import { syncExternalOrderTrackingAction } from '@/app/actions/orderActions';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: (OrderProps & { payment_screenshot_url?: string; payment_remarks?: string }) | null;
    onUpdateStatus?: (order: OrderProps) => void;
    onUpdatePaymentStatus?: (order: OrderProps) => void;
    onResetPayment?: (order: OrderProps) => void;
    onCancelOrder?: (order: OrderProps, reason: string) => void;
}

// Timeline Rank Configuration
const STATUS_RANK: Record<string, number> = {
    'PENDING': 1, 'CONFIRMED': 2, 'PROCESSING': 3,
    'DELAYED': 3.5,
    'SHIPPED': 4, 'IN_TRANSIT': 5, 'SHIPMENT_ARRIVED': 6,
    'SHIPMENT_DELAYED': 6.5,
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
    onUpdatePaymentStatus,
    onResetPayment,
    onCancelOrder
}: OrderDetailsModalProps) {
    const { showAdminToast } = useAdminToast();
    const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set(['ORDERED']));
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("Order Cancelled By the seller. This might be a technical default , Try Ordering it again!");

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

    // Trigger Expo Express background sync when modal opens
    React.useEffect(() => {
        if (isOpen && order?.id) {
            syncExternalOrderTrackingAction(order.id).catch(err => console.error("Sync error:", err));
        }
    }, [isOpen, order?.id]);

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

    const formatLogDateTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';

        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        return `${month} ${day}, ${weekday} ${hours}:${minutes} ${ampm}`;
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

    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };

    const handleShare = async (type: 'tracking' | 'payment') => {
        const url = type === 'tracking'
            ? `${window.location.origin}/track-order?id=${order.shortId}`
            : `${window.location.origin}/pay/${order.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: type === 'tracking' ? `Track Order #${order.shortId}` : `Pay Order #${order.shortId}`,
                    url
                });
                return;
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    if (!navigator.clipboard) {
                        fallbackCopyTextToClipboard(url);
                    } else {
                        navigator.clipboard.writeText(url);
                    }
                    showAdminToast(`${type === 'tracking' ? 'Tracking URL' : 'Payment Link'} copied!`, 'success');
                }
                return;
            }
        }

        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(url);
        } else {
            navigator.clipboard.writeText(url);
        }
        showAdminToast(`${type === 'tracking' ? 'Tracking URL' : 'Payment Link'} copied!`, 'success');
    };


    const footerActions = (
        <div className="flex w-full gap-3">
            <button
                onClick={() => setIsCancelModalOpen(true)}
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

    const customerPhone = resolveOrderPhone(order);

    const handleWhatsApp = (overrideStatus?: string) => {
        if (!customerPhone) {
            showAdminToast('No phone number available for this order', 'error');
            return;
        }
        const sent = openWhatsAppForOrder(order, overrideStatus);
        if (sent) {
            showAdminToast('WhatsApp opened — tap Send to deliver the message', 'success');
        }
    };

    const titleActions = (
        <div className="flex items-center gap-1 ml-2 translate-y-[1px]">
            {/* Call Customer */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (customerPhone) {
                        window.location.href = `tel:${customerPhone}`;
                    }
                }}
                disabled={!customerPhone}
                className="p-1 hover:bg-gray-100 rounded-md text-[#52525b] hover:text-[#242424] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={customerPhone ? `Call ${customerPhone}` : 'No phone number'}
            >
                <PhoneIcon width="13" height="13" />
            </button>
            {/* WhatsApp Quick Send */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsApp();
                }}
                disabled={!customerPhone}
                className="p-1 hover:bg-gray-100 rounded-md text-[#52525b] hover:text-[#242424] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={customerPhone ? `Send WhatsApp to ${customerPhone}` : 'No phone number'}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>


            {/* Share Tracking Link */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleShare('tracking');
                }}
                className="p-1 hover:bg-gray-100 rounded-md text-[#52525b] hover:text-[#242424] transition-colors"
                title="Share Tracking Link"
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </button>
        </div>
    );

    return (
        <>
            <AdminSheet
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="flex items-center">
                        <span>Order Fulfillment</span>
                        {titleActions}
                    </div>
                }
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
                                            alt={item.products?.title || item.products?.name || order.title || 'Product'}
                                            fill
                                            sizes="56px"
                                            className="object-contain p-1.5"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[10px] text-[#a1a1aa] uppercase font-medium tracking-wider block">
                                            {item.products?.brands?.name || order.brand || '—'}
                                        </span>
                                        <h5 className="text-[13px] font-medium text-[#242424] truncate leading-snug mt-0.5">
                                            {item.products?.title || item.products?.name || order.title || 'Product'}
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
                                            <div className="flex items-center gap-2">
                                                <p className="text-[14px] font-mono font-medium text-black">#{order.trackingNumber || 'Pending'}</p>
                                                {order.trackingNumber && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(order.trackingNumber || '');
                                                            showAdminToast('Tracking ID copied!', 'success');
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-black transition-colors"
                                                        title="Copy Tracking ID"
                                                    >
                                                        <CopyIcon width="14" height="14" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
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
                                const milestoneLogs = order.statusUpdates
                                    ?.filter(u => new Date(u.date).getTime() <= new Date().getTime()) // Hide future-stamped logs for safety
                                    .filter(u => {
                                        const rank = STATUS_RANK[u.status.toUpperCase()] || 0;
                                        if (u.status.toUpperCase() === 'DELAYED' && m.id === 'ORDERED') return true;
                                        if (u.status.toUpperCase() === 'SHIPMENT_DELAYED' && m.id === 'SHIPPED') return true;
                                        return rank >= m.rankRange[0] && rank <= m.rankRange[1];
                                    })
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

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
                                            className={`flex items-center justify-between p-3 rounded-[10px] border border-dotted transition-all cursor-pointer ${isActive ? 'border-zinc-400 bg-zinc-50/50' : 'border-gray-200 hover:bg-zinc-50/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-[1.5px] ${isCompleted ? `${activeColor} ${activeBorder}` : isActive ? `${activeBorder} animate-pulse` : 'border-gray-200'
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
                                                    className="overflow-hidden ml-5 mt-2 mb-4 relative"
                                                >
                                                    {/* Vertical Timeline Line */}
                                                    <div className={`absolute left-[2px] top-0 bottom-0 border-l border-dotted ${isCompleted || isActive ? 'border-[#308026]' : 'border-gray-300'}`} />

                                                    <div className="pl-6 space-y-4">
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
                                                                    {/* Dot - Offset to align with line at x=2, shifted down for text alignment */}
                                                                    <div className={`absolute -left-[24.5px] top-[5.5px] w-[5px] h-[5px] ${isLogCompleted ? 'bg-[#308026]' : 'bg-gray-300'} rounded-full z-10`} />
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[11px] font-medium text-black uppercase">{log.status}</span>
                                                                            <span className="text-[10px] text-[#a1a1aa] font-mono">{formatLogDateTime(log.date)}</span>
                                                                        </div>
                                                                        <p className="text-[12px] text-[#71717a] leading-relaxed">{log.message}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
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

                            {/* Generate Invoice and Copy Payment Link */}
                            <div className="pt-3 mt-1 border-t border-dotted border-gray-200 flex gap-2">
                                <button
                                    onClick={() => handleShare('payment')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-50 border border-gray-200 rounded-lg text-[12px] font-semibold text-[#242424] hover:bg-zinc-100 hover:border-gray-300 transition-all active:scale-[0.98]"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                    Share Pay URL
                                </button>
                                <button
                                    onClick={() => alert('Invoice Generation Module linking...')}
                                    className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-lg text-[12px] font-semibold text-[#242424] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
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
                                        {(() => {
                                            const isPdf = order.payment_screenshot_url.toLowerCase().endsWith('.pdf');
                                            if (isPdf) {
                                                return (
                                                    <div className="flex flex-col items-center justify-center py-8 bg-white border border-gray-200 rounded-lg shadow-sm gap-4">
                                                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[13px] font-bold text-black uppercase tracking-tight">PDF RECEIPT ATTACHED</p>
                                                            <p className="text-[11px] text-zinc-400 mt-1">Payment proof is in PDF format</p>
                                                        </div>
                                                        <a
                                                            href={order.payment_screenshot_url.includes('cloudinary.com') ? order.payment_screenshot_url.replace(/\.pdf$/i, '.jpg') : order.payment_screenshot_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-6 py-2.5 bg-[#242424] text-white text-[12px] font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
                                                        >
                                                            Review PDF Payload
                                                        </a>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="relative w-full aspect-video bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm group">
                                                    <Image
                                                        src={order.payment_screenshot_url}
                                                        alt="Payment Receipt"
                                                        fill
                                                        sizes="(max-width: 1024px) 100vw, 600px"
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
                                            );
                                        })()}
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

                                {/* Review Actions */}
                                {order.paymentStatus?.toLowerCase() !== 'paid' && (
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => onUpdatePaymentStatus?.(order)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-[12px] font-bold text-white transition-all active:scale-95 shadow-md shadow-red-500/20"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => onResetPayment?.(order)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[12px] font-bold text-zinc-900 transition-all active:scale-95 border border-zinc-200"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => onUpdatePaymentStatus?.(order)}
                                            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-[12px] font-bold text-white transition-all active:scale-95 shadow-md shadow-green-500/20"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}

                                {/* Rejected State actions */}
                                {order.paymentStatus?.toLowerCase() === 'failed' && (
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => onResetPayment?.(order)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[12px] font-bold text-zinc-900 transition-all active:scale-95 border border-zinc-200"
                                        >
                                            Clear Rejection/Proof
                                        </button>
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
                                    <div
                                        className="text-[13px] font-medium text-black flex items-center gap-1 group cursor-pointer w-fit"
                                        onClick={() => {
                                            if (order.customerName) {
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText(order.customerName);
                                                } else {
                                                    fallbackCopyTextToClipboard(order.customerName);
                                                }
                                                showAdminToast('Name copied!', 'success');
                                            }
                                        }}
                                    >
                                        {order.customerName}
                                        {order.customerName && (
                                            <button className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-black transition-all" title="Copy Name">
                                                <CopyIcon width="12" height="12" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#71717a]">{order.customerEmail || 'No Email'}</p>
                                    <div
                                        className="text-[11px] text-[#71717a] flex items-center gap-1 group cursor-pointer w-fit"
                                        onClick={() => {
                                            if (order.customerPhone) {
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText(order.customerPhone);
                                                } else {
                                                    fallbackCopyTextToClipboard(order.customerPhone);
                                                }
                                                showAdminToast('Phone number copied!', 'success');
                                            }
                                        }}
                                    >
                                        {order.customerPhone || 'No Phone'}
                                        {order.customerPhone && (
                                            <button className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-black transition-all" title="Copy Phone">
                                                <CopyIcon width="10" height="10" />
                                            </button>
                                        )}
                                    </div>
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
                            <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200">
                                <div className="p-5 flex flex-col gap-1.5">
                                    <label className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider">Destination Protocol</label>
                                    {order.shippingAddress ? (
                                        <div className="text-[13px] leading-relaxed text-[#242424] space-y-1 max-w-sm">
                                            <div
                                                className="font-medium flex items-center gap-1 group cursor-pointer w-fit"
                                                onClick={() => {
                                                    const addr = order.shippingAddress;
                                                    const details = addr.addressDetails || {};
                                                    const fName = addr.first_name || details.first_name || '';
                                                    const lName = addr.last_name || details.last_name || '';
                                                    const nameToCopy = (!fName && !lName) ? (order.customerName || 'Manual Order Recipient') : `${fName} ${lName}`.trim();
                                                    if (navigator.clipboard) {
                                                        navigator.clipboard.writeText(nameToCopy);
                                                    } else {
                                                        fallbackCopyTextToClipboard(nameToCopy);
                                                    }
                                                    showAdminToast('Name copied!', 'success');
                                                }}
                                            >
                                                {(() => {
                                                    const addr = order.shippingAddress;
                                                    const details = addr.addressDetails || {};
                                                    const fName = addr.first_name || details.first_name || '';
                                                    const lName = addr.last_name || details.last_name || '';
                                                    if (!fName && !lName) return order.customerName || 'Manual Order Recipient';
                                                    return `${fName} ${lName}`.trim();
                                                })()}
                                                <button className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-black transition-all" title="Copy Name">
                                                    <CopyIcon width="12" height="12" />
                                                </button>
                                            </div>
                                            <div className="text-[#71717a]">
                                                {(() => {
                                                    const addr = order.shippingAddress;
                                                    const details = addr.addressDetails || {};

                                                    // Extract all possible address parts
                                                    const parts = [
                                                        addr.address_line_1 || details.address_line_1,
                                                        addr.street || details.street,
                                                        addr.area || details.area,
                                                        addr.address_line_2 || details.address_line_2
                                                    ].filter(Boolean) as string[];

                                                    // Deduplicate while preserving order (e.g. if street and area are same "Tokha")
                                                    const uniqueParts: string[] = [];
                                                    const seen = new Set<string>();

                                                    parts.forEach(p => {
                                                        const normalized = p.trim().toLowerCase();
                                                        if (!seen.has(normalized)) {
                                                            uniqueParts.push(p.trim());
                                                            seen.add(normalized);
                                                        }
                                                    });

                                                    return uniqueParts.length > 0 ? uniqueParts.join(', ') : 'No street details';
                                                })()}
                                            </div>
                                            <p className="text-[#a1a1aa] text-[12px]">
                                                {(() => {
                                                    const addr = order.shippingAddress;
                                                    const details = addr.addressDetails || {};
                                                    const city = addr.city || details.city || '';
                                                    const state = addr.state || details.state || '';
                                                    const pincode = addr.pincode || addr.postal_code || details.pincode || '';
                                                    const country = addr.country || details.country || '';

                                                    const locationParts = [
                                                        city,
                                                        state,
                                                        pincode
                                                    ].filter(Boolean).join(', ');

                                                    return (
                                                        <>
                                                            {locationParts}
                                                            {country ? ` (${country})` : ''}
                                                        </>
                                                    );
                                                })()}
                                            </p>
                                            {(() => {
                                                const addr = order.shippingAddress;
                                                const details = addr.addressDetails || {};
                                                const phone = addr.phone || details.phone || order.customerPhone;
                                                if (!phone) return null;
                                                return (
                                                    <div
                                                        className="text-[#242424] font-medium pt-1 flex items-center gap-1 group cursor-pointer w-fit"
                                                        onClick={() => {
                                                            if (navigator.clipboard) {
                                                                navigator.clipboard.writeText(phone);
                                                            } else {
                                                                fallbackCopyTextToClipboard(phone);
                                                            }
                                                            showAdminToast('Phone number copied!', 'success');
                                                        }}
                                                    >
                                                        <span className="text-[#a1a1aa] font-normal">Phone:</span> {phone}
                                                        <button className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-black transition-all" title="Copy Phone">
                                                            <CopyIcon width="12" height="12" />
                                                        </button>
                                                    </div>
                                                );
                                            })()}
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

                            {/* WhatsApp Update Button */}
                            <button
                                onClick={() => handleWhatsApp()}
                                disabled={!customerPhone}
                                className={`w-full flex items-center justify-center gap-2.5 py-4 text-[12px] font-semibold uppercase  transition-all active:scale-[0.99] ${customerPhone
                                    ? 'bg-zinc-50 hover:bg-zinc-200 text-[#242424]'
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={customerPhone ? '#25D366' : '#d1d5db'}>
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                {customerPhone ? getWhatsAppButtonLabel(normalizedStatus) : 'No Phone Number'}
                            </button>
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

            <AdminModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={`Cancel Order: #${order.shortId}`}
                description="Provide a reason for cancelling this order. This message will be logged."
                maxWidth="max-w-xl"
                footerActions={
                    <div className="flex w-full gap-4">
                        <button
                            onClick={() => setIsCancelModalOpen(false)}
                            className="flex-1 px-8 py-3.5 text-[13px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 rounded-2xl transition-all active:scale-95"
                        >
                            Keep Order
                        </button>
                        <button
                            onClick={() => {
                                if (order) {
                                    onCancelOrder?.(order, cancelReason);
                                    setIsCancelModalOpen(false);
                                }
                            }}
                            className="flex-[2] md:flex-none md:px-12 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[13px] font-medium transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            Confirm Cancellation
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-2">
                    <div className="border border-dotted border-red-300 rounded-[6px] overflow-hidden bg-red-50/30">
                        <div className="p-5">
                            <p className="text-[10px] font-medium text-red-700 uppercase mb-2">Cancellation Reason / Log Message</p>
                            <textarea
                                className="w-full min-h-[120px] bg-transparent text-[14px] leading-relaxed font-regular text-[#242424] transition-all outline-none resize-none placeholder:text-gray-400"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Enter cancellation reason..."
                            />
                        </div>
                    </div>
                </div>
            </AdminModal>
        </>
    );
}
