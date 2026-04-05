import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarIcon from '@/components/icons/StarIcon';

interface ProductCardProps {
    brand: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
    discountPercentage: string;
    rating: string;
    image: string;
    slug: string;
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
}) => {
    return (
        <Link
            href={`/product/${slug}`}
            className="group relative flex h-[261px] w-full max-w-[199px] flex-shrink-0 flex-col items-center gap-[10px] rounded-[20px] border border-[#f2f9f1] bg-[#ffffff] p-[8px] transition-all  active:scale-[0.98] md:max-w-full lg:h-[320px] lg:max-w-[250px]"
        >
            {/* RATING BADGE (TOP LEFT) */}
            <div className="absolute left-[11px] top-[11px] z-[10] flex items-center justify-center gap-[2px] overflow-hidden rounded-[6px] bg-[#ffe900] px-[8px] py-[6px]">
                <StarIcon className="h-[10px] w-[10px] text-[#242424]" />
                <span className="font-titillium text-[10px] font-semibold leading-[10px] text-[#242424]">
                    {rating}
                </span>
            </div>

            {/* DISCOUNT BADGE (TOP RIGHT) */}
            <div className="absolute right-[11px] top-[11px] z-[10] flex items-center justify-center rounded-[6px] bg-[#94ff00] px-[6px] py-[2px]">
                <span className="font-custom text-[10px] font-normal leading-[14px] text-[#242424]">
                    save {discountPercentage}
                </span>
            </div>

            {/* PRODUCT IMAGE - SCALABLE AREA */}
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-[12px]">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-contain p-[8px]"
                    sizes="(max-width: 768px) 199px, 250px"
                />
            </div>

            {/* PRODUCT DETAILS BLOCK */}
            <div className="flex w-full flex-shrink-0 flex-col items-start gap-[8px] rounded-[12px] bg-[#f7faf6] px-[16px] pb-[16px] pt-[8px] transition-colors group-hover:bg-[#f2f9f1]">
                <div className="flex flex-col items-start justify-end gap-[4px] self-stretch pb-[2px]">
                    <div className="flex flex-col items-start gap-[2px] self-stretch pb-[4px]">
                        <span className="font-titillium text-[10px] font-normal leading-[14px] text-[#bebebe] uppercase">
                            {brand}
                        </span>
                        <h3 className="h-[16px] self-stretch overflow-hidden truncate font-custom text-[12px] font-normal leading-[16px] tracking-[0.2px] text-[#485d2c]">
                            {title}
                        </h3>
                    </div>

                    {/* PRICING ROW */}
                    <div className="flex items-start gap-[6px] self-stretch">
                        <div className="flex flex-1 shrink-0 items-center gap-[6px]">
                            <span className="font-titillium text-[16px] font-normal leading-[22px] tracking-[-1.12px] text-[#979797] line-through">
                                {originalPrice}
                            </span>
                            <span className="bg-[linear-gradient(68.09deg,#308026,#32d71d)] bg-clip-text font-custom text-[16px] font-normal leading-[22px] text-transparent">
                                {discountedPrice}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;