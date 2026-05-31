import React, { useRef } from 'react';
import { optimizeImage } from '@/lib/optimizeImage';
import Image from 'next/image';
import Link from 'next/link';
import StarIcon from '@/components/icons/StarIcon';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    brand: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
    discountPercentage: string;
    rating: string;
    image: string;
    slug: string;
    stockStatus?: string;
    stock_status?: string;
    benefit?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
    brand,
    title,
    originalPrice,
    discountedPrice,
    discountPercentage,
    rating,
    image,
    slug,
    stockStatus,
    stock_status,
    benefit,
}) => {
    const router = useRouter();
    const prefetched = useRef(false);
    const finalStockStatus = stockStatus || stock_status;

    const handlePrefetch = () => {
        if (!prefetched.current) {
            router.prefetch(`/product/${slug}`);
            prefetched.current = true;
        }
    };

    return (
        <Link
            href={`/product/${slug}`}
            onPointerDown={handlePrefetch}
            onTouchStart={handlePrefetch}
            onMouseEnter={handlePrefetch}
            className={`group relative flex h-[261px] w-full max-w-[199px] flex-shrink-0 flex-col items-center gap-[10px] rounded-[20px] border border-[#f2f9f1] bg-[#ffffff] p-[8px] transition-all active:scale-[0.98] md:max-w-full lg:h-[320px] lg:max-w-[250px] ${finalStockStatus === 'out_of_stock' ? 'grayscale-[0.5]' : ''}`}
        >
            {/* RATING BADGE (TOP LEFT) */}
            <div className="absolute left-[11px] top-[11px] z-[10] flex items-center justify-center gap-[2px] overflow-hidden rounded-[6px] bg-[#ffe900] px-[8px] py-[6px]">
                <StarIcon className="h-[10px] w-[10px] text-[#242424]" />
                <span className="font-rajdhani text-[10px] font-semibold leading-[10px] text-[#242424]">
                    {rating}
                </span>
            </div>

            {/* DISCOUNT BADGE (TOP RIGHT) */}
            <div className="absolute right-[11px] top-[11px] z-[10] flex items-center justify-center rounded-[6px] bg-[#94ff00] px-[6px] py-[2px]">
 <span className="font-rajdhani font-bold text-[10px] leading-[14px] text-[#242424]">
                    save {discountPercentage}%
                </span>
            </div>

            {/* PRODUCT IMAGE - SCALABLE AREA */}
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-[12px]">
                <Image
                    src={optimizeImage(image, 400)}
                    alt={title}
                    fill
                    loading="lazy"
                    className={`object-contain p-[8px] transition-transform duration-300 group-hover:scale-105 ${finalStockStatus === 'out_of_stock' ? 'opacity-40' : ''}`}
                    sizes="(max-width: 768px) 200px, 250px"
                />
                
                {finalStockStatus === 'out_of_stock' && (
                    <div className="absolute inset-0 z-[11] flex items-center justify-center p-2">
                        <div className="w-full bg-red-600/95 py-2 flex items-center justify-center shadow-xl transform -rotate-1">
 <span className="font-rajdhani font-bold text-[11px] font-bold tracking-[0.2em] text-white uppercase drop-shadow-sm">
                                Out of Stock
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* PRODUCT DETAILS BLOCK */}
            <div className="flex w-full flex-shrink-0 flex-col items-start gap-[8px] rounded-[12px] bg-[#f7faf6] px-[16px] pb-[16px] pt-[8px] transition-colors group-hover:bg-[#f2f9f1]">
                <div className="flex flex-col items-start justify-end gap-[2px] self-stretch pb-[2px]">
                    <div className="flex flex-col items-start gap-[2px] self-stretch pb-[0px]">
                        <span className="font-rajdhani text-[10px] font-medium leading-[14px] text-[#818B73] uppercase">
                            {brand}
                        </span>
 <div className="h-[20px] self-stretch overflow-hidden truncate font-rajdhani font-bold text-[13px] leading-[20px] tracking-[0.2px] text-[#485d2c]">
                            {title}
                        </div>
                        {benefit && (
                            <span className="font-rajdhani text-[11px] font-medium leading-[14px] text-[#5ca452] truncate w-full mb-[2px]">
                                ✓ {benefit}
                            </span>
                        )}
                    </div>

                    {/* PRICING ROW */}
                    <div className="flex items-start gap-[6px] self-stretch">
                        <div className="flex flex-1 shrink-0 items-center gap-[6px]">
                            <span className="font-rajdhani text-[16px] font-medium leading-[22px] tracking-[-1.12px] text-[#979797] line-through">
                                Rs. {originalPrice}
                            </span>
 <span className="bg-[linear-gradient(68.09deg,#308026,#32d71d)] bg-clip-text font-rajdhani font-bold text-[16px] leading-[22px] text-transparent">
                                Rs. {discountedPrice}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
