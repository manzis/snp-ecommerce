'use client';

import React, { useState } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { OrderProps } from '@/components/orders/OrderCard';
import { resendStatusEmailAction } from '@/app/actions/orderActions';
import { useAdminToast } from '../ui/AdminToastProvider';
import { resolveOrderPhone, openWhatsAppForOrder } from '@/lib/whatsappTemplates';

interface StatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderProps | null;
    onConfirm: (orderId: string, status: string, message: string, trackingNumber?: string, carrierName?: string) => Promise<void>;
}

const DEFAULT_MESSAGES: Record<string, string> = {
    pending: "Order has been placed and is awaiting confirmation.",
    confirmed: "Order confirmed. We are starting to prepare your items.",
    processing: "Your order is being packed and prepared for shipment.",
    shipped: "Order has been shipped and is on its way.",
    in_transit: "Your package is on its way to the local hub.",
    shipment_arrived: "Shipment arrived at the delivery hub.",
    out_for_delivery: "Your order is out for delivery with our courier partner.",
    delivered: "Order successfully delivered! Thank you for shopping with us.",
    cancelled: "Order has been cancelled.",
    returned: "Order return has been processed.",
    failed: "Delivery attempt failed. Please contact support.",
    rescheduled: "Delivery attempt failed. We have rescheduled your delivery for the next available slot."
};

const statuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'in_transit',
    'shipment_arrived', 'out_for_delivery', 'delivered', 'returned', 'cancelled', 'failed', 'rescheduled'
];

