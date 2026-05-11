import React from 'react';

/**
 * Skeleton loader that mirrors the exact layout of ProductCard.
 * Matches the dimensions: h-[261px] / lg:h-[320px], max-w-[199px] / lg:max-w-[250px]
 */
const ProductCardSkeleton: React.FC = () => {
    return (
        <div
            className="relative flex h-[261px] w-full max-w-[199px] flex-shrink-0 flex-col items-center gap-[10px] rounded-[20px] border border-[#f2f9f1] bg-white p-[8px] md:max-w-full lg:h-[320px] lg:max-w-[250px] animate-pulse"
        >
            {/* RATING BADGE SKELETON (TOP LEFT) */}
            <div className="absolute left-[11px] top-[11px] z-[10] h-[22px] w-[48px] rounded-[6px] bg-gray-200" />

            {/* DISCOUNT BADGE SKELETON (TOP RIGHT) */}
            <div className="absolute right-[11px] top-[11px] z-[10] h-[18px] w-[56px] rounded-[6px] bg-gray-200" />

            {/* PRODUCT IMAGE SKELETON */}
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-[12px] bg-gray-100" />

            {/* PRODUCT DETAILS BLOCK SKELETON */}
            <div className="flex w-full flex-shrink-0 flex-col items-start gap-[8px] rounded-[12px] bg-[#f7faf6] px-[16px] pb-[16px] pt-[8px]">
                <div className="flex flex-col items-start justify-end gap-[4px] self-stretch pb-[2px]">
                    <div className="flex flex-col items-start gap-[2px] self-stretch pb-[4px]">
                        {/* Brand name */}
                        <div className="h-[14px] w-[60px] rounded bg-gray-200" />
                        {/* Product title */}
                        <div className="h-[16px] w-full rounded bg-gray-200" />
                        {/* Benefit line */}
                        <div className="h-[14px] w-[100px] rounded bg-gray-200 mt-[2px]" />
                    </div>

                    {/* PRICING ROW SKELETON */}
                    <div className="flex items-start gap-[6px] self-stretch">
                        <div className="flex flex-1 shrink-0 items-center gap-[6px]">
                            <div className="h-[22px] w-[60px] rounded bg-gray-200" />
                            <div className="h-[22px] w-[70px] rounded bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
