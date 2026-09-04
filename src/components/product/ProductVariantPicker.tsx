'use client';

import React, { useEffect, useRef } from 'react';
import type { ProductSize, ProductFlavour } from '@/services/productService';

interface ProductVariantPickerProps {
  sizes: ProductSize[];
  flavours: ProductFlavour[];
  selectedSize: string | null;
  selectedFlavorId: string | null;
  onSizeSelect: (size: string) => void;
  onFlavorSelect: (id: string) => void;
  sizeError?: boolean;
  flavorError?: boolean;
}

export default function ProductVariantPicker({
  sizes,
  flavours,
  selectedSize,
  selectedFlavorId,
  onSizeSelect,
  onFlavorSelect,
  sizeError,
  flavorError
}: ProductVariantPickerProps) {
  const flavorScrollRef = useRef<HTMLDivElement>(null);
  const sizeScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = flavorScrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const el = sizeScrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}} />

      {/* Flavour Selection */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[14px] font-bold text-[#242424] flex items-center justify-between">
          <span>Flavour: <span className="font-medium text-[#71717a]">{flavours.length === 0 ? 'No Flavour' : (flavours.find(f => f.id === selectedFlavorId)?.flavour_name || 'Select')}</span></span>
        </h4>
        <div 
          ref={flavorScrollRef}
          className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 w-full flex-nowrap"
        >
          {flavours.length === 0 ? (
            <button
              disabled
              className="h-[40px] px-4 rounded-[8px] border-[1.5px] border-[#E8E8E8] bg-[#F4F4F5] text-[#242424] font-bold text-[14px] opacity-70 cursor-not-allowed"
            >
              No Flavour
            </button>
          ) : flavours.map((item) => {
            const isSelected = selectedFlavorId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onFlavorSelect(item.id)}
                disabled={!item.is_available}
                className={`
                  relative flex items-center justify-center rounded-[8px] transition-all duration-200 overflow-hidden
                  h-[40px] px-4 border-[1.5px] shrink-0 font-bold text-[14px]
                  ${!item.is_available ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                  ${isSelected ? 'border-[#1D1D1D] bg-[#1D1D1D] text-white' : 'border-[#E8E8E8] bg-white text-[#242424] hover:border-[#242424]'}
                `}
              >
                {!item.is_available && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <svg className="w-full h-full text-[#71717a]" preserveAspectRatio="none">
                      <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
                {item.flavour_name}
              </button>
            );
          })}
        </div>
        {flavorError && <span className="text-[12px] text-red-500 font-semibold -mt-2">Please select a flavor</span>}
      </div>

      {/* Size Selection */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[14px] font-bold text-[#242424]">
          Size: <span className="font-medium text-[#71717a]">{sizes.length === 0 ? 'One Size' : (selectedSize || 'Select')}</span>
        </h4>
        <div 
          ref={sizeScrollRef}
          className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 w-full flex-nowrap"
        >
          {sizes.length === 0 ? (
            <button
              disabled
              className="h-[40px] px-4 rounded-[8px] border-[1.5px] border-[#E8E8E8] bg-[#F4F4F5] text-[#242424] font-bold text-[14px] opacity-70 cursor-not-allowed shrink-0"
            >
              One Size
            </button>
          ) : sizes.map((sizeObj) => {
            const isSelected = selectedSize === sizeObj.size_label;
            return (
              <button
                key={sizeObj.id}
                onClick={() => onSizeSelect(sizeObj.size_label)}
                disabled={!sizeObj.is_available}
                className={`
                  relative h-[40px] px-4 rounded-[8px] border-[1.5px] font-bold text-[14px] transition-all shrink-0 overflow-hidden
                  ${!sizeObj.is_available ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                  ${isSelected ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white text-[#242424] border-[#E8E8E8] hover:border-[#242424]'}
                `}
              >
                {!sizeObj.is_available && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <svg className="w-full h-full text-[#71717a]" preserveAspectRatio="none">
                      <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
                {sizeObj.size_label}
              </button>
            );
          })}
        </div>
        {sizeError && <span className="text-[12px] text-red-500 font-semibold -mt-2">Please select a size</span>}
      </div>
    </div>
  );
}
