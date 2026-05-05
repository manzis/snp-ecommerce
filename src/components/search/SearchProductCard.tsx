'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarIcon from '@/components/icons/StarIcon';
import { optimizeImage } from '@/lib/optimizeImage';

import { Product } from '@/services/productService';

/**
 * ProductCard component for search results.
 * Wraps the entire card in a Next.js Link for optimized navigation.
 * Uses custom fonts and specific border logic for a perfect grid layout.
 */
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Link
      href={`/product/${product.slug}`}
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
              <span className="font-custom text-[10px] lg:text-[14px] font-bold tracking-[0.25em] text-white uppercase drop-shadow-md">
                Out of Stock
              </span>
            </div>
          </div>
        )}

        {/* Save Badge - Decorative Custom Font */}
        <div className="absolute right-[11px] top-[11px] z-[10] flex items-center justify-center rounded-[6px] bg-[#94ff00] px-[8px] py-[4px] lg:px-[10px]">
          <span className="font-custom text-[10px] lg:text-[13px] font-normal leading-[14px] text-[#242424]">
            save {product.discount_percentage}%
          </span>
        </div>

        {/* Rating Badge - Titillium Font */}
        <div className="absolute top-[11px] left-[11px] bg-[#ffe900] px-[8px] py-[6px] rounded-[6px] overflow-hidden flex items-center gap-[2px] z-10">
          <StarIcon className="w-[10px] h-[10px] text-[#242424]" />
          <span className="font-titillium text-[10px] lg:text-[12px] font-semibold leading-[10px] text-[#242424]">
            {product.rating}
          </span>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-col gap-[8px] px-[16px] py-[8px] pb-[16px] lg:px-[24px] lg:py-[20px] lg:gap-[12px]">
        <div className="flex flex-col gap-[2px] lg:gap-[4px]">
          {/* Brand Name - Subtle Metadata */}
          <span className="font-titillium text-[10px] lg:text-[13px] font-normal leading-[14px] text-[#979797] uppercase">
            {product.brands?.name || ''}
          </span>

          {/* Product Title - Custom Font for Branding */}
          <h3 className="font-titillium text-[13px] lg:text-[20px] font-semibold leading-[18px] lg:leading-[24px] tracking-[0.2px] text-[#242424] lg:h-[48px] overflow-hidden line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* PRICE SECTION */}
        <div className="flex items-center gap-[6px] lg:gap-[10px]">
          {/* Original Price - Strikethrough */}
          <span className="font-titillium text-[16px] lg:text-[18px] font-normal leading-[22px] text-[#979797] line-through tracking-[-1.12px]">
            Rs. {product.original_price}
          </span>

          {/* Discounted Price - Custom Font + Brand Green Gradient */}
          <span className="font-custom text-[17px] lg:text-[20px] font-normal leading-[24px] bg-gradient-to-r from-[#308026] to-[#32d71d] bg-clip-text text-transparent">
            Rs. {product.discounted_price}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
