"use client";

import React, { useRef } from 'react';
import { optimizeImage } from '@/lib/optimizeImage';
import Image from 'next/image';
import Link from 'next/link';
import StarIcon from '@/components/icons/StarIcon';
import { useRouter } from 'next/navigation';

interface SmallProductCardProps {
    brand: string;
    title: string;
    discountedPrice: string;
    originalPrice?: string;
    rating: string;
    image: string;
    slug: string;
    stockStatus?: string;
}

const SmallProductCard: React.FC<SmallProductCardProps> = ({
    brand,
    title,
    discountedPrice,
    originalPrice,
    rating,
    image,
    slug,
    stockStatus
}) => {
    const router = useRouter();
    const prefetched = useRef(false);

    const handlePrefetch = () => {
        if (!prefetched.current) {
            router.prefetch(`/product/${slug}`);
            prefetched.current = true;
        }
    };

    return (
        <Link
            href={`/product/${slug}`}
            prefetch={false}
            onPointerDown={handlePrefetch}
            onTouchStart={handlePrefetch}
            onMouseEnter={handlePrefetch}
            className={`group flex w-[150px] md:w-[170px] flex-shrink-0 flex-col items-start gap-[8px] rounded-[20px] border border-[#f2f9f1] bg-[#ffffff] p-[10px] transition-all active:scale-[0.98] ${stockStatus === 'out_of_stock' ? 'grayscale-[0.5]' : ''}`}
        >


            {/* PRODUCT IMAGE */}
            <div className="relative flex h-[120px] md:h-[140px] w-full items-center justify-center overflow-hidden rounded-[16px] bg-[#f8fcf8]">
                {/* RATING BADGE */}
                <div className="absolute left-[6px] top-[6px] z-[10] flex h-[16px] items-center justify-center gap-[2px] rounded-[6px] bg-[#ffe900] px-[4px]">
                    <StarIcon className="h-[8px] w-[8px] text-[#242424]" />
                    <span className="flex items-center pt-[1px] font-rajdhani font-bold text-[9px] leading-none text-[#242424]">
                        {rating}
                    </span>
                </div>

                <Image
                    src={optimizeImage(image, 200)}
                    alt={title}
                    fill
                    loading="lazy"
                    className={`object-contain p-[10px] transition-transform duration-300 group-hover:scale-105 ${stockStatus === 'out_of_stock' ? 'opacity-40' : ''}`}
                    sizes="(max-width: 768px) 140px, 160px"
                />
            </div>

            {/* PRODUCT DETAILS */}
            <div className="flex w-full flex-col items-start px-[4px] pb-[4px]">
                <div className="h-[28px] w-full overflow-hidden font-rajdhani font-semibold text-[12px] leading-[14px] text-[#485d2c] line-clamp-2 mt-[2px]">
                    {title}
                </div>
                
                <div className="flex items-center gap-[4px] mt-[4px]">
                    <span className="bg-[linear-gradient(68.09deg,#308026,#2fc219)] bg-clip-text font-rajdhani font-bold text-[14px] leading-[18px] text-transparent">
                        Rs. {discountedPrice}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default SmallProductCard;
