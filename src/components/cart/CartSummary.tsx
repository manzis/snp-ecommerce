'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import DropDownIcon from '@/components/icons/DropDownIcon';

interface CartSummaryProps { }

const CartSummary: React.FC<CartSummaryProps> = () => {
  const { items, coupon, getCouponDiscount } = useCartStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const subtotal = useMemo(() =>
    items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
    [items]);

  const totalMRP = useMemo(() =>
    items.reduce((acc, item) => acc + ((item.mrp || item.price) * item.quantity), 0),
    [items]);

  const itemDiscount = totalMRP - subtotal;
  const couponDiscount = getCouponDiscount();
  const totalDiscount = itemDiscount + couponDiscount;
  const finalPrice = subtotal - couponDiscount;

  return (
    <section className="flex w-full flex-col bg-white mt-[12px]">
      <div className="flex flex-col border-t border-[#f1f5f9]">
        {/* MRP */}
        <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#f1f5f9]">
          <span className="font-titillium text-[16px] text-[#242424]">MRP</span>
          <span className="font-titillium text-[16px] text-[#242424] text-right">
            Rs. {totalMRP.toLocaleString()}
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
              - Rs. {totalDiscount.toLocaleString()}
            </span>
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden bg-[#fafafa]"
              >
                <div className="flex flex-col px-[24px] py-[16px] gap-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="font-titillium text-[15px] text-[#242424] opacity-60">Discount on MRP</span>
                    <span className="font-titillium text-[15px] font-medium text-[#308026]">
                      - Rs. {itemDiscount.toLocaleString()}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-[6px]">
                        <span className="font-titillium text-[15px] text-[#242424] opacity-60">Coupon Discount</span>
                        <span className="px-[6px] py-[1px] bg-[#e8f3e4] text-[#308026] text-[10px] font-bold rounded-sm uppercase tracking-wider">
                          {coupon?.code}
                        </span>
                      </div>
                      <span className="font-titillium text-[15px] font-medium text-[#308026]">
                        - Rs. {couponDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-titillium text-[15px] text-[#242424] opacity-60">Delivery Charges</span>
                    <span className="font-titillium text-[15px] font-medium text-[#308026]">FREE</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtotal Banner */}
          <div className="flex justify-between items-center px-[24px] py-[18px]">
            <span className="font-titillium text-[16px] font-semibold text-[#242424]"> Sub Total Amount</span>
            <span className="font-titillium text-[18px] font-bold text-[#242424]">
              Rs. {finalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* SAVINGS HIGHLIGHT */}
      <div className="px-[24px] pb-[16px]">
        <div className="flex items-center justify-center rounded-[12px] bg-[#eaffcc] py-[14px]">
          <span className="font-titillium text-[16px] tracking-[-0.64px] text-[#242424]">
            You will save Rs. {totalDiscount.toLocaleString()} on this order
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