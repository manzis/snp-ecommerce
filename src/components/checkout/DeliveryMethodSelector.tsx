'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

interface DeliveryMethod {
  id: string;
  title: string;
  price: string;
  desc: string;
  cost?: number;
}

interface DeliveryMethodSelectorProps {
  methods: DeliveryMethod[];
  selectedMethodId: string;
  onSelect: (id: string) => void;
  hasError?: boolean;
  freeThreshold?: number;
  subtotal?: number;
}

const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({
  methods,
  selectedMethodId,
  onSelect,
  hasError = false,
  freeThreshold = 5000,
  subtotal,
}) => {
  const cartItems = useCartStore((state) => state.items);
  const currentSubtotal = subtotal ?? cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isFreeShipping = freeThreshold > 0 && currentSubtotal >= freeThreshold;

  return (
    <div className="flex flex-col gap-[14px] w-full">
      {/* Title outside the border container */}
      <span className="font-rajdhani text-[18px] font-semibold leading-[22px] text-[#242424]">
        Choose delivery options:
      </span>

      {/* Options Container */}
      <div
        className={`flex flex-col rounded-[12px] border transition-all duration-200 overflow-hidden bg-white ${
          hasError ? 'border-[#e11717] bg-[#fff5f5]' : 'border-[#eaebf0]'
        }`}
      >
        <div className="flex flex-col">
          {methods.map((opt) => {
            const isSelected = selectedMethodId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`flex p-[16px] gap-[12px] border-b border-[#eaebf0] last:border-b-0 cursor-pointer transition-colors duration-200 ${
                  isSelected ? 'bg-[#f7faf6]' : 'hover:bg-[#fafafb]'
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`flex items-center justify-center w-[18px] h-[18px] mt-[3px] rounded-full border-[2px] transition-all shrink-0 ${
                    isSelected ? 'border-[#3f9633]' : 'border-[#d0d5dd]'
                  }`}
                >
                  {isSelected && (
                    <div className="w-[8px] h-[8px] bg-[#3f9633] rounded-full" />
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-[8px]">
                    <span className="font-rajdhani text-[16px] font-semibold text-[#242424]">
                      {opt.title}
                    </span>
                    {isFreeShipping ? (
                      <div className="flex items-center gap-[6px]">
                        <span className="font-rajdhani text-[14px] font-medium text-[#8a8e91] line-through whitespace-nowrap">
                          {opt.price}
                        </span>
                        <span className="font-rajdhani text-[14px] font-bold text-[#3f9633] tracking-[0.3px] whitespace-nowrap">
                          Free
                        </span>
                      </div>
                    ) : (
                      <span className="font-rajdhani text-[14px] font-semibold text-[#242424] tracking-[0.3px] whitespace-nowrap">
                        {opt.price}
                      </span>
                    )}
                  </div>

                  {/* Show description details ONLY when selected */}
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-rajdhani text-[14px] text-[#68727d] leading-[20px] mt-[2px] block overflow-hidden"
                      >
                        {opt.desc}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free Shipping Note separated from border container */}
      <div className="flex items-start gap-[6px] px-[2px]">
        <svg
          className="w-[14px] h-[14px] text-[#308026] shrink-0 mt-[2px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z"
          />
        </svg>
        <p className="font-rajdhani text-[13px] leading-[18px] text-[#68727d]">
          Shipping free for orders above{' '}
          <span className="font-semibold text-[#308026]">NPR {freeThreshold.toLocaleString()}</span> (applied to items not on offer & no coupons applied)
        </p>
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;

