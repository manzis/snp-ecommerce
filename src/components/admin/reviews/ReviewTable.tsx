'use client';

import React from 'react';
import Image from 'next/image';
import { Review } from '@/services/productService';
import ReviewActionMenu from './ReviewActionMenu';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewTableProps {
    reviews: Review[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onEdit?: (review: Review) => void;
    onDelete?: (id: string) => void;
}

const StarRow = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={i <= rating ? 'text-amber-400' : 'text-gray-300'}>
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ))}
    </div>
);

export default function ReviewTable({ 
    reviews, 
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onEdit, 
    onDelete 
}: ReviewTableProps) {
    const isAllSelected = reviews.length > 0 && selectedIds.length === reviews.length;

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-gray-100 rounded-[24px]">
                <p className="text-lg font-medium">No reviews found</p>
                <p className="text-sm">Add a review or adjust your filters.</p>
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
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Photo</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Author</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Product Added</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Review</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Rating</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider">Status</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider whitespace-nowrap">Date</th>
                        <th className="py-4 px-4 text-[12px] font-semibold text-[#71717a] uppercase tracking-wider text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    <AnimatePresence mode="popLayout">
                        {reviews.map((review) => (
                            <motion.tr 
                                key={review.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group hover:bg-[#fafafa] transition-colors duration-200 ${selectedIds.includes(review.id) ? 'bg-[#fcfcfd]' : ''}`}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(review.id)}
                                            onChange={() => onToggleSelect(review.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-[#242424] focus:ring-[#242424] cursor-pointer"
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="h-10 w-10 relative rounded-xl overflow-hidden bg-[#f4f4f5] flex items-center justify-center shrink-0 border border-gray-100">
                                        {review.image ? (
                                            <Image src={review.image} alt={review.author} fill className="object-cover" />
                                        ) : (
                                            <span className="text-[14px] font-bold text-[#a1a1aa]">{review.author?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col gap-[1px]">
                                        <span className="text-[14px] font-bold text-[#18181b]">{review.author}</span>
                                        {review.role && (
                                            <span className="text-[11px] text-[#71717a] font-medium">{review.role}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4 min-w-[150px]">
                                    {(review.products_data?.length ?? 0) > 0 ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-semibold text-[#242424] line-clamp-1">
                                                {review.products_data![0].title || review.products_data![0].name}
                                                {review.products_data!.length > 1 && (
                                                    <span className="ml-1 text-[11px] text-[#71717a] font-medium">
                                                        + {review.products_data!.length - 1} more
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    ) : review.products ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[13px] font-semibold text-[#242424] line-clamp-1">
                                                {review.products.title || review.products.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-[12px] text-gray-400 italic">No Product</span>
                                    )}
                                </td>
                                <td className="py-4 px-4 max-w-[280px]">
                                    <p className="text-[13px] text-[#71717a] leading-relaxed line-clamp-2">{review.text}</p>
                                </td>
                                <td className="py-4 px-4">
                                    <StarRow rating={review.rating} />
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${review.is_verified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-[#71717a] border border-gray-100'}`}>
                                        {review.is_verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 whitespace-nowrap">
                                    <span className="text-[12px] text-[#a1a1aa]">
                                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex justify-center">
                                        <ReviewActionMenu review={review} onEdit={onEdit} onDelete={onDelete} />
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
