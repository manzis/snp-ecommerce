'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderProps } from '@/components/orders/OrderCard';
import HorizontalDotsIcon from '@/components/icons/DotsHorizontalIcon';

interface OrderActionMenuProps {
    order: OrderProps;
    onViewOrder?: (order: OrderProps) => void;
    onUpdateStatus?: (order: OrderProps) => void;
    onUpdatePaymentStatus?: (order: OrderProps) => void;
    onDeleteOrder?: (order: OrderProps) => void;
    onOpenChange?: (isOpen: boolean) => void;
}

const ViewIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
);

const PaymentIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
    </svg>
);

const PrintIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
    </svg>
);

const LabelIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />
    </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

export default function OrderActionMenu({
    order,
    onViewOrder,
    onUpdateStatus,
    onUpdatePaymentStatus,
    onDeleteOrder,
    onOpenChange,
}: OrderActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const next = !isOpen;
        setIsOpen(next);
        onOpenChange?.(next);
    };

    const handleAction = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        action?.();
        setIsOpen(false);
        onOpenChange?.(false);
    };

    const fallbackCopy = (text: string) => {
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
        } catch (err) {}
        document.body.removeChild(textArea);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                type="button"
                className={`flex w-[32px] h-[32px] items-center justify-center shrink-0 rounded-[8px] transition-colors duration-[150ms] ease-in-out cursor-pointer z-[110] ${isOpen ? 'bg-[#242424] text-white' : 'bg-transparent text-[#242424] hover:bg-black/5'}`}
                aria-label="Order actions"
            >
                <HorizontalDotsIcon className="w-[18px] h-[18px]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-[calc(100%+8px)] w-[180px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[120] py-1.5 px-1.5"
                    >
                        <button
                            onClick={(e) => handleAction(e, () => onViewOrder?.(order))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <ViewIcon className="w-4 h-4 text-[#71717a]" />
                            <span>View Details</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, () => onUpdateStatus?.(order))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <EditIcon className="w-4 h-4 text-[#71717a]" />
                            <span>Update Status</span>
                        </button>
                        
                        <button
                            onClick={(e) => handleAction(e, () => onUpdatePaymentStatus?.(order))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <PaymentIcon className="w-4 h-4 text-[#71717a]" />
                            <span>Update Payment</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, () => alert('System: Print Invoice initiated'))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <PrintIcon className="w-4 h-4 text-[#71717a]" />
                            <span>Print Invoice</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, () => window.open(`/admin/labels/${order.id}`, '_blank'))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <LabelIcon className="w-4 h-4 text-[#71717a]" />
                            <span>Generate Label</span>
                        </button>

                        <div className="border-t border-gray-50 my-1" />

                        {/* Order Sharing Links */}
                        <button
                            onClick={(e) => handleAction(e, async () => {
                                const url = `${window.location.origin}/track-order?id=${order.shortId}`;
                                if (navigator.share) {
                                    try {
                                        await navigator.share({ title: 'Track your Order', url });
                                        return;
                                    } catch (err: any) {
                                        if (err.name === 'AbortError') return;
                                    }
                                }
                                if (!navigator.clipboard) fallbackCopy(url);
                                else navigator.clipboard.writeText(url);
                                alert('Tracking Link Copied!');
                            })}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <svg className="w-4 h-4 text-[#71717a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            <span>Share Tracking</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, async () => {
                                const url = `${window.location.origin}/pay/${order.id}`;
                                if (navigator.share) {
                                    try {
                                        await navigator.share({ title: 'Complete your Payment', url });
                                        return;
                                    } catch (err: any) {
                                        if (err.name === 'AbortError') return;
                                    }
                                }
                                if (!navigator.clipboard) fallbackCopy(url);
                                else navigator.clipboard.writeText(url);
                                alert('Payment Link Copied!');
                            })}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <svg className="w-4 h-4 text-[#71717a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                            <span>Share Payment</span>
                        </button>

                        <div className="border-t border-gray-50 my-1" />

                        <button
                            onClick={(e) => handleAction(e, () => onDeleteOrder?.(order))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#ef4444] hover:bg-red-50/80 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete Order</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
