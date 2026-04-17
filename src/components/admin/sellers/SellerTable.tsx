'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Seller } from "@/services/productService";
import SellerActionMenu from "./SellerActionMenu";
import { motion, AnimatePresence } from 'framer-motion';

interface SellerTableProps {
    sellers: Seller[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onEditAction?: (seller: Seller) => void;
    onDeleteAction?: (id: string) => void;
}

export default function SellerTable({
    sellers,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onEditAction,
    onDeleteAction
}: SellerTableProps) {
    const isAllSelected = sellers.length > 0 && selectedIds.length === sellers.length;

    if (sellers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-100 rounded-[24px]">
                <p className="text-lg font-medium">No sellers found</p>
                <p className="text-sm">Add a new seller to get started.</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left border-collapse min-w-[800px]">
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
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider w-[100px]">Logo</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Seller Name</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Status</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Rating</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                        {sellers.map((seller) => (
                            <motion.tr 
                                key={seller.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group hover:bg-[#fafafa] transition-colors duration-200 ${selectedIds.includes(seller.id) ? 'bg-[#fcfcfd]' : ''}`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(seller.id)}
                                            onChange={() => onToggleSelect(seller.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="h-12 w-12 relative rounded-xl overflow-hidden border border-gray-100 bg-gray-100/50 shadow-sm group-hover:scale-105 transition-transform">
                                        <Image
                                            src={seller.image_url || "/images/placeholder-seller.png"}
                                            alt={seller.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col">
                                        <Link 
                                            href={`/admin/sellers/${seller.slug || seller.id}`}
                                            className="text-[14px] font-medium text-[#242424] hover:underline underline-offset-4 decoration-zinc-300"
                                        >
                                            {seller.name}
                                        </Link>
                                        <span className="text-[11px] text-[#a1a1aa] font-mono mt-0.5">{seller.slug}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {seller.is_verified ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-medium text-blue-600">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[11px] font-medium text-gray-500">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-lime-100/50 border border-lime-200">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-lime-700">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <span className="text-[12px] font-semibold text-lime-700">{seller.rating || 0}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <SellerActionMenu 
                                            seller={seller}
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
