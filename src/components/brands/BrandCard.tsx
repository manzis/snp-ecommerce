'use client';

import React from 'react';
import Image from 'next/image';
import StarIcon from '@/components/icons/StarIcon';

export interface Brand {
  id: number;
  name: string;
  logo: string;
  rating: string;
  reviews?: string;
  totalProducts: number;
}

interface BrandCardProps {
  brand: Brand;
  layout: 'popular' | 'grid';
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, layout }) => {
  const isPopular = layout === 'popular';

  return (
    <div className={`flex flex-col gap-[11px] shrink-0 ${isPopular ? 'w-[147px]' : 'w-full'}`}>
      {/* LOGO CONTAINER */}
      <div className="relative h-[173px] w-full rounded-[12px] border border-[#f1f5f9] overflow-hidden bg-white">
        <Image
          src={brand.logo}
          alt={brand.name}
          fill
          className="object-cover"
          sizes={isPopular ? "147px" : "50vw"}
        />
        
        {/* 
            RATING BADGE DYNAMIC LOGIC:
            - Popular: Centered (left-1/2 -translate-x-1/2), Fixed Width (w-[120px]), Higher (bottom-[16px])
            - Grid: Left-aligned (left-[10px]), Hug Content (w-fit), Lower (bottom-[10px])
        */}
        <div 
          className={`absolute flex items-center justify-center gap-[2px] rounded-[6px] bg-[#FFE900]/85 px-[8px] py-[6px] backdrop-blur-[2px] z-10 shadow-sm transition-all
            ${isPopular 
              ? 'bottom-[8px] left-1/2 -translate-x-1/2 w-[130px] h-[30px]' 
              : 'bottom-[10px] left-[10px] w-fit'
            }`}
        >
          <div className="flex items-center gap-[2px]">
            <StarIcon className="h-[13px] w-[13px] text-[#242424]" />
            <span className="font-titillium text-[14px] font-semibold leading-[10px] text-[#242424]">
              {brand.rating}
            </span>
          </div>
          
          {/* Reviews shown only in popular section */}
          {isPopular && brand.reviews && (
            <div className="ml-[2px] flex items-center border-l border-black/20 pl-[6px]">
              <span className="font-titillium text-[12px] font-semibold leading-[10px] text-[#797979]">
                {brand.reviews}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BRAND INFO */}
      <div className="flex flex-col gap-[6px] items-start self-stretch">
        <h3 className="font-titillium text-[13px] font-semibold uppercase leading-[18px] tracking-[0.56px] text-[#242424] truncate w-full">
          {brand.name}
        </h3>
        <span className="font-titillium text-[12px] font-normal leading-[18px] tracking-[-0.24px] text-[#979797]">
          Total: {brand.totalProducts} Products
        </span>
      </div>
    </div>
  );
};

export default BrandCard;