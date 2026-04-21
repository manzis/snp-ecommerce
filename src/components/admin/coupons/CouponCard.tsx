'use client';

import React from "react";
import Link from "next/link";
import { Coupon } from "./CouponActionMenu";
import CouponActionMenu from "./CouponActionMenu";
import TicketIcon from "@/components/icons/TicketIcon";
import DiscountIcon from "@/components/icons/DiscountIcon";

// --- SUB-COMPONENT: COUPON CARD ---
export const CouponCard = ({ 
    coupon, 
    onEditAction, 
    onDeleteAction 
}: { 
    coupon: Coupon;
    onEditAction?: (coupon: Coupon) => void;
    onDeleteAction?: (id: string) => void;
}) => {
    const isPercentage = coupon.type === 'percentage';
    
    return (
        <div className="flex flex-col gap-[12px] justify-center items-start w-full relative group font-rubik">
            {/* Coupon Visual Container */}
            <div className="h-[140px] w-full relative shrink-0 bg-zinc-50 border border-zinc-100 rounded-[20px] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:border-zinc-200">
                {/* Background & Content Wrapper (Clipping happens here for background/status) */}
                <div className="absolute inset-0 rounded-[20px] overflow-hidden">
                    {/* Background Pattern/Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <TicketIcon className="w-24 h-24 rotate-[-12deg]" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-[12px] left-[12px] z-[10]">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Coupon Value Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                        <div className="flex items-baseline gap-0.5">
                            <span className="text-[32px] font-bold text-[#242424] tracking-tight">
                                {isPercentage ? coupon.value : `₹${coupon.value}`}
                            </span>
                            {isPercentage && <span className="text-[18px] font-bold text-[#242424]">%</span>}
                        </div>
                        <span className="text-[11px] font-semibold text-[#71717a] uppercase tracking-[0.1em]">
                            off
                        </span>
                    </div>

                    {/* Bottom Detail Bar */}
                    <div className="absolute bottom-[10px] left-[10px] right-[10px] z-[10] bg-white border border-zinc-50 px-3 py-1.5 rounded-[12px] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <DiscountIcon className="w-3.5 h-3.5 text-[#242424] shrink-0" />
                            <span className="text-[12px] font-bold text-[#242424] truncate tracking-tight">{coupon.code}</span>
                        </div>
                        <div className="text-[10px] text-[#a1a1aa] font-medium shrink-0">
                            {coupon.min_cart_value > 0 ? `Min ₹${coupon.min_cart_value}` : 'No Min'}
                        </div>
                    </div>
                </div>

                {/* Action Icon Button - Outside the overflow-hidden wrapper so dropdown is visible */}
                <div className="absolute top-[10px] right-[10px] z-[50]">
                    <CouponActionMenu 
                        coupon={coupon}
                        onEdit={onEditAction}
                        onDelete={onDeleteAction}
                    />
                </div>
            </div>

            {/* Coupon Details */}
            <div className="flex px-[4px] flex-col gap-[6px] justify-center items-start self-stretch shrink-0 relative z-[6]">
                <div className="flex flex-col gap-0.5 w-full">
                    <h3 className="text-[14px] font-[600] leading-tight text-[#242424] group-hover:text-black transition-colors">
                        {coupon.description || "No description"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                         <span className="text-[11px] text-[#71717a] font-medium">
                            {coupon.expires_at ? `Expires: ${new Date(coupon.expires_at).toLocaleDateString()}` : 'No expiry'}
                        </span>
                        {coupon.max_discount && (
                            <span className="text-[11px] text-[#a1a1aa]">
                                • Max: ₹{coupon.max_discount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN EXPORT: COUPON GRID ---
export default function CouponGrid({ 
    coupons,
    onEditAction,
    onDeleteAction
}: { 
    coupons: Coupon[];
    onEditAction?: (coupon: Coupon) => void;
    onDeleteAction?: (id: string) => void;
}) {
    if (coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400 font-rubik">
                <TicketIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[16px] font-semibold text-zinc-900">No coupons found</p>
                <p className="text-[14px]">Try adding a new coupon or adjusting your search.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-[16px] gap-y-[24px] items-start relative w-full">
                {coupons.map((coupon) => (
                    <CouponCard 
                        key={coupon.id} 
                        coupon={coupon} 
                        onEditAction={onEditAction} 
                        onDeleteAction={onDeleteAction} 
                    />
                ))}
            </div>
        </section>
    );
}
