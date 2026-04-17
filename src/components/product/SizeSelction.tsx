'use client';

import React, { useEffect } from 'react';
import type { ProductSize } from '@/services/productService';
import { useProductSelectionStore } from '@/store/productSelectionStore';

interface SizeSelectionProps {
  sizes: ProductSize[];
}

const SizeSelection: React.FC<SizeSelectionProps> = ({ sizes }) => {
  const { selectedSize, setSize: setSelectedSize, setActiveVariantImage, sizeError } = useProductSelectionStore();

  // Auto-selection of default size intentionally removed to enforce explicit user selection

  return (
    <section id="size-section" className="relative flex flex-col items-start gap-[16px] w-full h-auto min-h-[79px] ">
      {/* 
          HEADER: Selected Size
          - tracking-[-0.02em]: Exact Figma Token
          - leading-[18px]: Matching box height for 1:1 verticality
      */}
      <h3 className="h-[18px] whitespace-nowrap text-left font-titillium text-[18px] font-semibold tracking-[-0.02em] text-[#242424] leading-[18px]">
        {selectedSize ? `Selected Size: ` : 'Select Size'} <span className="font-normal">{sizes.length === 0 ? 'One Size' : (selectedSize || '')}</span>
      </h3>

      {/* 
          FRAME 12: Buttons Row
          - pt-[2px] buffer to prevent 'Outside Border' clipping
      */}
      <div className="flex h-[45px] flex-row items-start gap-[12px] pt-[2px] px-[2px]">
        {sizes.length === 0 ? (
          <button
            type="button"
            className="group relative flex h-[45px] px-[16px] min-w-[66px] flex-shrink-0 flex-col items-center justify-center rounded-[6px] transition-all duration-100 ease-in outline-[1.5px] outline-offset-0 bg-[#000000] outline-[#242424]"
          >
            <div className="flex h-[38px] flex-row items-center justify-center p-[10px] gap-[10px]">
              <span className="whitespace-nowrap text-center font-titillium text-[18px] font-semibold leading-[18px] tracking-[-0.02em] text-[#FFFFFF]">
                One Size
              </span>
            </div>
          </button>
        ) : sizes.map((sizeObj) => {
          const isActive = selectedSize === sizeObj.size_label;

          return (
            <button
              key={sizeObj.id}
              type="button"
              disabled={!sizeObj.is_available}
              onClick={() => {
                setSelectedSize(sizeObj.size_label);
                if (sizeObj.image_url) {
                   setActiveVariantImage(sizeObj.image_url);
                }
              }}
              /* 
              */
              className={`
                group relative flex h-[45px] w-[66px] flex-shrink-0 flex-col items-center justify-center rounded-[6px] transition-all duration-100 ease-in
                outline-[1.5px] outline-offset-0 overflow-hidden
                ${!sizeObj.is_available ? 'opacity-60 cursor-not-allowed bg-[#FAFAFA]' : 'cursor-pointer'}
                ${isActive
                  ? 'bg-[#000000] outline-[#242424]'
                  : 'bg-[#FFFFFF] outline-[#E9E9E9]'}
              `}
            >
              {!sizeObj.is_available && (
                <div className="absolute z-10 inset-0 flex items-center justify-center bg-[#FAFAFA]/60 overflow-hidden rounded-[6px]">
                  <svg className="absolute w-full h-full text-[#C0C0C0]" preserveAspectRatio="none">
                    <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
              {/* 
                  FRAME 17: Inner Content Wrapper
                  - padding: 10px
                  - height: 38px (internal)
              */}
              <div className="flex h-[38px] w-[66px] flex-row items-center justify-center p-[10px] gap-[10px]">
                <span
                  className={`
                    whitespace-nowrap text-center font-titillium text-[18px] font-semibold leading-[18px] tracking-[-0.02em] transition-colors duration-200
                    ${isActive ? 'text-[#FFFFFF]' : 'text-[#000000]'}
                  `}
                >
                  {sizeObj.size_label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {sizeError && (
        <span data-error="true" className="text-[#FF3333] font-titillium text-[14px] font-semibold mt-[-8px]">
          Please select a size
        </span>
      )}
    </section>
  );
};

export default SizeSelection;