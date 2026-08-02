"use client";

import React, { useState } from 'react';
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
  activeSale?: {
    name: string;
    slug?: string;
    discount_type: string;
    discount_value: number;
    ends_at: string;
  } | null;
}

const ProductHeader = ({
  brand,
  title,
  originalPrice: propsOriginal,
  discountedPrice: propsDiscounted,
  discountPercentage: propsPercentage,
  activeSale
}: ProductHeaderProps) => {
  const { currentPrice, originalPrice } = useProductSelectionStore();
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const cleanPrice = (val: string | number) => String(val).replace(/NPR\s?/g, '').replace(/Rs\.?\s?/ig, '').trim();

  // Calculate final prices
  const baseDiscounted = currentPrice ? currentPrice : Number(cleanPrice(propsDiscounted));
  const baseOriginal = originalPrice ? originalPrice : Number(cleanPrice(propsOriginal));
  
  const finalDiscounted = activeSale 
    ? activeSale.discount_type === 'PERCENTAGE'
        ? Math.round(baseDiscounted * (1 - activeSale.discount_value / 100))
        : Math.max(0, baseDiscounted - activeSale.discount_value)
    : baseDiscounted;

  // Calculate dynamic discount percentage
  let displayPercentage = propsPercentage?.includes('%') ? propsPercentage : `${propsPercentage}%`;
  if (baseOriginal > 0) {
    const percent = Math.round(((baseOriginal - finalDiscounted) / baseOriginal) * 100);
    displayPercentage = `${percent}%`;
  }

  // Live countdown timer effect
  React.useEffect(() => {
    if (!activeSale?.ends_at) return;
    const endsAt = new Date(activeSale.ends_at).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endsAt - now;

      if (distance < 0) {
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSale?.ends_at]);

  return (
    <section className="flex w-full flex-col items-start font-rajdhani px-[24px]">
      <div className="relative flex w-full max-w-[362px] lg:max-w-none flex-col items-start gap-[10px] lg:h-auto">

        {/* Brand Row: Logo + Name + Redirect & Active Sale */}
        <div className="flex w-full items-center justify-between">
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

          {activeSale && timeLeft && (
            <div className="flex items-center gap-1.5 text-right ml-auto">
              <svg className="w-3.5 h-3.5 text-[#ff0000] mb-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span className="font-rajdhani font-bold text-[12px] text-[#ff0000]">
                Sale Ends in {timeLeft}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="relative flex w-full flex-col items-start gap-[6px] shrink-0 lg:h-auto">
          <div className="relative flex w-full items-center lg:h-auto">
            <h1 
              onClick={() => setIsTitleExpanded(!isTitleExpanded)}
              title={isTitleExpanded ? "Click to collapse" : "Click to expand"}
              className={`uppercase font-rajdhani font-bold text-[22px] lg:text-[26px] leading-[30px] lg:leading-[34px] text-left bg-[linear-gradient(90deg,#242424_0%,#535353_117.72%)] bg-clip-text text-transparent cursor-pointer transition-all duration-200 ${isTitleExpanded ? '' : 'line-clamp-2'}`}
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Pricing */}
        <div className="relative flex flex-col items-start justify-center gap-[5px] shrink-0 lg:h-auto w-full">
          <div className="relative flex items-center gap-[10px]">
            <div className="flex h-[22px] items-center justify-center rounded-[6px] px-[6px] py-[4px] bg-[#95FF00]">
              <span className="font-rajdhani uppercase font-bold text-[12px] leading-[14px] whitespace-nowrap text-[#242424] flex items-center gap-[2px]">
                save {displayPercentage}
              </span>
            </div>
            <span className="h-[30px] font-rajdhani text-[28px] font-medium leading-[30px] text-[#979797] tracking-[-0.07em] line-through whitespace-nowrap">
              Rs. {baseOriginal}
            </span>
            <div className="flex items-center gap-[2px]">
              {activeSale && (
                <svg className="text-[#ff0000]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              )}
              {activeSale ? (
                 <span className="h-[30px] font-rajdhani font-bold text-[28px] lg:text-[32px] leading-[30px] lg:leading-[32px] bg-[linear-gradient(87.93deg,#ff0000_10.71%,#ff4d4d_124.28%)] bg-clip-text text-transparent whitespace-nowrap">
                     Rs. {finalDiscounted}
                 </span>
              ) : (
                  <span className="h-[30px] font-rajdhani font-bold text-[28px] lg:text-[32px] leading-[30px] lg:leading-[32px] bg-[linear-gradient(87.93deg,#318126_10.71%,#33D81D_124.28%)] bg-clip-text text-transparent whitespace-nowrap">
                    Rs. {finalDiscounted}
                  </span>
              )}
            </div>
          </div>
          
          <div className="flex w-full items-center justify-between mt-1">
            <span className="h-[10px] font-rajdhani text-[12px] font-[500] leading-[10px] text-[#606060] whitespace-nowrap">
              *inclusive of all taxes
            </span>
            {activeSale && (
              <Link href={`/sale/${activeSale.slug || ''}`} className="group flex items-center gap-1.5 bg-black text-white px-2 py-1 shadow-sm hover:opacity-90 transition-opacity">
                <span className="font-rajdhani font-bold text-[11px] leading-[12px] uppercase tracking-wider">
                  {activeSale.name}
                </span>
                <RedirectIcon className="w-2.5 h-2.5 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductHeader;
