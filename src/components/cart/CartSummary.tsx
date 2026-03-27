'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';

interface CartSummaryProps {
  mrp: number;
  subtotal: number; // Price after item-level discount
  discount: number; // Additional coupon discount
  appliedCode?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  mrp, 
  subtotal, 
  discount, 
  appliedCode 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // LOGIC CALCULATIONS
  const itemDiscount = mrp - subtotal;
  const totalDiscount = itemDiscount + discount;
  const finalPrice = subtotal - discount;

  return (
    <section className="flex w-full flex-col bg-white mt-[12px]">
      <div className="flex flex-col border-t border-[#f1f5f9]">
        {/* MRP */}
        <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#f1f5f9]">
          <span className="font-titillium text-[16px] text-[#242424]">MRP</span>
          <span className="font-titillium text-[16px] text-[#242424] text-right">
            NPR {mrp.toLocaleString()}
          </span>
        </div>

        {/* DISCOUNTS ACTION AREA */}
        <div 
          className="flex flex-col cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#f1f5f9]">
            <div className="flex items-center gap-[4px]">
              <span className="font-titillium text-[16px] text-[#242424]">Discounts</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <DropDownIcon className="h-[16px] w-[16px] text-[#242424]" />
              </motion.div>
            </div>
            <span className="font-titillium text-[16px] text-[#242424] text-right">
              - NPR {totalDiscount.toLocaleString()}
            </span>
          </div>

          {/* DYNAMIC BREAKDOWN LOGIC */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-[#f1f5f9]"
              >
                <div className="flex flex-col gap-[12px] px-[24px] py-[16px]">
                  <div className="flex justify-between items-center">
                    <span className="font-titillium text-[14px] text-[#242424] opacity-60">Item Discount</span>
                    <span className="font-titillium text-[14px] text-[#242424]">- NPR {itemDiscount.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-[4px]">
                        <span className="font-titillium text-[14px] text-[#242424] opacity-60">Coupon Discount</span>
                        {appliedCode && (
                          <span className="font-titillium text-[14px] font-semibold text-[#242424]">({appliedCode})</span>
                        )}
                      </div>
                      <span className="font-titillium text-[14px] text-[#242424]">- NPR {discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SUBTOTAL */}
        <div className="flex justify-between items-center px-[24px] py-[18px]">
          <span className="font-titillium text-[16px] font-semibold text-[#242424]">Sub Total Amount</span>
          <span className="font-titillium text-[18px]  font-bold text-[#242424]">
            NPR {finalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* SAVINGS HIGHLIGHT */}
      <div className="px-[24px] pb-[16px]">
        <div className="flex items-center justify-center rounded-[12px] bg-[#eaffcc] py-[14px]">
          <span className="font-titillium text-[16px] tracking-[-0.64px] text-[#242424]">
            You will save NPR {totalDiscount.toLocaleString()} on this order
          </span>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="px-[24px] pb-[16px]">
        <p className="font-titillium text-[14px] text-[#8b8e92] leading-[20px] tracking-[-0.56px]">
          Note:     Additional Charges such as shipping Fees are calculated at Checkout
        </p>
      </div>
    </section>
  );
};

export default CartSummary;