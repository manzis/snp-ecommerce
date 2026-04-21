'use client';

import React from "react";
import { Coupon } from "./CouponActionMenu";
import CouponActionMenu from "./CouponActionMenu";
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Calendar, ShoppingCart, Percent, DollarSign, Package } from "lucide-react";

interface CouponTableProps {
    coupons: Coupon[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onEditAction?: (coupon: Coupon) => void;
    onDeleteAction?: (id: string) => void;
}

export default function CouponTable({
    coupons,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onEditAction,
    onDeleteAction
}: CouponTableProps) {
    const isAllSelected = coupons.length > 0 && selectedIds.length === coupons.length;

    if (coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-100 rounded-[24px]">
                <Tag className="w-12 h-12 text-gray-200 mb-4" />
                <p className="text-lg font-medium">No coupons found</p>
                <p className="text-sm">Create your first coupon to offer discounts.</p>
            </div>
        );
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'No expiry';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isExpired = (dateStr: string | null) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    return (
        <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr className="border-b border-gray-50 bg-[#fafafa]">
                        <th className="py-4 px-4 w-[40px]">
                            <div className="flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={onToggleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                />
                            </div>
                        </th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Coupon Code</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Type & Value</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Requirements</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Expires At</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Status</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                        {coupons.map((coupon) => (
                            <motion.tr 
                                key={coupon.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group hover:bg-[#fafafa] transition-colors duration-200 ${selectedIds.includes(coupon.id) ? 'bg-[#fcfcfd]' : ''}`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(coupon.id)}
                                            onChange={() => onToggleSelect(coupon.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-bold text-[#242424] font-mono tracking-wider bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                                {coupon.code}
                                            </span>
                                        </div>
                                        <span className="text-[12px] text-[#71717a] mt-1 max-w-[200px] truncate" title={coupon.description || ''}>
                                            {coupon.description || 'No description'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${coupon.type === 'percentage' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                            {coupon.type === 'percentage' ? <Percent className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-semibold text-[#242424]">
                                                {coupon.type === 'percentage' ? `${coupon.value}% Off` : `Rs. ${coupon.value} Off`}
                                            </span>
                                            {coupon.type === 'percentage' && coupon.max_discount && (
                                                <span className="text-[11px] text-[#71717a]">Up to Rs. {coupon.max_discount}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <ShoppingCart className="w-3.5 h-3.5 text-[#a1a1aa]" />
                                            <span className="text-[13px] text-[#71717a]">
                                                Min: <span className="font-medium text-[#242424]">Rs. {coupon.min_cart_value}</span>
                                            </span>
                                        </div>
                                        {coupon.products && (
                                            <div className="flex items-center gap-1.5">
                                                <Package className="w-3.5 h-3.5 text-[#a1a1aa]" />
                                                <span className="text-[11px] text-[#71717a] max-w-[150px] truncate bg-gray-100 px-1.5 py-0.5 rounded" title={coupon.products.title}>
                                                    {coupon.products.title}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className={`w-3.5 h-3.5 ${isExpired(coupon.expires_at) ? 'text-red-400' : 'text-[#a1a1aa]'}`} />
                                        <span className={`text-[13px] ${isExpired(coupon.expires_at) ? 'text-red-600 font-medium' : 'text-[#71717a]'}`}>
                                            {formatDate(coupon.expires_at)}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                                            coupon.is_active && !isExpired(coupon.expires_at)
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                            {coupon.is_active && !isExpired(coupon.expires_at) ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <CouponActionMenu 
                                            coupon={coupon}
                                            onEdit={onEditAction}
                                            onDelete={onDeleteAction}
                                        />
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
