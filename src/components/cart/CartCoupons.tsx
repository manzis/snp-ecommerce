'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '@/store/cartStore';
import { validateCoupon } from '@/services/couponService';

interface CartCouponsProps {
  onApply: (discount: number, code: string) => void;
}

const CartCoupons: React.FC<CartCouponsProps> = ({ onApply }) => {
  const { items, coupon, applyCoupon, removeCoupon, getCouponDiscount } = useCartStore();
  const [inputValue, setInputValue] = useState(coupon?.code || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastDiscount, setLastDiscount] = useState(coupon ? getCouponDiscount() : 0);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  const isApplied = !!coupon;
  const currentDiscount = getCouponDiscount();

  React.useEffect(() => {
    setInputValue(coupon?.code || '');
    if (!coupon) setLastDiscount(0);
    else setLastDiscount(getCouponDiscount());
  }, [coupon, getCouponDiscount]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleApplyCoupon = async () => {
    const trimmed = inputValue.trim().toUpperCase();
    if (!trimmed) {
      setErrorMessage("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);
    const result = await validateCoupon(trimmed, subtotal, items);

    if (result.isValid && result.coupon) {
      setLastDiscount(result.discountAmount);
      applyCoupon(result.coupon);
      onApply(result.discountAmount, trimmed);
      setIsValidating(false);

      // Trigger celebratory confetti burst on successful application
      try {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.65 },
          colors: ['#308026', '#eaffcc', '#ffea00', '#22c55e', '#f59e0b'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        // Fallback silently if canvas not supported
      }
    } else {
      setIsValidating(false);
      setErrorMessage(result.message || "Invalid or ineligible coupon code");
    }
  };

  return (
    <section className="w-full bg-[#edf6ec] rounded-[20px] shadow-none flex flex-col relative overflow-hidden transition-all">
      
      {/* Inner padded content for title and input (white section with bottom rounded corners) */}
      <div className="p-[18px] pb-4 flex flex-col gap-3.5 w-full bg-white rounded-b-[20px]">
        {/* Header Title */}
        <h2 className="font-rajdhani font-bold text-[19px] text-[#18181b] tracking-tight">
          Got a coupon?
        </h2>

        {/* Input Row matching reference UI */}
        <div className="flex flex-col gap-1.5 w-full">
          <motion.div
            animate={isApplied ? { scale: [1, 1.02, 0.99, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`w-full border-[1.5px] rounded-[12px] h-[50px] px-4 flex items-center justify-between transition-all ${
              isApplied
                ? 'bg-[#f2f9f1] border-[#308026]'
                : errorMessage
                ? 'bg-[#fef2f2] border-[#ef4444]'
                : 'bg-[#f7f8fa] border-transparent focus-within:bg-white focus-within:border-[#308026]'
            }`}
          >
            <input
              type="text"
              placeholder="Enter your coupon code here"
              value={isApplied ? (coupon?.code || inputValue) : inputValue}
              onChange={(e) => {
                setInputValue(e.target.value.toUpperCase());
                if (errorMessage) setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isApplied && inputValue.trim()) {
                  handleApplyCoupon();
                }
              }}
              disabled={isApplied || isValidating}
              className={`w-full bg-transparent font-rajdhani outline-none placeholder:text-[#a1a1aa] placeholder:font-semibold ${
                isApplied
                  ? 'font-bold text-[17px] text-[#308026] tracking-wider uppercase'
                  : 'font-semibold text-[16px] text-[#18181b]'
              }`}
            />

            {isApplied ? (
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  onApply(0, '');
                  setLastDiscount(0);
                  setInputValue('');
                }}
                className="font-rajdhani font-bold text-[14px] text-[#ef4444] hover:text-[#dc2626] uppercase tracking-wider shrink-0 transition-colors ml-2 cursor-pointer"
              >
                REMOVE
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!inputValue.trim() || isValidating}
                className={`font-rajdhani font-bold text-[14px] uppercase tracking-wider shrink-0 transition-colors ml-2 ${
                  inputValue.trim() && !isValidating
                    ? 'text-[#308026] hover:text-[#286e20] cursor-pointer'
                    : 'text-[#a1a1aa] cursor-not-allowed'
                }`}
              >
                {isValidating ? 'APPLYING...' : 'APPLY'}
              </button>
            )}
          </motion.div>

          {/* Status Feedback */}
          {errorMessage && (
            <p className="text-[13px] font-rajdhani font-medium text-[#ef4444] px-1">
              {errorMessage}
            </p>
          )}
          <AnimatePresence>
            {isApplied && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-[14px] font-rajdhani font-bold text-[#308026] px-1"
              >
                Rs. {lastDiscount || currentDiscount} saved with "{coupon?.code}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Available Coupons & Offers Clickable Row (Full Width edge-to-edge) */}
      <div className="flex flex-col w-full bg-[#edf6ec] rounded-b-[20px] px-[18px] py-3.5 transition-colors">
        <div
          onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
          className="flex items-center justify-between cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-[24px] h-[24px] rounded-full bg-[#308026] text-white flex items-center justify-center font-rajdhani font-bold text-[13px] shrink-0 shadow-none">
              %
            </div>
            <span className="font-rajdhani font-bold text-[15px] sm:text-[16px] text-[#18181b] group-hover:text-[#308026] transition-colors">
              View available coupons & offers
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-[#71717a] group-hover:text-[#18181b] transition-transform ${
              showAvailableCoupons ? 'rotate-90' : ''
            }`}
          />
        </div>

        {/* Expandable drawer for available coupons */}
        <AnimatePresence>
          {showAvailableCoupons && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-3 flex flex-col"
            >
              <div className="p-3.5 rounded-[12px] bg-white flex items-center justify-center text-center shadow-none">
                <span className="font-rajdhani font-semibold text-[14px] text-[#71717a]">
                  No offers and coupons currently available
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
};

export default CartCoupons;
