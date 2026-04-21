'use client';

import React from 'react';
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
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Flavour Selection */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[14px] font-bold text-[#242424] flex items-center justify-between">
            <span>Flavour: <span className="font-normal text-[#71717a]">{flavours.length === 0 ? 'No Flavour' : (flavours.find(f => f.id === selectedFlavorId)?.flavour_name || 'Select')}</span></span>
        </h4>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
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
                            relative flex items-center justify-center rounded-[8px] transition-all duration-200
                            h-[40px] px-4 border-[1.5px] shrink-0 font-bold text-[14px]
                            ${!item.is_available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            ${isSelected ? 'border-[#1D1D1D] bg-[#1D1D1D] text-white' : 'border-[#E8E8E8] bg-white text-[#242424] hover:border-[#242424]'}
                        `}
                    >
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
            Size: <span className="font-normal text-[#71717a]">{sizes.length === 0 ? 'One Size' : (selectedSize || 'Select')}</span>
        </h4>
        <div className="flex gap-2 flex-wrap">
            {sizes.length === 0 ? (
                <button
                    disabled
                    className="h-[40px] px-4 rounded-[8px] border-[1.5px] border-[#E8E8E8] bg-[#F4F4F5] text-[#242424] font-bold text-[14px] opacity-70 cursor-not-allowed"
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
                            h-[40px] px-4 rounded-[8px] border-[1.5px] font-bold text-[14px] transition-all
                            ${!sizeObj.is_available ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                            ${isSelected ? 'bg-[#1D1D1D] text-white border-[#1D1D1D]' : 'bg-white text-[#242424] border-[#E8E8E8] hover:border-[#242424]'}
                        `}
                    >
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
