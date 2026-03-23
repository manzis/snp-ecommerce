'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import StarIcon from '@/components/icons/StarIcon';

interface Product {
  id: number;
  slug: string; // Required for dynamic routing
  brand: string;
  name: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  rating: number;
  image: string;
}

/**
 * ProductCard component for search results.
 * Wraps the entire card in a Next.js Link for optimized navigation.
 * Uses custom fonts and specific border logic for a perfect grid layout.
 */
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <Link 
      href={`/product/${product.slug}`}
      className="group flex flex-col w-full bg-white relative transition-all active:scale-[0.98] border-r border-b border-[#e8e8e8] hover:bg-[#fafafa] cursor-pointer"
    >
      {/* IMAGE & BADGES CONTAINER */}
      <div className="relative w-full aspect-[206/194] flex flex-col justify-end lg:aspect-[250/240] overflow-hidden">
        {/* Optimized Image with Hover Scale Effect */}
        <div className="relative w-full h-[162px] lg:h-[200px] transition-transform duration-500 ease-out group-hover:scale-110">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        </div>

        {/* Save Badge - Decorative Custom Font */}
        <div className="absolute top-[16px] left-[18px] bg-[#94ff00] px-[3px] py-[1px] rounded-[6px] z-10 flex items-center justify-center">
          <span className="font-custom text-[7px] lg:text-[10px] font-normal leading-[14px] text-[#242424] whitespace-nowrap uppercase">
            save {product.discount}
          </span>
        </div>

        {/* Rating Badge - Titillium Font */}
        <div className="absolute top-[13px] right-[18px] bg-[#ffe900] px-[8px] py-[6px] rounded-[6px] overflow-hidden flex items-center gap-[2px] z-10">
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
          <span className="font-titillium text-[10px] lg:text-[13px] font-normal leading-[14px] text-[#bebebe]">
            {product.brand}
          </span>
          
          {/* Product Title - Custom Font for Branding */}
          <h3 className="font-custom text-[13px] lg:text-[16px] font-normal leading-[16px] lg:leading-[22px] tracking-[0.2px] text-[#242424] line-clamp-1 lg:line-clamp-2 group-hover:text-[#308026] transition-colors">
            {product.name}
          </h3>
        </div>

        {/* PRICE SECTION */}
        <div className="flex items-center gap-[6px] lg:gap-[10px]">
          {/* Original Price - Strikethrough */}
          <span className="font-titillium text-[16px] lg:text-[18px] font-normal leading-[22px] text-[#979797] line-through tracking-[-1.12px]">
            {product.originalPrice}
          </span>
          
          {/* Discounted Price - Custom Font + Brand Green Gradient */}
          <span className="font-custom text-[17px] lg:text-[20px] font-normal leading-[24px] bg-gradient-to-r from-[#308026] to-[#32d71d] bg-clip-text text-transparent">
            {product.discountedPrice}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;