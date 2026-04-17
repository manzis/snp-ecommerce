'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { OrderProps } from "@/components/orders/OrderCard";
import OrderActionMenu from "./OrderActionMenu";

export interface AdminOrderCardProps {
    order: OrderProps;
    isNew?: boolean;
    onViewOrder?: (order: OrderProps) => void;
    onUpdateStatus?: (order: OrderProps) => void;
    onUpdatePaymentStatus?: (order: OrderProps) => void;
    onDeleteOrder?: (order: OrderProps) => void;
}

export default function OrderCard({
    order,
    isNew,
    onViewOrder,
    onUpdateStatus,
    onUpdatePaymentStatus,
    onDeleteOrder,
}: AdminOrderCardProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Derived values
    const orderIdValue = order.shortId || order.id.split('-')[0].toUpperCase();
    const statusValue = order.status;
    const brandValue = order.brand;
    const productNameValue = order.title;
    const additionalItemsCountValue = order.extraItemsCount;
    const productImageUrlValue = order.image;
    const totalItemsCountValue = order.itemsCount;
    const customerNameValue = order.customerName;
    const customerAddressValue = order.shippingAddress ? `${order.shippingAddress.area || ''}, ${order.shippingAddress.city || ''}` : 'N/A';
    const totalAmountValue = `NPR ${order.totalAmount}`;
    const paymentMethodValue = order.paymentMethod?.toUpperCase();

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

    const relativeDateLabel = getRelativeDate(order.createdAt);

    const getStatusColors = (status?: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'DELIVERED':
                return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' };
            case 'OUT_FOR_DELIVERY':
                return { bg: 'bg-[#f9fafb]', text: 'text-green-700', border: 'border-[#f5f5f5]' };
            case 'IN_TRANSIT':
            case 'RESCHEDULED':
                return { bg: 'bg-[#fefce8]', text: 'text-[#854d0e]', border: 'border-[#fef9c3]' };
            case 'CANCELLED':
            case 'FAILED':
                return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
            default:
                return { bg: 'bg-[#f9fafb]', text: 'text-[#71717a]', border: 'border-[#f5f5f5]' };
        }
    };

    const statusColors = getStatusColors(statusValue);

    const getPaymentStatusColors = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { bg: 'bg-green-100', label: 'Paid', text: 'text-green-800' };
            case 'partially_paid':
                return { bg: 'bg-[#fef08a]', label: 'Part. Paid', text: 'text-[#854d0e]' };
            case 'pending':
            default:
                return { bg: 'bg-zinc-100', label: 'Pending', text: 'text-[#3f3f46]' };
        }
    };
    
    const paymentColors = getPaymentStatusColors(order.paymentStatus);

    return (
        <article 
            onClick={() => onViewOrder && onViewOrder(order)}
            className={`flex w-full max-w-[378px] mx-auto flex-col rounded-[12px] relative group transition-all duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] font-rubik tracking-tight hover:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] border cursor-pointer ${isMenuOpen ? 'z-[60]' : 'z-[1]'} ${
                isNew 
                ? 'border-transparent' 
                : 'bg-white border-gray-50/50 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.03)]'
            }`}
            style={isNew ? {
                background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #ffffff, #18181b) border-box',
                border: '1px solid transparent',
            } : {}}
        >

            <div className="flex flex-col w-full h-full relative">
                {/* --- HEADER (Exceptions stay as is) --- */}
                <header className={`flex px-[14px] py-[12px] justify-between items-center self-stretch shrink-0 ${statusColors.bg} relative z-[20] rounded-t-[12px] transition-colors duration-300`}>

                    {/* Status Segment */}
                    <div className="flex gap-[8px] items-center shrink-0 relative z-[2]">
                        <span className={`shrink-0 text-[13px] font-[400] ${statusValue ? 'opacity-70' : ''} text-[#71717a] whitespace-nowrap`}>
                            Status:
                        </span>
                        <span className={`text-[13px] font-medium whitespace-nowrap ${statusColors.text}`}>
                            {statusValue}
                        </span>
                    </div>

                    {/* Action Menu Component */}
                    <OrderActionMenu
                        order={order}
                        onViewOrder={onViewOrder}
                        onUpdateStatus={onUpdateStatus}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                        onDeleteOrder={onDeleteOrder}
                        onOpenChange={setIsMenuOpen}
                    />
                </header>

                {/* --- BODY (Padded to match ProductCard) --- */}
                <div className="flex p-[14px] flex-col gap-[16px] items-start self-stretch grow relative z-[1]">

                    {/* Order ID + Date Row */}
                    <div className="flex items-center justify-between self-stretch shrink-0 relative z-[10]">
                        <div className="flex items-center gap-[6px]">
                            <h3 className="shrink-0 text-[12px] font-[400] leading-[14px] text-[#71717a] uppercase tracking-wider whitespace-nowrap">
                                Order #{orderIdValue}
                            </h3>
                            {isNew && (
                                <span className="flex h-[18px] px-[6px] py-[2px] justify-center items-center shrink-0 bg-[#242424] text-white rounded-[4px] text-[9px] font-bold tracking-widest animate-pulse">
                                    NEW
                                </span>
                            )}
                        </div>
                        {relativeDateLabel && (
                            <span className="text-[11px] text-[#a1a1aa] tracking-tight font-normal">
                                {relativeDateLabel}
                            </span>
                        )}
                    </div>

                    {/* Product Info Block */}
                    <div className="flex flex-col gap-[16px] justify-center items-start self-stretch grow relative z-[12]">
                        <div className="flex gap-[12px] items-stretch self-stretch relative z-[13]">

                            {/* Product Image */}
                            <div className="w-[88px] min-h-[88px] shrink-0 rounded-[8px] relative overflow-hidden bg-[#f4f4f5] z-[14] border border-[#f5f5f5]">
                                <Image
                                    src={productImageUrlValue || '/images/product-placeholder.png'}
                                    alt={productNameValue || 'Product'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="88px"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col gap-[8px] justify-between items-start self-stretch grow basis-[0px] relative z-[15] pr-[10px]">
                                <div className="flex flex-col gap-[4px] items-start self-stretch relative z-[16]">
                                    <span className="shrink-0 text-[11px] font-[400] leading-[14px] text-[#71717a] whitespace-nowrap">
                                        {brandValue}
                                    </span>

                                    {/* Title & Extra Items Pill Container */}
                                    <div className="flex items-center gap-[6px] self-stretch">
                                        <span className="shrink-0 text-[14px] font-medium leading-[20px] text-[#3f3f46] truncate max-w-[170px]">
                                            {productNameValue}
                                        </span>
                                        {additionalItemsCountValue > 0 && (
                                            <div className="flex h-[20px] px-[6px] py-[2px] justify-center items-center shrink-0 bg-gray-50 rounded-[4px] border border-gray-100">
                                                <span className="text-[10px] font-medium leading-none text-gray-500 whitespace-nowrap">
                                                    +{additionalItemsCountValue} more
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Size & Flavor tags */}
                                    <div className="flex items-center gap-[6px] flex-wrap mt-[2px]">
                                        {order.size && order.size !== 'Standard' && (
                                            <span className="text-[10px] font-mono text-[#71717a] bg-zinc-50 border border-gray-100 rounded px-1.5 py-0.5">
                                                {order.size}
                                            </span>
                                        )}
                                        {order.flavour && order.flavour !== 'Default' && (
                                            <span className="text-[10px] text-[#71717a] truncate max-w-[120px]">
                                                {order.flavour}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="flex gap-[8px] items-center self-stretch relative z-[21]">
                                    <span className="shrink-0 text-[16px] font-semibold text-[#242424] whitespace-nowrap">
                                        {totalAmountValue}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* --- DETAILS GRID (Matching ProductCard's bottom table style) --- */}
                        <div className="flex h-[83px] items-start self-stretch shrink-0 rounded-[8px] border-[1px] border-[#f3f4f6] relative overflow-hidden z-[24] bg-white">

                            {/* Items Column */}
                            <div className="flex w-[68px] px-[12px] py-[12px] flex-col gap-[6px] items-start self-stretch shrink-0 border-r-[1px] border-[#f3f4f6] relative z-[25]">
                                <span className="shrink-0 text-[11px] font-regular text-[#a1a1aa] uppercase tracking-wider whitespace-nowrap">
                                    Items
                                </span>
                                <span className="shrink-0 text-[13px] font-medium text-[#242424] whitespace-nowrap">
                                    {totalItemsCountValue}
                                </span>
                            </div>

                            {/* Customer Info Column */}
                            <div className="flex px-[12px] py-[12px] flex-col gap-[6px] items-start self-stretch grow basis-[0px] relative z-[28] overflow-hidden border-r-[1px] border-[#f3f4f6]">
                                <span className="shrink-0 text-[11px] font-regular text-[#a1a1aa] uppercase tracking-wider whitespace-nowrap">
                                    Customer
                                </span>
                                <div className="w-full flex flex-col gap-[2px] overflow-hidden">
                                    <span className="text-[13px] font-medium leading-[18px] text-[#242424] truncate">
                                        {customerNameValue}
                                    </span>
                                    <span className="text-[12px] text-[#71717a] truncate">
                                        {customerAddressValue}
                                    </span>
                                </div>
                            </div>

                            {/* Total Amount Column (Matching Paid style) */}
                            <div className={`flex w-[95px] px-[12px] py-[12px] flex-col gap-[6px] items-start self-stretch shrink-0 ${paymentColors.bg} relative z-[31]`}>
                                <span className={`shrink-0 text-[11px] font-regular ${paymentColors.text} uppercase tracking-wider whitespace-nowrap opacity-60`}>
                                    {paymentColors.label}
                                </span>
                                <div className="flex flex-col gap-[2px] items-start self-stretch shrink-0 relative z-[33]">
                                    <span className={`shrink-0 text-[14px] font-semibold leading-[18px] ${paymentColors.text} whitespace-nowrap`}>
                                        {totalAmountValue}
                                    </span>
                                    <span className={`shrink-0 text-[10px] font-medium leading-[14px] ${paymentColors.text} whitespace-nowrap opacity-70`}>
                                        {paymentMethodValue}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </article>
    );
}