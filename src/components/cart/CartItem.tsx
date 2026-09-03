'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TrashIcon from '@/components/icons/TrashIcon';
import HeartIcon from '@/components/icons/HeartIcon';
import FlashIcon from '@/components/icons/FlashIcon';
import PackageIcon from '@/components/icons/PackageIcon';
import QtyDropDownIcon from '@/components/icons/QtyDropDownIcon';
import ArrowDownSharp from '@/components/icons/ArrowDownSharp';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/ToastProvider';
import type { CartItemType } from '@/services/cartService';

interface CartItemProps {
  item: CartItemType;
}

const getDeliveryString = (status?: string) => {
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const weekdayOptions: Intl.DateTimeFormatOptions = { weekday: 'short' };

  const isPre = status && (status.toLowerCase() === 'pre_order' || status.toLowerCase() === 'preorder' || status.toLowerCase() === 'pre-order');

  if (isPre) {
    const start = new Date(today);
    start.setDate(today.getDate() + 4);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    const startStr = start.toLocaleDateString('en-US', dateOptions);
    const endStr = end.toLocaleDateString('en-US', dateOptions);
    return (
      <>
        Delivery between <span className="font-bold text-[#27272a]">{startStr} – {endStr}</span>
      </>
    );
  } else {
    const d = new Date(today);
    d.setDate(today.getDate() + 3);
    const dateStr = `${d.toLocaleDateString('en-US', dateOptions)}, ${d.toLocaleDateString('en-US', weekdayOptions)}`;
    return (
      <>
        Delivery By <span className="font-bold text-[#27272a]">{dateStr}</span>
      </>
    );
  }
};

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { showToast } = useToast();
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  const bundleTotalDiscount = React.useMemo(() => {
    if (!item.bundle_id) return 0;
    return Math.round(items
      .filter(i => i.bundle_id === item.bundle_id)
      .reduce((acc, i) => acc + ((i.bundle_discount || 0) * i.quantity), 0));
  }, [items, item.bundle_id]);

  const [saleTimeLeft, setSaleTimeLeft] = React.useState('');

  React.useEffect(() => {
    if (!item.is_sale || !item.sale_end_date) return;
    const endsAt = new Date(item.sale_end_date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endsAt - now;

      if (distance < 0) {
        setSaleTimeLeft('Ended');
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

      setSaleTimeLeft(parts.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item.is_sale, item.sale_end_date]);

  const isPreOrder = React.useMemo(() => {
    if (!item.stock_status) return false;
    const status = item.stock_status.toLowerCase().replace(/[-_]/g, '');
    return status === 'preorder';
  }, [item.stock_status]);

  const isOutOfStock = React.useMemo(() => {
    if (!item.stock_status) return false;
    const status = item.stock_status.toLowerCase().replace(/[^a-z]/g, '');
    return status === 'outofstock' || status === 'soldout' || status === 'out';
  }, [item.stock_status]);

  return (
    <div className="flex w-full flex-col border-t border-[#f1f5f9] bg-white relative overflow-hidden">
      {/* Badge - Top Right Corner Straight Diagonal Cut Slice */}
      {isOutOfStock ? (
        <div 
          className="absolute top-0 right-0 z-10 flex items-center justify-center bg-[#dc2626] text-white font-rajdhani text-[11px] font-bold uppercase tracking-[0.8px] pl-4 pr-2.5 py-1 shadow-sm"
          style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          Out of Stock
        </div>
      ) : isPreOrder ? (
        <div 
          className="absolute top-0 right-0 z-10 flex items-center justify-center bg-[#7c2d12] text-[#fffbeb] font-rajdhani text-[11px] font-bold uppercase tracking-[0.8px] pl-4 pr-2.5 py-1 shadow-sm"
          style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          Pre-Order
        </div>
      ) : null}

      {/* Savings Header - All Bundle Items */}
      {item.bundle_id && bundleTotalDiscount > 0 ? (
        <div className="w-full bg-[#f0fff4] border-b border-[#318126]/10 px-[24px] py-[6px] flex items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-[#318126] tracking-[0.5px]">
            Congrats! You Saved Rs. {bundleTotalDiscount} with this bundle deal
          </span>
        </div>
      ) : null}

      {/* TOP SECTION ABOVE ACTION BUTTONS */}
      <div className="flex items-stretch p-[20px_24px_10px_24px] lg:p-[22px_24px_12px_24px]">

        {/* Image Container - width remains 117px, height stretches to match content area */}
        <Link href={item.slug ? `/product/${item.slug}` : '#'} className={`relative w-[117px] shrink-0 rounded-[12px] border flex items-center justify-center overflow-hidden bg-white cursor-pointer ${isOutOfStock ? 'border-[#fee2e2]' : 'border-[#f1f5f9]'}`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={`object-contain p-2 hover:scale-105 transition-transform ${isOutOfStock ? 'opacity-80' : ''}`}
            sizes="117px"
          />
          {/* Red Spill Overlay from Left Bottom to Top Right - INSIDE IMAGE ONLY */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(239,68,68,0.35)_0%,rgba(254,202,202,0.2)_45%,rgba(255,255,255,0.4)_85%)] pointer-events-none z-10" />
          )}
        </Link>

          {/* Content Area - min-w-0 is required for the child truncate to function properly in flex */}
          <div className="flex flex-1 flex-col gap-[8px] pl-[16px] min-w-0">
            <div className="flex items-start justify-between gap-1 w-full relative">
              <div className="flex flex-col gap-[2px] min-w-0 flex-1">
                <span className="font-rajdhani text-[12px] font-semibold text-[#242424] leading-[18px]">
                  {item.brand || 'Store Product'}
                </span>
                {/* Product Name - Single line with ellipsis */}
                <Link href={item.slug ? `/product/${item.slug}` : '#'} className="hover:underline cursor-pointer">
                  <h3 className="font-rajdhani font-bold text-[14px] text-[#242424] leading-[16px] tracking-[0.2px] truncate w-full">
                    {item.name}
                  </h3>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-[6px]">
                {item.mrp > (item.price - (item.bundle_discount || 0)) && (
                  <div className="flex items-center text-[#308026] mr-[4px]">
                    <ArrowDownSharp className=" h-[18px] w-[18px]" fill="currentColor" />
                    <span className="font-rajdhani text-[18px] font-semibold tracking-[-0.5px]">
                      {Math.round(((item.mrp - (item.price - (item.bundle_discount || 0))) / item.mrp) * 100)}%
                    </span>
                  </div>
                )}
                {item.mrp > 0 && item.mrp > (item.price - (item.bundle_discount || 0)) && (
                  <span className="font-rajdhani text-[18px] text-[#8b8e92] line-through decoration-[#8b8e92] decoration-[1.2px] tracking-[-0.8px]">
                    Rs. {item.mrp.toLocaleString()}
                  </span>
                )}
                <span className={`font-rajdhani font-bold text-[18px] ${item.is_sale ? 'bg-[linear-gradient(90deg,#ff0000_0%,#ff2a00_70%,#ff7300_100%)]' : 'bg-gradient-to-r from-[#308026] to-[#3AAF2A]'} bg-clip-text text-transparent`}>
                  Rs. {Math.round(item.price - (item.bundle_discount || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-row gap-[13px] items-center font-rajdhani text-[14px] font-semibold text-[#71717a] whitespace-nowrap">
              {Boolean(item.selected_size || item.selected_flavor) && (
                <span>{[item.selected_size, item.selected_flavor].filter(Boolean).join(', ')}</span>
              )}
            </div>

            {item.is_sale && saleTimeLeft && (
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#E3241B] mt-[-2px]">
                <FlashIcon className="w-[14px] h-[14px]" />
                <span>Sale ends in {saleTimeLeft}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="relative flex w-[79px] items-center justify-center gap-[10px] rounded-[6px] border border-[#f1f5f9] bg-white/80 py-[8px] active:scale-95 transition-all hover:border-[#3F9733]">
              <span className="font-rajdhani text-[14px] font-semibold text-[#242424]">Qty: {item.quantity}</span>
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
          <PackageIcon className="h-[16px] w-[16px] text-[#525252]" />
          <span className="font-rajdhani text-[14px] text-[#525252]">
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
              } else if (action.label === 'Wishlist') {
                e.preventDefault();
                setIsWishlisted(prev => {
                  const next = !prev;
                  showToast(next ? "Added to Wishlist!" : "Removed from Wishlist!", "success");
                  return next;
                });
              }
            }}
            className={`flex flex-1 items-center justify-center gap-[12px] py-[12px] bg-white active:bg-[#f9fafb] transition-colors
              ${idx !== 2 ? 'border-r border-[#f1f5f9]' : ''}`}
          >
            {action.label === 'Wishlist' ? (
              <HeartIcon className="h-[18px] w-[18px] text-[#525252]" filled={isWishlisted} />
            ) : (
              <action.icon className="h-[18px] w-[18px] text-[#525252]" />
            )}
            <span className={`font-rajdhani text-[16px] font-semibold ${action.label === 'Wishlist' && isWishlisted ? 'text-[#ef4444]' : 'text-[#525252]'}`}>
              {action.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
};

export default CartItem;