export default function StatusUpdateModal({ isOpen, onClose, order, onConfirm }: StatusUpdateModalProps) {
    const [targetStatus, setTargetStatus] = useState<string>(order?.status.toLowerCase() || 'pending');
    const [statusMessage, setStatusMessage] = useState(DEFAULT_MESSAGES[order?.status.toLowerCase() || 'pending'] || '');
    const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
    const [carrierName, setCarrierName] = useState(order?.carrierName || '');
    const [loading, setLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const { showAdminToast } = useAdminToast();

    if (!order) return null;

    const handleStatusChange = (newStatus: string) => {
        setTargetStatus(newStatus);
        setStatusMessage(DEFAULT_MESSAGES[newStatus] || 'Order status updated.');
    };

    const handleResendNotification = async () => {
        if (!order || isResending) return;
        
        setIsResending(true);
        try {
            const result = await resendStatusEmailAction(order.id, targetStatus, statusMessage);
            if (result.success) {
                showAdminToast(result.message, 'success');
            } else {
                showAdminToast(result.message || 'Failed to resend email', 'error');
            }
        } catch (error) {
            showAdminToast('An error occurred while resending the email', 'error');
        } finally {
            setIsResending(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(order.id, targetStatus, statusMessage, trackingNumber, carrierName);

            // After successful update, offer WhatsApp send
            const phone = resolveOrderPhone(order);
            if (phone) {
                // Brief delay so the toast from parent doesn't overlap
                setTimeout(() => {
                    const shouldSend = window.confirm(
                        `Status updated to ${targetStatus.toUpperCase()}.\n\nSend WhatsApp update to ${phone}?`
                    );
                    if (shouldSend) {
                        openWhatsAppForOrder(order, targetStatus);
                    }
                }, 300);
            }

            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(false);
        }
    };

    const headerRight = (
        <div className="flex items-center gap-2">
            {/* Send via WhatsApp */}
            <button
                onClick={() => {
                    const phone = resolveOrderPhone(order);
                    if (!phone) {
                        showAdminToast('No phone number available', 'error');
                        return;
                    }
                    openWhatsAppForOrder(order, targetStatus);
                    showAdminToast('WhatsApp opened — tap Send to deliver', 'success');
                }}
                disabled={!resolveOrderPhone(order) || loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50 ${
                    resolveOrderPhone(order)
                        ? 'text-[#25D366] hover:text-[#128C7E] bg-[#25D366]/5 border border-[#25D366]/10 hover:bg-[#25D366]/10'
                        : 'text-gray-400 bg-gray-50 border border-gray-100'
                }`}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
            </button>
            {/* Resend Email Notification */}
            <button
                onClick={handleResendNotification}
                disabled={isResending || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3f9733] hover:text-[#308026] bg-[#3f9733]/5 border border-[#3f9733]/10 hover:bg-[#3f9733]/10 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
                {isResending ? (
                    <div className="w-2.5 h-2.5 border-2 border-[#3f9733]/30 border-t-[#3f9733] rounded-full animate-spin" />
                ) : (
                    <span>📧</span>
                )}
                {isResending ? 'Resending...' : 'Email'}
            </button>
        </div>
    );

    const footerActions = (
        <div className="flex w-full gap-4">
            <button
                onClick={onClose}
                className="flex-1 px-8 py-3.5 text-[13px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 rounded-2xl transition-all active:scale-95"
            >
                Discard
            </button>
            <button
                onClick={handleConfirm}
                disabled={loading || isResending}
                className="flex-[2] md:flex-none md:px-12 py-3.5 bg-[#242424] text-white rounded-2xl text-[13px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <span>Confirm Status Update</span>
                )}
            </button>
        </div>
    );

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Status Update: #${order.shortId}`}
            description={order.title}
            maxWidth="max-w-xl"
            headerRight={headerRight}
            footerActions={footerActions}
        >
            <div className="space-y-10 py-2">
                {/* Status Selection Grid */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Select Fulfillment State</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 border border-dotted border-gray-300 divide-x divide-y divide-dotted divide-gray-300 rounded-[6px] overflow-hidden">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                className={`flex flex-col gap-1 p-4 transition-all text-left group ${
                                    targetStatus === s 
                                    ? 'bg-[#242424] text-white' 
                                    : 'bg-zinc-50/20 text-[#71717a] hover:bg-zinc-50'
                                }`}
                            >
                                <span className={`text-[9px] uppercase tracking-widest font-medium ${targetStatus === s ? 'text-white/50' : 'text-[#a1a1aa]'}`}>Step</span>
                                <span className="text-[12px] font-medium truncate">{s.replace('_', ' ').toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Tracking Info Section (Optional, shown for Shipped/Transit/Out and beyond) */}
                {['shipped', 'in_transit', 'shipment_arrived', 'out_for_delivery', 'delivered'].includes(targetStatus.toLowerCase()) && (
                    <section className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3">
                            <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Fulfillment Tracking</h4>
                            <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <div className="border border-dotted border-gray-300 rounded-[6px] overflow-hidden bg-zinc-50/10">
                            <div className="p-5 border-b border-dotted border-gray-300">
                                <p className="text-[10px] font-medium text-[#71717a] uppercase mb-2">Carrier Name</p>
                                <input 
                                    type="text"
                                    value={carrierName}
                                    onChange={(e) => setCarrierName(e.target.value)}
                                    placeholder="e.g. Fedex, DHL, Local Courier"
                                    className="w-full bg-transparent text-[14px] leading-relaxed font-regular text-[#242424] transition-all outline-none placeholder:text-gray-300"
                                />
                            </div>
                            <div className="p-5">
                                <p className="text-[10px] font-medium text-[#71717a] uppercase mb-2">Tracking Number</p>
                                <input 
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking identifier..."
                                    className="w-full bg-transparent text-[14px] leading-relaxed font-regular text-[#242424] transition-all outline-none placeholder:text-gray-300"
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Log Message Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h4 className="text-[13px] font-medium text-[#242424] tracking-tight">Tracking Log Message</h4>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="border border-dotted border-gray-300 rounded-[6px] overflow-hidden bg-zinc-50/10">
                        <div className="p-5 border-b border-dotted border-gray-300">
                           <p className="text-[10px] font-medium text-[#71717a] uppercase mb-2">Message to Customer</p>
                           <textarea
                                className="w-full min-h-[120px] bg-transparent text-[14px] leading-relaxed font-regular text-[#242424] transition-all outline-none resize-none placeholder:text-gray-300"
                                value={statusMessage}
                                onChange={(e) => setStatusMessage(e.target.value)}
                                placeholder="Write a detailed update update for this fulfillment step..."
                            />
                        </div>
                    </div>
                </section>
            </div>
        </AdminModal>
    );
}
