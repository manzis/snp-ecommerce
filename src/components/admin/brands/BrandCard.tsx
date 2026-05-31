import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/services/productService";
import BrandActionMenu from "./BrandActionMenu";

// --- SUB-COMPONENT: BRAND CARD ---
export const BrandCard = ({
    brand,
    onEdit,
    onDelete
}: {
    brand: Brand;
    onEdit?: (brand: Brand) => void;
    onDelete?: (id: string) => void;
}) => {
    return (
        <div className="flex flex-col gap-[10px] justify-center items-start w-full relative group font-rubik tracking-tight">
            {/* Brand Image Container */}
            <div className="h-[160px] w-full relative shrink-0 bg-[#f4f4f5] rounded-[24px] overflow-hidden">
                <Link
                    href={`/admin/brands/${brand.slug || brand.id}`}
                    className="absolute inset-0 z-[1]"
                >
                    <Image
                        src={brand.image_url || "/images/placeholder-brand.png"}
                        alt={brand.name}
                        fill
                        className="object-cover transition-transform duration-[300ms] ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                </Link>

                {/* Action Icon Button */}
                <div className="absolute top-[10px] right-[10px] z-[10]">
                    <BrandActionMenu
                        brand={brand}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>

                {/* Rating Badge Overlay - Minimalist style without border/shadow */}
                <div className="absolute bottom-[10px] left-[10px] z-[10] flex px-3 py-1.5 gap-[6px] justify-center items-center bg-[#bef264]/95 backdrop-blur-sm rounded-2xl">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#242424]">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-[12px] font-bold text-[#242424]">
                        {brand.rating || 0}
                    </span>
                    <span className="text-[10px] text-[#242424]/60 font-medium uppercase tracking-tight">Rating</span>
                </div>
            </div>

            {/* Brand Details */}
            <div className="flex px-[4px] mt-1 flex-col gap-[2px] justify-center items-start self-stretch shrink-0 relative z-[6]">
                {/* Title */}
                <h3 className="h-[20px] self-stretch shrink-0 text-[15px] font-[600] leading-[20px] text-[#242424] whitespace-nowrap overflow-hidden text-ellipsis relative z-[7]">
                    {brand.name}
                </h3>

                {/* Slug/ID */}
                <p className="self-stretch shrink-0 text-[11px] font-[400] leading-[14.4px] relative z-[8] line-clamp-1">
                    <span className="text-[#a1a1aa] font-mono">
                        {brand.slug || brand.id}
                    </span>
                </p>
            </div>
        </div>
    );
};

// --- MAIN EXPORT: BRAND GRID ---
export default function BrandGrid({
    brands,
    onEdit,
    onDelete
}: {
    brands: Brand[];
    onEdit?: (brand: Brand) => void;
    onDelete?: (id: string) => void;
}) {
    if (brands.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-lg font-medium">No brands found</p>
                <p className="text-sm">Try adding a new brand or adjusting your filters.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-[16px] gap-y-[24px] items-start relative w-full">
                {brands.map((brand) => (
                    <BrandCard
                        key={brand.id}
                        brand={brand}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
}
