'use client';

import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import DiscountIcon from '@/components/icons/DiscountIcon';
import GreenCheckIcon from '@/components/icons/DiscountIcon2';
import DropDownIcon from '@/components/icons/DropDownIcon';
import type { CartItemType } from '@/services/cartService';

interface CheckoutPriceHeaderProps {
  totalAmount: string;
  mrp: number;
  subtotal: number;
  couponDiscount: number;
  couponCode: string;
  shippingCharge: number;
  codCharge?: number;
  bundleDiscount?: number;
  paymentDiscount?: number;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  isValidating?: boolean;
  couponError?: string | null;
  items?: CartItemType[];
  isFullWidth?: boolean;
}
export interface CheckoutPriceHeaderHandle {
  expandAndScroll: () => void;
}

const CheckoutPriceHeader = forwardRef<CheckoutPriceHeaderHandle, CheckoutPriceHeaderProps>(({
  totalAmount,
  mrp,
  subtotal,
  couponDiscount,
  couponCode,
  shippingCharge,
  codCharge = 0,
  bundleDiscount,
  paymentDiscount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  isValidating = false,
  couponError = null,
  items = [],
  isFullWidth = false
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [lastDiscount, setLastDiscount] = useState(couponDiscount);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    expandAndScroll: () => {
      setIsExpanded(true);
      if (containerRef.current) {
        const yOffset = -100; // offset for fixed headers
        const element = containerRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }));

  const isApplied = couponDiscount > 0;

  // Sync internal input with global state
  React.useEffect(() => {
    setCouponInput(couponCode);
    setLastDiscount(couponDiscount);
  }, [couponCode, couponDiscount]);

  const handleApply = () => {
    if (!couponInput.trim()) return;
    onApplyCoupon(couponInput.trim().toUpperCase());
  };

  const bundleDiscountValue = bundleDiscount || 0;
  const itemDiscountValue = Math.max(0, mrp - subtotal);
  const totalSavings = itemDiscountValue + bundleDiscountValue + couponDiscount + paymentDiscount;

  return (
    <div
      ref={containerRef}
      className={`w-full bg-white shadow-none overflow-hidden transition-all ${
        isFullWidth
          ? 'rounded-b-[20px] sm:rounded-b-[24px] border-b border-[#f0f3ee]'
          : 'rounded-[20px] border border-[#eaebf0]'
      }`}
    >
      <div className={`flex flex-col gap-[20px] sm:gap-[24px] ${
        isFullWidth
          ? 'px-[24px] py-[18px] sm:py-[20px]'
          : 'px-[24px] py-[20px]'
      }`}>

        {/* 1. TOTAL ORDER AMOUNT & PRICE BREAKDOWN BANNER (ON TOP) */}
        <div className="flex flex-col gap-[10px]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex justify-between items-center p-[14px_18px] bg-[#eaffcc] rounded-[14px] w-full outline-none active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-[8px]">
              <span className="font-rajdhani text-[17px] sm:text-[18px] font-bold text-[#18181b] tracking-[-0.5px]">
                Total Order Amount
              </span>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <DropDownIcon className="w-[16px] h-[16px] text-[#18181b]" />
              </motion.div>
            </div>
            <span className="font-rajdhani text-[18px] sm:text-[19px] font-bold text-[#18181b] tracking-tight">
              {totalAmount}
            </span>
          </button>

          {/* Price Breakdown Accordion */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-[10px] py-[10px] px-[6px] border-b border-[#f0f3ee]">
                  <div className="flex justify-between items-center">
                    <span className="font-rajdhani text-[15px] text-[#71717a]">MRP</span>
                    <span className="font-rajdhani text-[15px] text-[#18181b]">Rs. {mrp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-rajdhani text-[15px] text-[#71717a]">Discount on MRP</span>
                    <span className="font-rajdhani text-[15px] font-medium text-[#308026]">- Rs. {itemDiscountValue.toLocaleString()}</span>
                  </div>
                  {bundleDiscountValue > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-rajdhani text-[15px] text-[#71717a]">Bundle Discount</span>
                      <span className="font-rajdhani text-[15px] font-medium text-[#308026]">- Rs. {bundleDiscountValue.toLocaleString()}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-[6px]">
                        <span className="font-rajdhani text-[15px] text-[#71717a]">Coupon Discount</span>
                        <span className="px-[6px] py-[1px] bg-[#e8f3e4] text-[#308026] text-[10px] font-bold rounded-[4px] uppercase tracking-wider">
                          {couponCode}
                        </span>
                      </div>
                      <span className="font-rajdhani text-[15px] font-medium text-[#308026]">- Rs. {couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {paymentDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-rajdhani text-[15px] text-[#71717a]">Online Payment Discount</span>
                      <span className="font-rajdhani text-[15px] font-medium text-[#308026]">- Rs. {paymentDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-rajdhani text-[15px] text-[#71717a]">Delivery Charges</span>
                    <span className={`font-rajdhani text-[15px] font-medium ${shippingCharge > 0 ? 'text-[#18181b]' : 'text-[#308026]'}`}>
                      {shippingCharge > 0 ? `+ Rs. ${shippingCharge.toLocaleString()}` : 'FREE'}
                    </span>
                  </div>
                  {codCharge > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-rajdhani text-[15px] text-[#71717a]">COD Handling Fee</span>
                      <span className="font-rajdhani text-[15px] text-[#18181b]">
                        + Rs. {codCharge.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. ITEMS SUMMARY (with CartItem express wave tab UI & soft stroke as previous) */}
        {items && items.length > 0 && (
          <div className="w-full bg-white rounded-[20px] border border-[#e4e7ec] shadow-none overflow-hidden flex flex-col relative">
            {/* Top Banner Tab: Styled identically to CartItem's express wave tab */}
            <div className="relative w-full h-[38px] overflow-hidden select-none bg-[#f4f8f2]">
              <svg
                className="absolute top-0 left-0 h-full w-[260px] pointer-events-none"
                viewBox="0 0 260 38"
                preserveAspectRatio="none"
              >
                {/* Subtle under-wave accent */}
                <path
                  d="M0,0 L205,0 C225,0 220,38 260,38 L0,38 Z"
                  fill="#d9f99d"
                  opacity="0.65"
                />
                {/* Main top wave */}
                <path
                  d="M0,0 L185,0 C205,0 200,38 240,38 L0,38 Z"
                  fill="#eaffcc"
                />
              </svg>

              <div className="absolute top-0 left-0 h-full flex items-center pl-[18px] z-10 gap-2">
                <span className="font-rajdhani font-bold italic text-[17px] sm:text-[18px] text-[#18181b] tracking-tight">
                  Items Summary
                </span>
                <span className="font-rajdhani font-bold text-[12px] text-[#25661e] bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Content Area with Product Pictures */}
            <div className="p-[14px_16px_16px_16px]">
              <div className="flex items-center gap-[12px] overflow-x-auto py-[2px] scrollbar-none">
                {items.map((item, index) => {
                  const itemTitle = item.brand && item.brand !== 'Store Product'
                    ? `${item.brand} ${item.name}`
                    : item.name;
                  return (
                    <div
                      key={item.id || index}
                      className="relative w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-[14px] bg-[#fafafa] border border-[#eaebf0] overflow-hidden flex items-center justify-center p-1.5 shadow-none shrink-0 group hover:border-[#308026] transition-colors"
                      title={`${itemTitle} (Qty: ${item.quantity})`}
                    >
                      <Image
                        src={item.image || '/images/protein.webp'}
                        alt={item.name}
                        fill
                        className="object-contain p-0.5"
                        sizes="78px"
                      />

                      {/* Inside picture: Quantity badge only */}
                      <div className="absolute bottom-1.5 right-1.5 bg-[#18181b]/90 text-white font-rajdhani text-[11px] font-bold px-[6px] py-[1px] rounded-[5px] leading-tight shadow-sm">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. COUPON SECTION */}
        <div className="flex flex-col gap-[8px]">
          {isApplied ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-[12px_16px] rounded-[12px] bg-[#f2f9f1] border border-[#308026]">
                <div className="flex items-center gap-[8px]">
                  <DiscountIcon className="w-[20px] h-[20px] text-[#308026]" />
                  <span className="font-rajdhani text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.5px] text-[#308026]">
                    {couponCode} Applied
                  </span>
                </div>
                <button
                  onClick={onRemoveCoupon}
                  className="font-rajdhani text-[13px] font-semibold text-[#71717a] hover:text-[#ef4444] underline transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="flex gap-[8px] justify-center items-center">
                <GreenCheckIcon className="w-[16px] h-[16px] text-[#308026]" />
                <span className="font-rajdhani text-[14px] font-medium text-[#308026]">
                  Rs. {lastDiscount || couponDiscount} saved with coupon &ldquo;{couponCode}&rdquo;
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[6px]">
              <div
                className={`relative flex items-center justify-between rounded-[12px] border h-[48px] px-3.5 transition-all ${
                  couponError
                    ? 'border-[#ef4444] bg-[#fff5f5]'
                    : 'border-[#eaebf0] bg-[#f7faf6] focus-within:bg-white focus-within:border-[#308026]'
                }`}
              >
                <div className="flex items-center gap-[8px] flex-1">
                  <DiscountIcon className={`w-[18px] h-[18px] ${couponError ? 'text-[#ef4444]' : 'text-[#71717a]'}`} />
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    disabled={isValidating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && couponInput.trim()) {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                    className={`w-full bg-transparent font-rajdhani text-[15px] font-semibold uppercase tracking-wider outline-none placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#8b8e92] ${
                      couponError ? 'text-[#ef4444]' : 'text-[#18181b]'
                    }`}
                  />
                </div>
                <button
                  onClick={handleApply}
                  disabled={isValidating || !couponInput.trim()}
                  className={`font-rajdhani text-[14px] font-bold px-2 py-1 transition-all active:scale-95 disabled:opacity-40 ${
                    couponError ? 'text-[#ef4444]' : 'text-[#308026] hover:text-[#25661e]'
                  }`}
                >
                  {isValidating ? (
                    <div className="w-[16px] h-[16px] border-[2px] border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    "APPLY"
                  )}
                </button>
              </div>
              <AnimatePresence>
                {couponError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-1 font-rajdhani text-[12px] font-medium text-[#ef4444]"
                  >
                    {couponError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CheckoutPriceHeader.displayName = 'CheckoutPriceHeader';

export default CheckoutPriceHeader;
