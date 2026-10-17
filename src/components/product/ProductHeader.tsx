"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProductSelectionStore } from '@/store/productSelectionStore';
import RedirectIcon from '@/components/icons/RedirectIcon';
import { useVolatileProductData } from '@/hooks/useVolatileProductData';

interface BrandInfo {
  name: string;
  slug: string;
  image_url?: string;
}

interface ProductHeaderProps {
  productSlug: string;
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
    max_discount_percentage?: number;
  } | null;
}

const ProductHeader = ({
  productSlug,
  brand,
  title,
  originalPrice: propsOriginal,
  discountedPrice: propsDiscounted,
  discountPercentage: propsPercentage,
  activeSale: propsActiveSale
}: ProductHeaderProps) => {
  const { currentPrice, originalPrice, setPrice } = useProductSelectionStore();
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isSaleValid, setIsSaleValid] = useState(true);

  const { volatileData, isLoading } = useVolatileProductData(productSlug);

  const activeSale = volatileData !== null ? volatileData.activeSale : propsActiveSale;
  
  React.useEffect(() => {
    if (activeSale?.ends_at && new Date(activeSale.ends_at).getTime() < Date.now()) {
      setIsSaleValid(false);
    } else {
      setIsSaleValid(true);
    }
  }, [activeSale]);

  const effectiveActiveSale = isSaleValid ? activeSale : null;

  const cleanPrice = (val: string | number) => String(val).replace(/NPR\s?/g, '').replace(/Rs\.?\s?/ig, '').trim();

  // If volatile data is present, override the props.
  const hydratedOriginal = volatileData !== null ? volatileData.original_price : propsOriginal;
  const hydratedDiscounted = volatileData !== null ? volatileData.discounted_price : propsDiscounted;

  // Calculate final prices
  const baseDiscounted = currentPrice ? currentPrice : Number(cleanPrice(hydratedDiscounted));
  const baseOriginal = originalPrice ? originalPrice : Number(cleanPrice(hydratedOriginal));
  
  const finalDiscounted = effectiveActiveSale 
    ? effectiveActiveSale.discount_type === 'PERCENTAGE'
        ? Math.round(baseDiscounted * (1 - effectiveActiveSale.discount_value / 100))
        : Math.max(0, baseDiscounted - effectiveActiveSale.discount_value)
    : baseDiscounted;

  // Calculate dynamic discount percentage
  let displayPercentage = propsPercentage?.includes('%') ? propsPercentage : `${propsPercentage}%`;
  if (baseOriginal > 0) {
    const percent = Math.round(((baseOriginal - finalDiscounted) / baseOriginal) * 100);
    displayPercentage = `${percent}%`;
  }

  // Format title in normal case while preserving standard acronyms
  const displayTitle = React.useMemo(() => {
    if (!title) return '';
    return title.replace(/\b[A-Z]{3,}\b/g, (match) => {
      const preserveAcronyms = ['IU', 'MK-7', 'MK7', 'CFU', 'EPA', 'DHA', 'B12', 'CoQ-10', 'CoQ10', 'NPR', 'USA', 'FDA', 'GMP'];
      if (preserveAcronyms.includes(match)) return match;
      return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    });
  }, [title]);

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
    <section className={brand?.name ? "flex w-full flex-col items-start font-rajdhani bg-[#F2F9F5] rounded-t-[28px] sm:rounded-t-[32px] lg:rounded-t-[32px] overflow-hidden" : "flex w-full flex-col items-start font-rajdhani bg-white rounded-t-[28px] sm:rounded-t-[32px] lg:rounded-t-[32px] overflow-hidden"}>
      {/* Brand Header Banner with Background Separation */}
      {brand?.name && (
        <Link
          href={`/brand/${brand.slug || ''}`}
          className="group w-full flex items-center justify-between px-[18px] lg:px-[24px] pt-[12px] pb-[13px] hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors duration-150 select-none rounded-t-[28px] sm:rounded-t-[32px] lg:rounded-t-[32px]"
        >
          <div className="flex items-center gap-[7.5px] min-w-0">
            {/* Verified Scalloped Badge Icon - Optically centered & bolder checkmark */}
            <svg className="w-[19px] h-[19px] shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <g transform="translate(12, 12) scale(0.85) translate(-12, -12)">
                <path
                  fill="#318126"
                  d="M10.007 2.138a2.5 2.5 0 0 1 3.986 0l.968 1.155a2.5 2.5 0 0 0 2.296.95l1.492-.224a2.5 2.5 0 0 1 2.819 2.818l-.224 1.492a2.5 2.5 0 0 0 .95 2.296l1.155.968a2.5 2.5 0 0 1 0 3.986l-1.155.968a2.5 2.5 0 0 0-.95 2.296l.224 1.492a2.5 2.5 0 0 1-2.818 2.819l-1.492-.224a2.5 2.5 0 0 0-2.296.95l-.968 1.155a2.5 2.5 0 0 1-3.986 0l-.968-1.155a2.5 2.5 0 0 0-2.296-.95l-1.492.224a2.5 2.5 0 0 1-2.819-2.818l.224-1.492a2.5 2.5 0 0 0-.95-2.296l-1.155-.968a2.5 2.5 0 0 1 0-3.986l1.155-.968a2.5 2.5 0 0 0 .95-2.296l-.224-1.492a2.5 2.5 0 0 1 2.818-2.819l1.492.224a2.5 2.5 0 0 0 2.296-.95l.968-1.155Z"
                />
                <path
                  stroke="#FFFFFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="m8.1 12.6 2.8 2.8 5.3-5.3"
                />
              </g>
            </svg>

            {/* Brand Name */}
            <span className="font-rajdhani font-bold text-[17.5px] leading-none text-[#318126] tracking-tight capitalize group-hover:text-[#25631e] transition-colors truncate">
              {brand.name}
            </span>
          </div>

          <div className="flex items-center gap-[8px] shrink-0">
            {effectiveActiveSale && (
              <span className="inline-flex items-center gap-[6px] bg-black text-white px-[8px] py-[3px] rounded-[4px] shadow-xs">
                <span className="bg-[linear-gradient(90deg,#ff0000_0%,#ff2a00_70%,#ff7300_100%)] text-white text-[9px] font-bold px-[4px] py-[1px] uppercase tracking-wider leading-none">
                  SALE
                </span>
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider">
                  {effectiveActiveSale.name}
                </span>
              </span>
            )}

            {/* Right Chevron Arrow */}
            <svg
              className="w-[17px] h-[17px] text-[#318126] group-hover:translate-x-0.5 transition-transform duration-150 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      )}

      {/* Main Content Area: rounded top corners cutting into the green brand banner */}
      <div className="w-full bg-white rounded-t-[22px] sm:rounded-t-[26px] px-[18px] lg:px-[24px] pt-[13px] lg:pt-[16px] flex flex-col items-start z-10 shadow-none">
        <div className="relative flex w-full flex-col items-start gap-[10px] lg:h-auto">

        {/* Title */}
        <div className="relative flex w-full flex-col items-start gap-[6px] shrink-0 lg:h-auto">
          <div className="relative flex w-full items-center lg:h-auto">
            <h1 
              onClick={() => setIsTitleExpanded(!isTitleExpanded)}
              title={isTitleExpanded ? "Click to collapse" : "Click to expand"}
              className={`font-rajdhani font-bold text-[18px] lg:text-[22px] leading-[26px] sm:leading-[27px] lg:leading-[30px] text-left bg-[linear-gradient(90deg,#242424_0%,#535353_117.72%)] bg-clip-text text-transparent cursor-pointer transition-all duration-200 ${isTitleExpanded ? '' : 'line-clamp-2'}`}
            >
              {displayTitle}
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
              {effectiveActiveSale && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#flash-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              )}
              {effectiveActiveSale ? (
                 <span className="h-[30px] font-rajdhani font-bold text-[28px] lg:text-[32px] leading-[30px] lg:leading-[32px] bg-[linear-gradient(90deg,#ff0000_0%,#ff2a00_70%,#ff7300_100%)] bg-clip-text text-transparent whitespace-nowrap">
                     Rs. {finalDiscounted}
                 </span>
              ) : (
                  <span className="h-[30px] font-rajdhani font-bold text-[28px] lg:text-[32px] leading-[30px] lg:leading-[32px] bg-[linear-gradient(87.93deg,#318126_10.71%,#33D81D_124.28%)] bg-clip-text text-transparent whitespace-nowrap">
                    Rs. {finalDiscounted}
                  </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-[12px] mt-1">
            <span className="h-[10px] font-rajdhani text-[12px] font-[500] leading-[10px] text-[#606060] whitespace-nowrap">
              *inclusive of all taxes
            </span>
            {effectiveActiveSale && timeLeft && (
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-5 h-5 mb-[1px]" fill="url(#flash-grad)" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="flash-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff0000" />
                      <stop offset="70%" stopColor="#ff2a00" />
                      <stop offset="100%" stopColor="#ff7300" />
                    </linearGradient>
                  </defs>
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
                </svg>
                <span className="font-rajdhani font-bold text-[12px] bg-[linear-gradient(90deg,#ff0000_0%,#ff2a00_70%,#ff7300_100%)] bg-clip-text text-transparent">
                  {timeLeft === 'Ended' ? 'SALE HAS ENDED' : `Sale Ends in ${timeLeft}`}
                </span>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>
    </section>
  );
};

export default ProductHeader;
