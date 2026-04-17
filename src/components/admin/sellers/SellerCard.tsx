'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Seller } from "@/services/productService";
import SellerActionMenu from "./SellerActionMenu";

// --- SUB-COMPONENT: SELLER CARD ---
export const SellerCard = ({ 
    seller, 
    onEditAction, 
    onDeleteAction 
}: { 
    seller: Seller;
    onEditAction?: (seller: Seller) => void;
    onDeleteAction?: (id: string) => void;
}) => {
    return (
        <div className="flex flex-col gap-[10px] justify-center items-start w-full relative group font-rubik tracking-tight">
            {/* Seller Image Container */}
            <div className="h-[160px] w-full relative shrink-0 bg-[#f4f4f5] rounded-[24px] overflow-hidden transition-shadow">
                <Link
                    href={`/admin/sellers/${seller.slug || seller.id}`}
                    className="absolute inset-0 z-[1]"
                >
                    <Image
                        src={seller.image_url || "/images/placeholder-seller.png"}
                        alt={seller.name}
                        fill
                        className="object-cover transition-transform duration-[400ms] rounded-[22px] ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                </Link>

                {/* Rating Badge Overlay - Minimalist without border/shadow */}
                <div className="absolute bottom-[10px] left-[10px] z-[10] flex items-center gap-[6px] px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-2xl">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-[12px] font-bold text-[#242424]">{seller.rating || 0}</span>
                    <span className="text-[10px] text-[#71717a] font-medium uppercase tracking-tight">Rating</span>
                </div>

                {/* Action Icon Button */}
                <div className="absolute top-[10px] right-[10px] z-[10]">
                    <SellerActionMenu 
                        seller={seller}
                        onEdit={onEditAction}
                        onDelete={onDeleteAction}
                    />
                </div>
            </div>

            {/* Seller Details */}
            <div className="flex px-[4px] mt-1 flex-col gap-[2px] justify-center items-start self-stretch shrink-0 relative z-[6]">
                <div className="flex items-center gap-2 self-stretch">
                    {/* Title */}
                    <h3 className="flex-1 text-[15px] font-[600] leading-[20px] text-[#242424] whitespace-nowrap overflow-hidden text-ellipsis relative z-[7]">
                        {seller.name}
                    </h3>
                    
                    {seller.is_verified && (
                        <div className="shrink-0" title="Verified Seller">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Slug/ID */}
                <p className="self-stretch shrink-0 text-[11px] font-[400] leading-[14.4px] relative z-[8] line-clamp-1">
                    <span className="text-[#a1a1aa] font-mono">
                        {seller.slug || seller.id}
                    </span>
                </p>
            </div>
        </div>
    );
};

// --- MAIN EXPORT: SELLER GRID ---
export default function SellerGrid({ 
    sellers,
    onEditAction,
    onDeleteAction
}: { 
    sellers: Seller[];
    onEditAction?: (seller: Seller) => void;
    onDeleteAction?: (id: string) => void;
}) {
    if (sellers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-lg font-medium">No sellers found</p>
                <p className="text-sm">Try adding a new seller or adjusting your filters.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-[16px] gap-y-[24px] items-start relative w-full">
                {sellers.map((seller) => (
                    <SellerCard 
                        key={seller.id} 
                        seller={seller} 
                        onEditAction={onEditAction} 
                        onDeleteAction={onDeleteAction} 
                    />
                ))}
            </div>
        </section>
    );
}
