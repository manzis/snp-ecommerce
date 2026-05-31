"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProductSelectionStore } from '@/store/productSelectionStore';
import RedirectIcon from '@/components/icons/RedirectIcon';

interface BrandInfo {
  name: string;
  slug: string;
  image_url?: string;
}

interface ProductHeaderProps {
  brand: BrandInfo;
  title: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage: string;
}

const ProductHeader = ({
  brand,
  title,
  originalPrice: propsOriginal,
  discountedPrice: propsDiscounted,
  discountPercentage: propsPercentage
}: ProductHeaderProps) => {
  const { currentPrice, originalPrice } = useProductSelectionStore();

  const cleanPrice = (val: string | number) => String(val).replace(/NPR\s?/g, '').replace(/Rs\.?\s?/ig, '').trim();

  const displayDiscounted = currentPrice ? `Rs. ${currentPrice}` : `Rs. ${cleanPrice(propsDiscounted)}`;
  const displayOriginal = originalPrice ? `Rs. ${originalPrice}` : `Rs. ${cleanPrice(propsOriginal)}`;

  // Calculate dynamic discount
  let displayPercentage = propsPercentage?.includes('%') ? propsPercentage : `${propsPercentage}%`;
  if (currentPrice && originalPrice && originalPrice > 0) {
    const percent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    displayPercentage = `${percent}%`;
  }

  return (
    <section className="flex w-full flex-col items-start font-rajdhani px-[24px]">
      <div className="relative flex w-full max-w-[362px] lg:max-w-none flex-col items-start gap-[10px] lg:h-auto">

        {/* Brand Row: Logo + Name + Redirect */}
        <Link
          href={`/brand/${brand.slug}`}

          className="group flex items-center gap-[4px] hover:opacity-80 transition-opacity duration-150"
        >
          {/* Brand Logo */}
          {brand.image_url ? (
            <div className="relative shrink-0 w-[18px] h-[18px] rounded-[3px] overflow-hidden border border-[#E8E8E8] bg-[#FAFAFA]">
              <Image
                src={brand.image_url}
                alt={brand.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          ) : (
            <div className="flex shrink-0 w-[18px] h-[18px] rounded-[3px] border border-[#E8E8E8] bg-[#F0F0F0] items-center justify-center">
              <span className="font-rajdhani text-[11px] font-bold text-[#888] uppercase">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Brand Name */}
          <span className="font-rajdhani text-[15px] font-semibold leading-[18px] text-[#555] tracking-[-0.04em] uppercase group-hover:text-[#242424] transition-colors duration-150">
            {brand.name}
          </span>
          {/* Redirect Arrow */}
          <RedirectIcon className="w-[14px] h-[14px] text-[#AAAAAA] group-hover:text-[#555] transition-colors duration-150 shrink-0" />
        </Link>

        {/* Title */}
        <div className="relative flex w-full flex-col items-start gap-[6px] shrink-0 lg:h-auto">
          <div className="relative flex w-full items-center lg:h-auto">
            <h1 className="uppercase font-rajdhani font-bold text-[22px] lg:text-[26px] leading-[30px] lg:leading-[34px] text-left bg-[linear-gradient(90deg,#242424_0%,#535353_117.72%)] bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>

        {/* Pricing */}
        <div className="relative flex flex-col items-start justify-center gap-[5px] shrink-0 lg:h-auto">
          <div className="relative flex items-center gap-[10px]">
            <div className="flex h-[22px] w-[63px] items-center justify-center bg-[#95FF00] rounded-[6px] px-[6px] py-[4px]">
              <span className="font-rajdhani uppercase font-bold text-[12px] leading-[14px] text-[#242424] whitespace-nowrap">
                save {displayPercentage}
              </span>
            </div>
            <span className="h-[30px] font-rajdhani text-[28px] font-medium leading-[30px] text-[#979797] tracking-[-0.07em] line-through whitespace-nowrap">
              {displayOriginal}
            </span>
            <span className="h-[30px] font-rajdhani font-bold text-[28px] lg:text-[32px] leading-[30px] lg:leading-[32px] bg-[linear-gradient(87.93deg,#318126_10.71%,#33D81D_124.28%)] bg-clip-text text-transparent whitespace-nowrap">
              {displayDiscounted}
            </span>
          </div>
          <span className="h-[10px] font-rajdhani text-[12px] font-[500] leading-[10px] text-[#606060] whitespace-nowrap">
            *inclusive of all taxes
          </span>
        </div>

      </div>
    </section>
  );
};

export default ProductHeader;
