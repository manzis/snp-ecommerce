'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscountIcon from '@/components/icons/DiscountIcon';
import GreenCheckIcon from '@/components/icons/DiscountIcon2';
import DropDownIcon from '@/components/icons/DropDownIcon';

interface CheckoutPriceHeaderProps {
  totalAmount: string;
  mrp: number;
  subtotal: number;
  couponDiscount: number;
  couponCode: string;
  shippingCharge: number;
  codCharge?: number;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

const CheckoutPriceHeader: React.FC<CheckoutPriceHeaderProps> = ({
  totalAmount,
  mrp,
  subtotal,
  couponDiscount,
  couponCode,
  shippingCharge,
  codCharge = 0,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [lastDiscount, setLastDiscount] = useState(couponDiscount);


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

  return (
    <div className="flex flex-col bg-white border-t border-[#f1f5f9] z-[1]">
      <div className="p-[12px_24px_24px_24px] flex flex-col gap-[10px]">

        {/* Expandable Total Amount Banner */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex justify-between items-center p-[12px] bg-[#eaffcc] rounded-[12px] z-[2] w-full outline-none active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-[8px]">
            <span className="font-titillium text-[18px] leading-[30px] text-[#242424] tracking-[-0.72px]">
              Total Amount
            </span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <DropDownIcon className="w-[16px] h-[16px] text-[#242424]" />
            </motion.div>
          </div>
          <span className="font-titillium text-[18px] font-semibold leading-[30px] text-[#242424] tracking-[-0.72px]">
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
              <div className="flex flex-col gap-[12px] py-[12px] px-[12px] border-b border-[#f1f5f9]">
                <div className="flex justify-between items-center">
                  <span className="font-titillium text-[14px] text-[#242424] opacity-60">MRP</span>
                  <span className="font-titillium text-[14px] text-[#242424]">NPR {mrp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-titillium text-[14px] text-[#242424] opacity-60">Item Discount</span>
                  <span className="font-titillium text-[14px] text-[#308026]">- NPR {(mrp - subtotal).toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-titillium text-[14px] text-[#242424] opacity-60">Coupon ({couponCode})</span>
                    <span className="font-titillium text-[14px] text-[#308026]">- NPR {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-titillium text-[14px] text-[#242424] opacity-60">Shipping</span>
                  <span className={`font-titillium text-[14px] font-semibold ${shippingCharge > 0 ? 'text-[#242424]' : 'text-[#308026]'}`}>
                    {shippingCharge > 0 ? `+ NPR ${shippingCharge.toLocaleString()}` : 'FREE'}
                  </span>
                </div>
                {codCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-titillium text-[14px] text-[#242424] opacity-60">COD Handling Fee</span>
                    <span className="font-titillium text-[14px] text-[#242424]">
                      + NPR {codCharge.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupon Section */}
        <div className="flex flex-col gap-[10px]">
          {isApplied ? (
            <>
              <div
                className="flex justify-between items-center p-[12px] rounded-[12px] border-[1px] border-transparent transition-all duration-300"
                style={{
                  background: `linear-gradient(257.95deg, #fafff3, #fafff3) padding-box, 
                                 linear-gradient(30deg, #3F9733 10%, #8aaf85 30%, #E8F3E4 80%, #E8F3E4 100%) border-box`
                }}
              >
                <div className="flex items-center gap-[8px]">
                  <DiscountIcon className="w-[22px] h-[22px] text-[#308026]" />
                  <span className="font-titillium text-[16px] font-bold uppercase tracking-[0.5px] text-[#308026]">
                    {couponCode} Applied
                  </span>
                </div>
                <button
                  onClick={onRemoveCoupon}
                  className="font-titillium text-[14px] font-regular text-[#8b8e92] underline hover:text-[#242424] transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Savings Summary Line */}
              <div className="flex gap-[10px] justify-center items-center">
                <GreenCheckIcon className="w-[18px] h-[18px] text-[#308026]" />
                <div className="font-titillium text-[15px] leading-[24px] text-[#242424]">
                  Rs {lastDiscount || couponDiscount} Saved with Coupon
                  <span className="font-semibold uppercase ml-1 tracking-[0.3px]">“ {couponCode} “</span>
                </div>
              </div>
            </>
          ) : (
            <div
              className="relative flex items-center justify-between rounded-[12px] border-[1px] border-transparent p-[12px] transition-all duration-300"
              style={{
                background: `linear-gradient(257.95deg, #fafff3, #ffffff) padding-box, 
                               linear-gradient(30deg, #3F9733 10%, #8aaf85 30%, #E8F3E4 80%, #E8F3E4 100%) border-box`
              }}
            >
              <div className="flex items-center gap-[8px] flex-1">
                <DiscountIcon className="w-[22px] h-[22px] text-[#308026]" />
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full bg-transparent font-titillium text-[16px] text-[#242424] outline-none placeholder:text-[#] "
                />
              </div>
              <button
                onClick={handleApply}
                className="font-titillium text-[14px] font-semibold text-[#3F9733] pl-[12px] hover:text-[#347d2a] transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPriceHeader;