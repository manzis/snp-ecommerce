'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/services/productService";
import CategoryActionMenu from "./CategoryActionMenu";
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryTableProps {
    categories: Category[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onEditAction?: (category: Category) => void;
    onDeleteAction?: (id: string) => void;
}

export default function CategoryTable({
    categories,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onEditAction,
    onDeleteAction
}: CategoryTableProps) {
    const isAllSelected = categories.length > 0 && selectedIds.length === categories.length;

    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-100 rounded-[24px]">
                <p className="text-lg font-medium">No categories found</p>
                <p className="text-sm">Add a new category to get started.</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto border border-gray-100 rounded-[12px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left border-collapse min-w-[700px]">
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
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider w-[80px]">Image</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Category</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Products</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider w-[300px]">Description</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Benefits</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                        {categories.map((category) => (
                            <motion.tr 
                                key={category.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group hover:bg-[#fafafa] transition-colors duration-200 ${selectedIds.includes(category.id) ? 'bg-[#fcfcfd]' : ''}`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(category.id)}
                                            onChange={() => onToggleSelect(category.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="h-12 w-12 relative rounded-xl overflow-hidden border border-gray-100 bg-gray-100/50 shadow-sm group-hover:scale-105 transition-transform">
                                        <Image
                                            src={category.image_url || "/images/placeholder-category.png"}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <Link 
                                        href={`/admin/categories/${category.slug || category.id}`}
                                        className="flex flex-col"
                                    >
                                        <span className="text-[14px] font-medium text-[#242424] hover:underline underline-offset-4 decoration-zinc-300">
                                            {category.name}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[11px] text-[#71717a] font-mono">
                                                /{category.slug || category.id}
                                            </span>
                                            {category.is_other_category && (
                                                <span className="bg-[#f4f4f5] text-[#242424] font-semibold border border-[#d4d4d8] px-1.5 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider leading-none">Other</span>
                                            )}
                                        </div>
                                    </Link>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[14px] font-semibold text-[#242424]">{category.product_count || 0}</span>
                                        <span className="text-[11px] text-[#a1a1aa] font-medium uppercase tracking-wider">Items</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <p className="text-[13px] text-[#71717a] line-clamp-2 leading-relaxed max-w-[300px]">
                                        {category.description || <span className="text-[#a1a1aa] italic">No description</span>}
                                    </p>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-wrap gap-1">
                                        {category.benefits ? (
                                            category.benefits.split(',').slice(0, 2).map((benefit, idx) => (
                                                <span key={idx} className="text-[10px] bg-zinc-100 text-[#71717a] px-2 py-0.5 rounded-full font-medium whitespace-nowrap border border-zinc-200/50 flex items-center gap-1">
                                                    <div className="w-1 h-1 bg-zinc-400 rounded-full" />
                                                    {benefit.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-[#a1a1aa] italic">None</span>
                                        )}
                                        {category.benefits && category.benefits.split(',').length > 2 && (
                                            <span className="text-[10px] text-[#a1a1aa] font-medium">+{category.benefits.split(',').length - 2}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <CategoryActionMenu 
                                            category={category}
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
