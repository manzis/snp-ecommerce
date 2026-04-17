'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Brand } from '@/services/productService';
import BrandActionMenu from './BrandActionMenu';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandTableProps {
    brands: Brand[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onEdit?: (brand: Brand) => void;
    onDelete?: (id: string) => void;
}

export default function BrandTable({ 
    brands, 
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onEdit, 
    onDelete 
}: BrandTableProps) {
    const isAllSelected = brands.length > 0 && selectedIds.length === brands.length;

    if (brands.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-100 rounded-[24px]">
                <p className="text-lg font-medium">No brands found</p>
                <p className="text-sm">Try adding a new brand or adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left border-collapse">
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
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider w-[80px]">Logo</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Brand Name</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Slug / ID</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Rating</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                        {brands.map((brand) => (
                            <motion.tr 
                                key={brand.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group hover:bg-[#fafafa] transition-colors duration-200 ${selectedIds.includes(brand.id) ? 'bg-[#fcfcfd]' : ''}`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(brand.id)}
                                            onChange={() => onToggleSelect(brand.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="h-10 w-10 relative rounded-lg overflow-hidden border border-gray-100 bg-gray-50 group-hover:scale-105 transition-transform">
                                        <Image
                                            src={brand.image_url || "/images/placeholder-brand.png"}
                                            alt={brand.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <Link 
                                        href={`/admin/brands/${brand.slug || brand.id}`}
                                        className="text-[14px] font-medium text-[#242424] hover:underline underline-offset-4 decoration-zinc-300"
                                    >
                                        {brand.name}
                                    </Link>
                                </td>
                                <td className="py-4 px-4">
                                    <span className="text-[13px] text-[#71717a] font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                        {brand.slug || brand.id}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-lime-100/50 border border-lime-200">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-lime-700">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                        <span className="text-[12px] font-semibold text-lime-700">{brand.rating || 0}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <BrandActionMenu 
                                            brand={brand}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
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
