'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import PackageIcon from '@/components/icons/PackageIcon';
import RightBackIcon from '@/components/icons/RightBackIcon';
import HelpIcon from '@/components/icons/HelpIcon';
import StarIcon from '@/components/icons/StarIcon2';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import { cancelOrderAction } from '@/app/actions/orderActions';

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'IN_TRANSIT'
    | 'RETURNED'
    | 'SHIPMENT_ARRIVED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RESCHEDULED'
    | 'FAILED';

export interface StatusUpdateLog {
    status: string;
    message: string;
    date: string;
    location?: string;
}

export interface OrderProps {
    id: string; // Full UUID
    shortId: string; // Display ID (e.g., #5A2B)
    status: OrderStatus;
    dateText: string;
    brand: string;
    title: string;
    image: string;
    size: string;
    flavour: string;
    extraItemsCount: number;
    isCancellable: boolean;
    cancellationReason?: string;
    statusUpdates?: StatusUpdateLog[];
    carrierName?: string;
    trackingNumber?: string;
    // Admin specific data
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: any;
    totalAmount?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    amountPaid?: number;
    createdAt?: string;
    itemsCount?: number;
    // Granular Pricing
    mrp_amount?: number;
    discount_amount?: number;
    shipping_amount?: number;
    discount_on_mrp?: number;
    coupon_discount?: number;
    coupon_code?: string | null;
    cod_fees?: number;
    tax_amount?: number;
    bundle_discount?: number;
    order_items?: any[];
    payment_screenshot_url?: string;
    payment_remarks?: string;
    paymentAttemptedAt?: string;
    updatedAt?: string;
}

export const STATUS_CONFIG: Record<OrderStatus, { text: string; color: string; iconColor: string; bg: string }> = {
    // Group 1: Neutral/Processing (Confirmed style)
    PENDING: { text: "Order Received", color: "text-[#308026]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F1FFE4] to-white" },
    CONFIRMED: { text: "Order Confirmed", color: "text-[#308026]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F1FFE4] to-white" },
    PROCESSING: { text: "Processing", color: "text-[#308026]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F1FFE4] to-white" },

    // Group 2: Yellow (Shipped, Transit, Returned, Shipment Arrived)
    SHIPPED: { text: "Shipped", color: "text-[#308026]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F1FFE4] to-white" },
    IN_TRANSIT: { text: "In Transit", color: "text-[#A16207]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F9FFDA] to-white" },
    RETURNED: { text: "Order Returned", color: "text-[#A16207]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F9FFDA] to-white" },
    SHIPMENT_ARRIVED: { text: "Shipment Arrived", color: "text-[#A16207]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F9FFDA] to-white" },

    // Group 3: Green (Delivered, Out for Delivery)
    OUT_FOR_DELIVERY: { text: "Out for Delivery", color: "text-[#308026]", iconColor: "text-[#308026]", bg: "bg-[#eaffcc]" },
    DELIVERED: { text: "Delivered", color: "text-[#308026]", iconColor: "text-[#308026]", bg: "bg-[#eaffcc]" },

    // Group 4: Red (Failed, Cancelled)
    FAILED: { text: "Delivery Failed", color: "text-[#d92d20]", iconColor: "text-[#d92d20]", bg: "bg-gradient-to-t from-[#FCE8E8] to-white" },
    CANCELLED: { text: "Cancelled", color: "text-[#d92d20]", iconColor: "text-[#d92d20]", bg: "bg-gradient-to-t from-[#FCE8E8] to-white" },
    RESCHEDULED: { text: "Rescheduled", color: "text-[#A16207]", iconColor: "text-[#242424]", bg: "bg-gradient-to-t from-[#F9FFDA] to-white" },
};

