'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/services/productService';

interface AdminProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

/**
 * AdminProductCard - Used in Admin Layout Management.
 * Features: Sharp borders (rounded-none), image, brand, and name only.
 * Selection indicator on absolute top-left.
 */
const AdminProductCard: React.FC<AdminProductCardProps> = ({ product, isSelected, onToggle }) => {
  return (
    <div 
      onClick={() => onToggle(product.id)}
      className={`group relative flex w-full flex-col gap-[4px] border-r border-b border-[#e8e8e8] bg-white transition-all cursor-pointer ${isSelected ? 'bg-gray-50' : ''}`}
    >
      {/* SELECTION INDICATOR */}
      <div className="absolute top-[10px] left-[10px] z-20">
        <div className={`w-[20px] h-[20px] border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#308026] border-[#308026]' : 'bg-white border-[#e8e8e8]'}`}>
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-square flex flex-col justify-end overflow-hidden">
        <Image
          src={product.images?.[0] || '/images/protein.jpg'}
          alt={product.title}
          fill
          className="object-contain p-[10px]"
          sizes="(max-width: 1024px) 150px, 300px"
        />
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-col gap-[4px] px-[12px] py-[12px] pb-[16px]">
        <div className="flex flex-col gap-[2px]">
          {/* Brand Name */}
          <span className="font-rubik text-[10px] lg:text-[12px] font-normal leading-[14px] text-[#bebebe] uppercase">
            {product.brands?.name || ''}
          </span>
          
          {/* Product Title */}
          <h3 className="font-rubik text-[14px] lg:text-[16px] font-normal leading-[18px] tracking-[0.2px] text-[#242424] h-[36px] overflow-hidden line-clamp-2">
            {product.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AdminProductCard;
