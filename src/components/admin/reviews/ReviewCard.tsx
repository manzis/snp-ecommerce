'use client';

import React from "react";
import Image from "next/image";
import { Review } from "@/services/productService";
import ReviewActionMenu from "./ReviewActionMenu";
import StarIcon from "@/components/icons/StarIcon";

interface ReviewCardProps {
    review: Review;
    onEditAction?: (review: Review) => void;
    onDeleteAction?: (id: string) => void;
    showCheckbox?: boolean;
    isSelected?: boolean;
    onToggleAction?: (id: string) => void;
}

export function ReviewCard({
    review,
    onEditAction,
    onDeleteAction,
    showCheckbox,
    isSelected,
    onToggleAction,
}: ReviewCardProps) {
    // Map backend data to UI
    const productImageUrl = review.image || review.products?.images?.[0];
    const rating = review.rating || 0;
    const reviewText = review.text || "";
    const reviewerName = review.author || "Anonymous";
    const reviewerRole = review.role || "";
    const reviewerAvatarUrl = review.author_avatar;

    return (
        <article className="group flex flex-col w-full max-w-[323px] mx-auto p-[10px] gap-[12px] bg-[#ffffff] rounded-[14px] border-[1px] border-[#f3f4f6] relative font-['Rubik',sans-serif] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.04)] hover:border-[#e5e7eb] transition-all duration-[200ms] ease-in-out cursor-pointer overflow-hidden">
            
            {/* Action Button / Checkbox Overlay */}
            <div className="absolute top-[8px] right-[11px] z-[15] pointer-events-auto">
                {showCheckbox ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleAction?.(review.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                                ? "bg-black border-black text-white" 
                                : "bg-white/80 border-gray-200 text-transparent hover:border-black"
                        }`}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                ) : (
                    <ReviewActionMenu 
                        review={review} 
                        onEdit={onEditAction} 
                        onDelete={onDeleteAction} 
                    />
                )}
            </div>

            {/* Top Review Section */}
            <div className={`flex gap-[16px] items-stretch relative ${!productImageUrl ? 'flex-col' : ''}`}>
                {/* Media Container */}
                {productImageUrl && (
                    <div className="flex w-[120px] self-stretch shrink-0 items-center justify-center rounded-[8px] relative overflow-hidden bg-[#f9fafb] z-[1] border border-gray-100">
                        {productImageUrl.match(/\.(mp4|webm|mov|ogg)$/i) ? (
                            <video
                                src={productImageUrl}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                autoPlay
                            />
                        ) : (
                            <Image
                                src={productImageUrl}
                                alt={`Review media by ${reviewerName}`}
                                fill
                                className="object-cover"
                                sizes="120px"
                            />
                        )}
                    </div>
                )}

                {/* Review Content Segment */}
                <div className="flex flex-col flex-1 min-w-[0px] gap-[20px] items-start grow shrink-0 basis-[0px] relative z-[2]">

                    {/* Star Rating Array */}
                    <div className="flex w-[88px] gap-[2px] items-start shrink-0 relative z-[3] mt-[2px]">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="w-[16px] h-[16px] relative shrink-0 overflow-hidden">
                                <StarIcon
                                    className={`w-full h-full ${index < rating ? "text-[#facc15]" : "text-[#e5e7eb]"}`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Review Text (Line-clamped to match exact 60px height requirement) */}
                    <p className="flex w-full text-[16px] font-[500] leading-[20px] text-[#242424] line-clamp-3 text-ellipsis relative z-[9] m-[0px]">
                        {reviewText}
                    </p>

                    {/* Reviewer Profile */}
                    <div className="flex w-full pb-[6px] gap-[13px] items-center self-stretch shrink-0 relative overflow-hidden z-[10] mt-auto">

                        {/* Avatar */}
                        <div className="w-[35px] h-[35px] shrink-0 rounded-full relative overflow-hidden bg-[#f3f4f6] z-[11] flex items-center justify-center border border-gray-200">
                            {reviewerAvatarUrl ? (
                                <Image
                                    src={reviewerAvatarUrl}
                                    alt={reviewerName}
                                    fill
                                    className="object-cover"
                                    sizes="35px"
                                />
                            ) : (
                                <span className="text-[12px] font-bold text-[#a1a1aa]">{reviewerName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div className="flex flex-col items-start flex-1 min-w-[0px] relative z-[12]">
                            <span className="h-[18px] w-full shrink-0 text-[12px] font-[500] leading-[18px] text-[#242424] whitespace-nowrap overflow-hidden text-ellipsis relative z-[13]">
                                {reviewerName}
                            </span>
                            <span className="h-[13px] w-full shrink-0 text-[10px] font-[500] leading-[13px] text-[#68727d] whitespace-nowrap overflow-hidden text-ellipsis relative z-[14]">
                                {reviewerRole}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* Product Context Tag (Many-to-Many support) */}
            {(review.products_data?.length ?? 0) > 0 ? (
                <div className="flex items-center gap-2 px-[10px] py-[6.5px] bg-zinc-50 rounded-[8px] border border-gray-200/50 self-start max-w-full overflow-hidden">
                    <span className="text-[9px] font-medium text-[#a1a1aa] uppercase tracking-[0.05em] shrink-0">Linked to:</span>
                    <span className="text-[10px] font-medium text-[#52525b] truncate">
                        {review.products_data![0].title || review.products_data![0].name}
                        {review.products_data!.length > 1 && ` + ${review.products_data!.length - 1} more`}
                    </span>
                </div>
            ) : review.products ? (
                <div className="flex items-center gap-2 px-[10px] py-[6.5px] bg-zinc-50 rounded-[8px] border border-gray-200/50 self-start max-w-full overflow-hidden">
                    <span className="text-[9px] font-medium text-[#a1a1aa] uppercase tracking-[0.05em] shrink-0">Added on:</span>
                    <span className="text-[10px] font-medium text-[#52525b] truncate">
                        {review.products.title || review.products.name}
                    </span>
                </div>
            ) : null}
        </article>
    );
}

// --- REVIEW GRID ---
export default function ReviewGrid({
    reviews,
    onEditAction,
    onDeleteAction,
    showCheckbox,
    selectedIds = [],
    onToggleAction,
}: {
    reviews: Review[];
    onEditAction?: (review: Review) => void;
    onDeleteAction?: (id: string) => void;
    showCheckbox?: boolean;
    selectedIds?: string[];
    onToggleAction?: (id: string) => void;
}) {
    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-[#a1a1aa] bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-50">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-lg font-bold text-[#242424]">No reviews found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-[20px] gap-y-[32px] items-start">
                {reviews.map((review) => (
                    <ReviewCard 
                        key={review.id} 
                        review={review} 
                        onEditAction={onEditAction} 
                        onDeleteAction={onDeleteAction} 
                        showCheckbox={showCheckbox}
                        isSelected={selectedIds.includes(review.id)}
                        onToggleAction={onToggleAction}
                    />
                ))}
            </div>
        </section>
    );
}
