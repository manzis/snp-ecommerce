'use client';

import Image from "next/image";
import Link from "next/link";
import { optimizeImage } from '@/lib/optimizeImage';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

// --- TYPES ---
export interface FeaturedProductCardProps {
    id?: string;
    brand?: string;
    title?: string;
    currentPrice?: string;
    originalPrice?: string;
    discountText?: string;
    imageUrl?: string;
    productUrl?: string;
    stockStatus?: string;
}

// --- MOCK DATA (Ready for Supabase DB Integration) ---
const MOCK_PRODUCT: FeaturedProductCardProps = {
    id: "feat-1",
    brand: "Muscleblaze",
    title: "Creamp Creatine Monohydrate",
    currentPrice: "Rs. 2090",
    originalPrice: "Rs. 2090", // Kept exact to your raw HTML; typically this would be higher.
    discountText: "save 20%",
    imageUrl: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-04-17/XsAwddx83c.png", // Replace with /images/...
    productUrl: "/product/muscleblaze-creatine",
};

export default function FeaturedProductCard({
    brand = MOCK_PRODUCT.brand!,
    title = MOCK_PRODUCT.title!,
    currentPrice = MOCK_PRODUCT.currentPrice!,
    originalPrice = MOCK_PRODUCT.originalPrice!,
    discountText = MOCK_PRODUCT.discountText!,
    imageUrl = MOCK_PRODUCT.imageUrl!,
    productUrl = MOCK_PRODUCT.productUrl!,
    stockStatus,
}: FeaturedProductCardProps) {
    const router = useRouter();
    const prefetched = useRef(false);

    const handlePrefetch = () => {
        if (!prefetched.current && productUrl) {
            router.prefetch(productUrl);
            prefetched.current = true;
        }
    };

    return (
        <article className="group flex w-full max-w-[169px] mx-auto flex-col gap-[8px] items-start relative font-['Rajdhani',sans-serif]">
            <Link
                href={productUrl}
                onPointerDown={handlePrefetch}
                onTouchStart={handlePrefetch}
                onMouseEnter={handlePrefetch}
                className="flex flex-col gap-[8px] w-full focus:outline-none"
            >

                {/* --- Product Image Container --- */}
                <div className={`flex h-[159px] w-full items-center self-stretch shrink-0 rounded-[8px] relative overflow-hidden ${stockStatus === 'out_of_stock' ? 'grayscale-[0.5]' : ''}`}>
                    <Image
                        src={optimizeImage(imageUrl, 300)}
                        alt={title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 159px, 169px"
                        className={`p-[12px] object-contain object-center transition-transform duration-[300ms] ease-in-out group-hover:scale-110 ${stockStatus === 'out_of_stock' ? 'opacity-40' : ''}`}
                    />

                    {stockStatus === 'out_of_stock' && (
                        <div className="absolute inset-0 z-[11] flex items-center justify-center p-2">
                            <div className="w-full bg-red-600/90 py-1.5 flex items-center justify-center shadow-xl transform -rotate-1">
                                <span className="font-rajdhani font-bold text-[10px] font-bold tracking-[0.2em] text-white uppercase drop-shadow-sm">
                                    Out of Stock
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Product Details --- */}
                <div className="flex flex-col gap-[2px] mt-[4px] items-start self-stretch shrink-0 relative z-[2] min-w-[0px]">

                    {/* Brand & Title */}
                    <header className="flex flex-col items-start self-stretch shrink-0 relative z-[3] min-w-[0px]">
                        <span className="w-full shrink-0 text-[12px] font-[600] leading-[16px] text-[#242424] truncate">
                            {brand}
                        </span>
                        <h3 className=" w-full shrink-0 text-[13px] font-[500] leading-[19px] text-[#525252] truncate">
                            {title}
                        </h3>
                    </header>

                    {/* Pricing Row */}
                    <div className="flex w-full max-w-[158px] gap-[6px] items-center shrink-0 relative z-[6]">

                        {/* Current Price */}
                        <span className="shrink-0 text-[14px] font-[700] leading-[20px] text-[#242424] whitespace-nowrap">
                            {currentPrice}
                        </span>

                        {/* Original Price */}
                        {originalPrice && (
                            <span className="shrink-0 text-[14px] font-[500] leading-[20px] text-[#525252] line-through whitespace-nowrap decoration-[#525252]/50">
                                {originalPrice}
                            </span>
                        )}

                        {/* Discount Badge */}
                        {discountText && (
                            <div className="flex w-[40px] px-[3px] py-[1px] justify-center items-center shrink-0 bg-[#94ff00] rounded-[6px] relative z-[9]">
                                <span className="shrink-0 text-[8px] font-[500] leading-[14px] text-[#242424] font-rajdhani font-bold whitespace-nowrap">
                                    {discountText}
                                </span>
                            </div>
                        )}

                    </div>
                </div>
            </Link>
        </article>
    );
}
