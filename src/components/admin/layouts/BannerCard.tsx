import React from "react";
import Image from "next/image";
import { Banner } from "@/services/bannerService";
import BannerActionMenu from "./BannerActionMenu";

interface BannerCardProps {
    banner: Banner;
    onEdit?: (banner: Banner) => void;
    onDelete?: (id: string) => void;
}

export default function BannerCard({
    banner,
    onEdit,
    onDelete
}: BannerCardProps) {
    return (
        <div className="flex flex-col gap-[10px] justify-center items-start w-full relative group font-rubik tracking-tight">
            {/* Banner Image Container - Square 1080x1080 Aspect */}
            <div className="aspect-square w-full relative shrink-0 bg-[#f4f4f5] rounded-[24px] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <Image
                    src={banner.image_url || "/images/placeholder-banner.png"}
                    alt="Banner image"
                    fill
                    className="object-cover transition-transform duration-[300ms] ease-in-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />

                {/* Action Icon Button */}
                <div className="absolute top-[12px] right-[12px] z-[10]">
                    <BannerActionMenu
                        banner={banner}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>

                {/* Status Badges */}
                <div className="absolute bottom-[12px] left-[12px] z-[10] flex flex-wrap gap-[6px]">
                    <div className={`flex px-3 py-1.5 gap-[6px] justify-center items-center backdrop-blur-md rounded-2xl ${banner.is_published ? 'bg-black/80 text-white' : 'bg-gray-200/90 text-gray-700'}`}>
                        <span className="text-[11px] font-bold uppercase tracking-tight">
                            {banner.is_published ? 'Live' : 'Draft'}
                        </span>
                    </div>
                    {banner.is_active && (
                        <div className="flex px-3 py-1.5 gap-[6px] justify-center items-center bg-[#bef264]/95 backdrop-blur-sm rounded-2xl">
                           <span className="text-[11px] font-bold text-[#242424] uppercase tracking-tight italic">Active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Banner Details */}
            <div className="flex px-[4px] mt-1 flex-col gap-[2px] justify-center items-start self-stretch shrink-0 relative z-[6]">
                <h3 className="h-[20px] self-stretch shrink-0 text-[14px] font-[550] leading-[20px] text-[#242424] whitespace-nowrap overflow-hidden text-ellipsis">
                    {banner.product?.title || 'No Product Linked'}
                </h3>
                <p className="self-stretch shrink-0 text-[11px] font-[400] text-[#71717a] font-mono line-clamp-1">
                    {banner.image_url.split('/').pop()}
                </p>
            </div>
        </div>
    );
}

export function BannerGrid({
    banners,
    onEdit,
    onDelete
}: {
    banners: Banner[];
    onEdit?: (banner: Banner) => void;
    onDelete?: (id: string) => void;
}) {
    if (banners.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-[24px] border-2 border-dashed border-gray-200 text-gray-500">
                <p className="text-[15px] font-medium">No banners found</p>
                <p className="text-[13px]">Create a new banner to link with products.</p>
            </div>
        );
    }

    return (
        <section className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[20px] gap-y-[28px] items-start relative w-full">
                {banners.map((banner) => (
                    <BannerCard
                        key={banner.id}
                        banner={banner}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
}
