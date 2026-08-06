'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarIcon from '@/components/icons/StarIcon';
import { optimizeImage } from '@/lib/optimizeImage';
import { useUIStore } from '@/store/uiStore';

import { Product } from '@/services/productService';

/**
 * ProductCard component for search results.
 * Wraps the entire card in a Next.js Link for optimized navigation.
 * Uses custom fonts and specific border logic for a perfect grid layout.
 */
const ProductCard: React.FC<{ product: Product, activeSale?: any }> = ({ product, activeSale }) => {

  const [isSaleValid, setIsSaleValid] = React.useState(true);
  React.useEffect(() => {
    if (activeSale && new Date(activeSale.ends_at).getTime() < Date.now()) {
      setIsSaleValid(false);
    }
  }, [activeSale]);

  const effectiveSale = isSaleValid ? activeSale : null;

  // Calculate dynamic sale pricing
  const baseDiscounted = Number(product.discounted_price);
  const baseOriginal = Number(product.original_price);
  
  const finalDiscounted = effectiveSale 
    ? effectiveSale.discount_type === 'PERCENTAGE'
        ? Math.round(baseDiscounted * (1 - effectiveSale.discount_value / 100))
        : Math.max(0, baseDiscounted - effectiveSale.discount_value)
    : baseDiscounted;

  let displayPercentage = product.discount_percentage;
  if (effectiveSale && baseOriginal > 0) {
    displayPercentage = Math.round(((baseOriginal - finalDiscounted) / baseOriginal) * 100).toString();
  }

  const setNavigatingProductSlug = useUIStore(s => s.setNavigatingProductSlug);

  return (
    <Link
      href={`/product/${product.slug}`}
      onClick={() => setNavigatingProductSlug(product.slug)}
      className={`group relative flex w-full flex-col gap-[4px] border-r border-b border-[#e8e8e8] bg-white transition-all active:scale-[0.98] lg:gap-0 ${product.stock_status === 'out_of_stock' ? 'grayscale-[0.5]' : ''}`}
    >
      {/* IMAGE & BADGES CONTAINER */}
      <div className="relative w-full aspect-[200/200] flex flex-col justify-end lg:aspect-[250/240] overflow-hidden">
        {/* Optimized Image with Hover Scale Effect */}
        <Image
          src={optimizeImage(product.images?.[0], 500) || '/images/protein.webp'}
          alt={product.title}
          fill
          className={`object-contain p-[20px] lg:p-[20px] transition-transform duration-300 group-hover:scale-105 ${product.stock_status === 'out_of_stock' ? 'opacity-40' : ''}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
        />

        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 z-[15] flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full bg-red-600/95 py-2 lg:py-3 flex items-center justify-center shadow-2xl transform -rotate-1 border-y border-red-400/30">
              <span className="font-rajdhani font-bold text-[10px] lg:text-[14px] tracking-[0.25em] text-white uppercase drop-shadow-md">
                Out of Stock
              </span>
            </div>
          </div>
        )}

        {/* Save Badge - Decorative Custom Font */}
        <div className={`absolute right-[11px] top-[11px] z-[10] flex items-center justify-center rounded-[6px] px-[8px] py-[4px] lg:px-[10px] ${effectiveSale ? 'bg-[#ff0000]' : 'bg-[#94ff00]'}`}>
          <span className={`font-rajdhani uppercase font-bold text-[10px] lg:text-[13px] leading-[14px] ${effectiveSale ? 'text-white' : 'text-[#242424]'}`}>
            save {displayPercentage}%
          </span>
        </div>

        {/* Rating Badge - Rajdhani Font */}
        <div className="absolute top-[11px] left-[11px] bg-[#ffe900] px-[8px] py-[6px] rounded-[6px] overflow-hidden flex items-center gap-[2px] z-10">
          <StarIcon className="w-[10px] h-[10px] text-[#242424]" />
          <span className="font-rajdhani text-[10px] lg:text-[12px] font-semibold leading-[10px] text-[#242424]">
            {product.rating}
          </span>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-col gap-[8px] px-[16px] py-[8px] pb-[16px] lg:px-[24px] lg:py-[20px] lg:gap-[12px]">
        <div className="flex flex-col gap-[2px] lg:gap-[4px]">
          {/* Brand Name - Subtle Metadata */}
          <span className="font-rajdhani text-[10px] lg:text-[13px] font-medium leading-[14px] text-[#979797] uppercase">
            {product.brands?.name || ''}
          </span>

          {/* Product Title - Custom Font for Branding */}
          <h3 className="font-rajdhani text-[13px] lg:text-[16px] font-semibold leading-[18px] lg:leading-[20px] tracking-[0.2px] text-[#242424] lg:h-[40px] overflow-hidden line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* PRICE SECTION */}
        <div className="flex items-center gap-[6px] lg:gap-[10px]">
          {/* Original Price - Strikethrough */}
          <span className="font-rajdhani text-[16px] lg:text-[18px] font-medium leading-[22px] text-[#979797] line-through tracking-[-1.12px]">
            Rs. {product.original_price}
          </span>

          {/* Discounted Price - Custom Font + Brand Green Gradient or Sale Red Gradient */}
          {effectiveSale ? (
            <div className="flex items-center gap-[2px]">
              <svg className="text-[#ff0000]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              <span className="font-rajdhani font-bold text-[17px] lg:text-[20px] leading-[24px] bg-[linear-gradient(90deg,#ff0000_0%,#ff2a00_70%,#ff7300_100%)] bg-clip-text text-transparent">
                Rs. {finalDiscounted}
              </span>
            </div>
          ) : (
            <span className="font-rajdhani font-bold text-[17px] lg:text-[20px] leading-[24px] bg-gradient-to-r from-[#308026] to-[#32d71d] bg-clip-text text-transparent">
              Rs. {finalDiscounted}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
