'use client';

import React from 'react';
import Image from 'next/image';
import TrashIcon from '@/components/icons/TrashIcon';
import HeartIcon from '@/components/icons/HeartIcon';
import FlashIcon from '@/components/icons/FlashIcon';
import PackageIcon from '@/components/icons/PackageIcon';
import QtyDropDownIcon from '@/components/icons/QtyDropDownIcon';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    brand: string;
    image: string;
    originalPrice: string;
    discountedPrice: string;
    size: string;
    flavor: string;
    qty: number;
    deliveryDate: string;
  };
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  return (
    <div className="flex w-full flex-col border-t border-[#f1f5f9] bg-white">
      {/* Product Details Area - items-stretch ensures the image div fills the vertical space */}
      <div className="flex items-stretch p-[16px_24px_8px_24px] lg:p-[24px]">
        
        {/* Image Container - width remains 117px, height stretches to match content area */}
        <div className="relative w-[117px] shrink-0 rounded-[12px] border border-[#f1f5f9] flex items-center justify-center overflow-hidden bg-white">
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className="object-contain p-2" 
            sizes="117px"
          />
        </div>

        {/* Content Area - min-w-0 is required for the child truncate to function properly in flex */}
        <div className="flex flex-1 flex-col gap-[8px] pl-[16px] min-w-0">
          <div className="flex flex-col gap-[2px] w-full">
            <span className="font-titillium text-[12px] text-[#bebebe] leading-[18px]">
              {item.brand}
            </span>
            {/* Product Name - Single line with ellipsis */}
            <h3 className="font-custom text-[14px] text-[#242424] leading-[16px] tracking-[0.2px] truncate w-full">
              {item.name}
            </h3>
          </div>

          <div className="flex items-center gap-[6px]">
            <span className="font-titillium text-[18px] text-[#8b8e92] line-through tracking-[-1.26px]">
              {item.originalPrice}
            </span>
            <span className="font-custom text-[18px] bg-gradient-to-r from-[#308026] to-[#32d71d] bg-clip-text text-transparent">
              {item.discountedPrice}
            </span>
          </div>

          <div className="flex flex-wrap gap-[13px] items-center text-[#8a8e91] font-titillium text-[14px]">
            <span>Size: {item.size}</span>
            <span>Flavour: {item.flavor}</span>
          </div>

          {/* Quantity Selector */}
          <button className="flex w-[79px] items-center justify-center gap-[10px] rounded-[6px] border border-[#f1f5f9] py-[8px] active:scale-95 transition-all">
            <span className="font-titillium text-[14px] text-[#242424]">Qty: {item.qty}</span>
            <QtyDropDownIcon className="h-[18px] w-[18px] text-[#242424]" />
          </button>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-[6px] px-[24px] py-[12px]">
        <PackageIcon className="h-[15px] w-[15px] text-[#242424]" />
        <span className="font-titillium text-[14px] text-[#242424]">
          Delivery By {item.deliveryDate}
        </span>
      </div>

      {/* Action Bar */}
      <div className="flex w-full border-t border-b border-[#f1f5f9]">
        {[
          { label: 'Remove', icon: TrashIcon },
          { label: 'Wishlist', icon: HeartIcon },
          { label: 'Buy Now', icon: FlashIcon },
        ].map((action, idx) => (
          <button 
            key={idx} 
            className={`flex flex-1 items-center justify-center gap-[15px] py-[12px] bg-white active:bg-[#f9fafb] transition-colors
              ${idx !== 2 ? 'border-r border-[#f1f5f9]' : ''}`}
          >
            <action.icon className="h-[18px] w-[18px] text-[#6a6b6e]" />
            <span className="font-titillium text-[16px] font-semibold text-[#6a6b6e]">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CartItem;