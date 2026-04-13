'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/services/productService';
import ProductActionMenu from './ProductActionMenu';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductTableViewProps {
    products: Product[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onUpdate: (id: string, updates: Partial<Product>) => void;
    onDelete: (id: string, title: string) => void;
    onDuplicate: (id: string) => void;
    onUpdatePrice: (product: Product) => void;
}

export default function ProductTableView({
    products,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onUpdate,
    onDelete,
    onDuplicate,
    onUpdatePrice
}: ProductTableViewProps) {
    const isAllSelected = products.length > 0 && selectedIds.length === products.length;

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
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Product</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Status</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Variants</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-right">Price</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                        {products.map((product) => (
                            <motion.tr
                                key={product.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group hover:bg-[#fafafa] transition-colors duration-200 ${selectedIds.includes(product.id) ? 'bg-[#fcfcfd]' : ''}`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(product.id)}
                                            onChange={() => onToggleSelect(product.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                        />
                                    </div>
                                </td>
                                
                                <td className="py-4 px-4 min-w-[300px]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[48px] h-[48px] rounded-[8px] overflow-hidden bg-[#f4f4f5] border border-gray-50 flex-shrink-0 relative">
                                            <Image
                                                src={product.images?.[0] || "/images/product-placeholder.png"}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-[11px] font-regular text-[#71717a] uppercase tracking-tight">
                                                {product.brands?.name || 'SNP'}
                                            </span>
                                            <h3 className="text-[14px] font-medium text-[#242424] truncate max-w-[200px] md:max-w-[240px]">
                                                {product.title}
                                            </h3>
                                            <span className="text-[12px] text-[#a1a1aa] font-regular">
                                                {product.categories?.name || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-4 px-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            {/* Visibility Badge */}
                                            <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-tight ${
                                                product.is_draft 
                                                ? 'bg-gray-50 border-gray-200 text-gray-500' 
                                                : product.is_published 
                                                    ? 'bg-[linear-gradient(56.09deg,#242424,#8a8a8a)] border-[#e4e4e7] text-white' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-500'
                                            }`}>
                                                {product.is_draft ? 'Draft' : product.is_published ? 'Live' : 'Hidden'}
                                            </div>

                                            {/* Inventory Badge */}
                                            <div className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-tight ${
                                                product.stock_status === 'out_of_stock'
                                                ? 'bg-red-50 border-red-100 text-red-600'
                                                : product.stock_status === 'pre_order'
                                                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                                                    : 'bg-green-50 border-green-100 text-green-700'
                                            }`}>
                                                {product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'pre_order' ? 'Pre-Order' : 'Out of Stock'}
                                            </div>
                                        </div>
                                        {/* Numeric Stock Level */}
                                        <span className="text-[11px] font-semibold text-[#74a134] px-1">
                                            {product.stock_count || 0} Units
                                        </span>
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                                        {/* Sizes */}
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider flex-shrink-0 w-8">Sizes</span>
                                            <span className="text-[12px] font-medium text-[#242424] truncate">
                                                {product.product_sizes && product.product_sizes.length > 0 
                                                    ? product.product_sizes.map(s => s.size_label).join(", ") 
                                                    : "—"}
                                            </span>
                                        </div>
                                        {/* Flavours */}
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider flex-shrink-0 w-8">Flavs</span>
                                            <span className="text-[12px] font-medium text-[#242424] truncate">
                                                {product.product_flavours && product.product_flavours.length > 0 
                                                    ? product.product_flavours.map(f => f.flavour_name).join(", ") 
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-4 px-4 text-right">
                                    <div className="flex flex-col items-end gap-0.5">
                                        {product.product_variants?.[0] ? (
                                            <>
                                                {product.product_variants[0].original_price > product.product_variants[0].discounted_price && (
                                                    <span className="text-[11px] text-[#a1a1aa] line-through">
                                                        NPR {product.product_variants[0].original_price}
                                                    </span>
                                                )}
                                                <span className="text-[14px] font-semibold text-[#242424]">
                                                    NPR {product.product_variants[0].discounted_price}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {product.original_price && product.original_price !== product.discounted_price && (
                                                    <span className="text-[11px] text-[#a1a1aa] line-through font-regular uppercase tracking-tight">
                                                        NPR {product.original_price}
                                                    </span>
                                                )}
                                                <span className="text-[14px] font-semibold text-[#242424]">
                                                    NPR {product.discounted_price}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <ProductActionMenu
                                            onUpdate={(updates) => onUpdate(product.id, updates)}
                                            onUpdatePrice={() => onUpdatePrice(product)}
                                            onDelete={() => onDelete(product.id, product.title)}
                                            onDuplicate={() => onDuplicate(product.id)}
                                            fullProduct={product}
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
