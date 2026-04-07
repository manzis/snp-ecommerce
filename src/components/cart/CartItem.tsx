'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TrashIcon from '@/components/icons/TrashIcon';
import HeartIcon from '@/components/icons/HeartIcon';
import FlashIcon from '@/components/icons/FlashIcon';
import PackageIcon from '@/components/icons/PackageIcon';
import QtyDropDownIcon from '@/components/icons/QtyDropDownIcon';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/ToastProvider';
import type { CartItemType } from '@/services/cartService';

interface CartItemProps {
  item: CartItemType;
}

const getDeliveryString = (status?: string) => {
  const today = new Date();
  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  if (status === 'pre_order') {
    const start = new Date(today);
    start.setDate(today.getDate() + 4);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return (
      <>
        Delivery between <span className="font-semibold">{start.toLocaleDateString('en-US', formatOptions)} - {end.toLocaleDateString('en-US', formatOptions)}</span>
      </>
    );
  } else {
    // default to in_stock
    const d = new Date(today);
    d.setDate(today.getDate() + 3);
    return (
      <>
        Delivery By <span className="font-semibold">{d.toLocaleDateString('en-US', formatOptions)}</span>
      </>
    );
  }
};

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  const { showToast } = useToast();
  return (
    <div className="flex w-full flex-col border-t border-[#f1f5f9] bg-white">
      {/* Product Details Area - items-stretch ensures the image div fills the vertical space */}
      <div className="flex items-stretch p-[16px_24px_8px_24px] lg:p-[24px]">

        {/* Image Container - width remains 117px, height stretches to match content area */}
        <Link href={item.slug ? `/product/${item.slug}` : '#'} className="relative w-[117px] shrink-0 rounded-[12px] border border-[#f1f5f9] flex items-center justify-center overflow-hidden bg-white cursor-pointer">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-2 hover:scale-105 transition-transform"
            sizes="117px"
          />
        </Link>

        {/* Content Area - min-w-0 is required for the child truncate to function properly in flex */}
        <div className="flex flex-1 flex-col gap-[8px] pl-[16px] min-w-0">
          <div className="flex flex-col gap-[2px] w-full">
            <span className="font-titillium text-[12px] text-[#bebebe] leading-[18px]">
              {item.brand || 'Store Product'}
            </span>
            {/* Product Name - Single line with ellipsis */}
            <Link href={item.slug ? `/product/${item.slug}` : '#'} className="hover:underline cursor-pointer">
              <h3 className="font-custom text-[14px] text-[#242424] leading-[16px] tracking-[0.2px] truncate w-full">
                {item.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-[6px]">
            {item.mrp > 0 && (
              <span className="font-titillium text-[18px] text-[#8b8e92] line-through tracking-[-1.26px]">
                NPR {item.mrp.toLocaleString()}
              </span>
            )}
            <span className="font-custom text-[18px] bg-gradient-to-r from-[#308026] to-[#32d71d] bg-clip-text text-transparent">
              NPR {item.price.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-row gap-[13px] items-center text-[#8a8e91] font-titillium text-[14px] whitespace-nowrap">
            {item.selected_size && <span>Size: {item.selected_size}</span>}
            {item.selected_flavor && <span>Flavour: {item.selected_flavor}</span>}
          </div>

          {/* Quantity Selector */}
          <div className="relative flex w-[79px] items-center justify-center gap-[10px] rounded-[6px] border border-[#f1f5f9] py-[8px] active:scale-95 transition-all bg-white hover:border-[#3F9733]">
            <span className="font-titillium text-[14px] text-[#242424]">Qty: {item.quantity}</span>
            <QtyDropDownIcon className="h-[18px] w-[18px] text-[#242424]" />
            <select
              value={item.quantity}
              onChange={(e) => updateQuantity(item, Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-[6px] px-[24px] py-[12px]">
        <PackageIcon className="h-[16px] w-[16px] text-[#242424]" />
        <span className="font-titillium text-[14px] text-[#242424]">
          {getDeliveryString(item.stock_status)}
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
            onClick={(e) => {
              if (action.label === 'Remove') {
                e.preventDefault();
                removeItem(item);
                showToast("Item Removed Successfully!", "success");
              }
            }}
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