const OrderCard: React.FC<{ order: OrderProps }> = ({ order }) => {
    const config = STATUS_CONFIG[order.status];
    const isDelivered = order.status === 'DELIVERED';
    const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
    const isFailedOrCancelled = order.status === 'CANCELLED' || order.status === 'FAILED';
    const isActiveGroup = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'SHIPMENT_ARRIVED', 'RETURNED'].includes(order.status);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelOrder = async (reason: string) => {
        setIsCancelling(true);
        const res = await cancelOrderAction(order.id, reason);
        setIsCancelling(false);
        if (res.success) {
            setIsCancelModalOpen(false);
            alert('Order successfully cancelled.');
        } else {
            alert(res.message || 'Failed to cancel order.');
        }
    };

    return (
        <div className="flex w-full flex-col items-center justify-center bg-white pt-[20px] lg:rounded-[16px] lg:border lg:border-[#f1f5f9] overflow-hidden transition-all duration-300 ">

            {/* HEADER: STATUS & TRACKING */}
            <div className="flex w-full items-center px-[24px] pb-[8px]">
                <div className="flex flex-1 items-center gap-[12px]">
                    <div className={`relative flex items-center justify-center h-[40px] w-[40px] shrink-0 rounded-[8px] ${config.bg}`}>
                        <PackageIcon className={`w-[24px] h-[24px] ${config.iconColor}`} />
                    </div>
                    <div className="flex flex-col items-start justify-start flex-1 gap-[1px]">
                        <span className={`font-rajdhani text-[18px] font-[700] leading-[24px] tracking-[-0.2px] whitespace-nowrap ${config.color}`}>
                            {config.text}
                        </span>
                        <span className="font-rajdhani text-[12px] font-[500] leading-[16px] text-[#242424]">
                            {order.dateText}
                        </span>
                    </div>
                    {/* Hide Track Order if Cancelled/Failed/Delivered */}
                    {isActiveGroup && (
                        <Link href={`/account/orders/${order.id}`} className="flex h-[32px]  items-center justify-center gap-[10px] rounded-[8px] border border-[#f1f5f9] px-[8px] py-[12px] transition-all bg-[#FAFBFC] hover:bg-gray-50 active:scale-95">
                            <span className="font-rajdhani text-[14px] font-[600] leading-[24px] tracking-[-0.2px] text-[#242424] whitespace-nowrap">
                                Track Order
                            </span>
                        </Link>
                    )}
                </div>
            </div>

            {/* BODY: PRODUCT OVERVIEW (Clickable array) */}
            <Link href={`/account/orders/${order.id}`} className="flex w-full items-center gap-[24px]  p-[12px_24px_20px_24px] lg:p-[16px_32px_20px_32px] group transition-colors active:bg-gray-50">
                <div className="flex flex-1 items-center">
                    {/* IMAGE BORDER BOX */}
                    <div className="relative flex w-[83px] items-center justify-center rounded-[6px] border border-[#e2e8f0] p-[6px] shrink-0 transition-transform group-hover:scale-[1.02]">
                        <div className="relative h-[80px] w-full">
                            <Image src={order.image} alt={order.title} fill className="object-cover" />
                        </div>
                        {order.extraItemsCount > 0 && (
                            <div className="absolute bottom-[4px] right-[4px] z-10 flex h-[22px] w-[22px] flex-col items-center justify-center rounded-[4px] border border-[#f1f5f9] bg-[#f2f9f1] ">
                                <span className="font-rajdhani text-[12px] font-[600] text-[#308026]">
                                    +{order.extraItemsCount}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="flex flex-1 flex-col w-[200px] lg:w-auto items-start pl-[16px] overflow-hidden">
                        <div className="flex flex-col items-start w-full pb-[2px]">
                            <div className="flex flex-col items-start gap-[2px] w-full pb-[4px]">
                                <span className="font-rajdhani text-[12px] font-[500] leading-[18px] text-[#242424] whitespace-nowrap">
                                    {order.brand}
                                </span>
                                <div className="flex flex-col items-start gap-[6px] w-full">
                                    <span className="font-rajdhani text-[16px] font-[600] leading-[22px]  text-[#242424] truncate w-full group-hover:text-[#3f9633] transition-colors">
                                        {order.title}
                                    </span>
                                    {order.extraItemsCount > 0 && (
                                        <div className="flex items-center justify-center gap-[10px] rounded-[6px] bg-[#f8f8f8] px-[6px]">
                                            <span className="font-rajdhani text-[12px] font-[600] leading-[22px] tracking-[0.2px] text-[rgba(36,36,36,0.6)] whitespace-nowrap">
                                                +{order.extraItemsCount} More Items
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* VARIANTS */}
                        <div className="flex items-center gap-[12px]">
                            <span className="font-rajdhani text-[14px] font-[500] leading-[18px] text-[#8a8e91] whitespace-nowrap">
                                Size : {order.size}
                            </span>
                            <span className="font-rajdhani text-[14px] font-[500] leading-[18px] text-[#8a8e91] whitespace-nowrap">
                                Flavour : {order.flavour}
                            </span>
                        </div>
                    </div>
                </div>
                {/* CHEVRON ICON */}
                <div className="relative flex items-center justify-center shrink-0 opacity-80 transition-transform group-hover:translate-x-1 group-hover:opacity-100">
                    <RightBackIcon className="h-[16px] w-[16px] text-[#242424]" />
                </div>
            </Link>

            {/* DELIVERED EXTRA: RATE & REVIEW */}
            {isDelivered && (
                <div className="flex w-full flex-col items-start px-[24px] lg:px-[32px] pb-[16px] gap-[10px]">
                    <Link href={`/account/orders/${order.id}/review`} className="flex w-full items-center gap-[16px] rounded-[16px] bg-[#eaffcc] px-[16px] py-[16px] transition-transform active:scale-[0.99] cursor-pointer border border-[#d6f5ad]">
                        <div className="flex items-center justify-center w-[40px] h-[40px]  shrink-0">
                            <img src="/images/review.png" alt="" className=' object-cover' />
                        </div>
                        <div className="flex flex-col items-start gap-[4px]">
                            <div className="flex items-start gap-[4px]">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-center  shrink-0 ">
                                        <StarIcon className="text-[#3f9633] w-[20px] h-[20px]" />
                                    </div>
                                ))}
                            </div>
                            <div className="font-rajdhani text-[13px] font-[500] leading-[18px]">
                                <span className="text-[rgba(36,36,36,0.8)]">Rate and Review your order to </span>
                                <span className="text-[#308026] font-[600]">win offers!</span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* FOOTER: NOTES & ACTIONS */}
            <div className="flex w-full justify-center px-[24px] lg:px-[32px]">
                <div className="flex flex-col w-full justify-between border-t border-[#f1f5f9] pt-[16px] pb-[20px] gap-[10px]">

                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-[8px]">
                            {!isFailedOrCancelled && !isDelivered && (
                                <button
                                    type="button"
                                    onClick={() => order.isCancellable && setIsCancelModalOpen(true)}
                                    disabled={!order.isCancellable}
                                    className={`flex h-[32px] items-center justify-center gap-[4px] rounded-[8px] border border-[#f1f5f9] px-[12px] transition-all ${order.isCancellable ? 'active:scale-95 hover:bg-red-50 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                                >
                                    <span className={`font-rajdhani text-[14px] font-[600] leading-[26px] tracking-[-0.03px] whitespace-nowrap ${order.isCancellable ? 'text-[#d92d20]' : 'text-[#854a4a]'}`}>
                                        Cancel Order
                                    </span>
                                </button>
                            )}
                            <Link href="/contact" className="flex h-[32px] items-center justify-center gap-[6px] rounded-[8px] border border-[#f1f5f9] px-[12px] transition-all hover:bg-gray-50 active:scale-95">
                                <HelpIcon className="w-[16px] h-[16px] text-[#242424]" />
                                <span className="font-rajdhani text-[14px] font-[600] leading-[26px] tracking-[-0.03px] text-[#242424] whitespace-nowrap">
                                    {isDelivered ? "Help with order !" : "Help"}
                                </span>
                            </Link>
                        </div>
                        <span className="font-rajdhani text-[14px] font-[500] leading-[30px] tracking-[0.4px] text-[#8a8e91] whitespace-nowrap">
                            ID: #{order.shortId}
                        </span>
                    </div>


                    <span className="font-rajdhani text-[12px] font-[500] leading-[18px] text-[rgba(36,36,36,0.8)]">
                        {isFailedOrCancelled
                            ? order.cancellationReason && order.status === 'CANCELLED'
                                ? `Cancellation Reason: ${order.cancellationReason}`
                                : "Note: Refund will take up to 7 days for cancelled and failed orders."
                            : isDelivered
                                ? <>Note: You can only get support for delivered items up to 4 days from the delivery date regarding any returns. Check our <Link href="/terms" className="text-[#308026] underline hover:text-[#242424] transition-colors">Terms and Conditions</Link>.</>
                                : order.isCancellable
                                    ? "Note: You can cancel your order before it gets dispatched."
                                    : "Note: Cancellation is not allowed once the product has shipped."}
                    </span>
                </div>
            </div>

            {/* CANCELLATION WIZARD MODAL */}
            <CancelOrderModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelOrder}
                isProcessing={isCancelling}
                savedAmount={0} // Typically discount could be mapped from order data!
            />
        </div>
    );
};

export default OrderCard;
