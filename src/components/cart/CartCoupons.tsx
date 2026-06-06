'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscountIcon from '@/components/icons/DiscountIcon';
import CouponAppliedIcon from '@/components/icons/DiscountIcon2';
import StarIcon from '@/components/icons/StarIcon';
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
  const [shakeCount, setShakeCount] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [lastDiscount, setLastDiscount] = useState(coupon ? getCouponDiscount() : 0);


  const isApplied = !!coupon;
  const currentDiscount = getCouponDiscount();

  // Sync internal input with global state when it changes (e.g. removed elsewhere)
  React.useEffect(() => {
    setInputValue(coupon?.code || '');
    if (!coupon) setLastDiscount(0);
    else setLastDiscount(getCouponDiscount());
  }, [coupon, getCouponDiscount]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);


  return (
    <section className="main-container relative mx-auto flex w-full max-w-[410px] flex-col gap-[16px] overflow-hidden bg-white px-[12px] pb-[24px] py-[16px] lg:max-w-none">

      {/* Confetti Effect: Optimized with simple motion divs */}
      <AnimatePresence>
        {showSparkles && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 180, y: 60 }}
            animate={{
              scale: [0, 1.2, 0],
              x: 180 + (Math.random() * 100 - 50),
              y: -20 - (Math.random() * 50)
            }}
            transition={{ duration: 1, ease: "circOut" }}
            className="absolute z-50 text-[#FFE900]"
          >
            <StarIcon className="h-4 w-4 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex items-center px-[12px]">
        <h2 className="font-rajdhani text-[18px] font-semibold tracking-[-0.4px] text-[#242424]">
          Coupons and Discounts
        </h2>
      </div>

      <div className="flex w-full flex-col gap-[8px]">
        <div className="px-[12px]">
          <motion.div
            key={shakeCount}
            animate={shakeCount > 0 ? { x: [0, -10, 10, -7, 7, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex items-center justify-between rounded-[12px] border-[1px] p-[12px] transition-all duration-300 ${isApplied
              ? 'border-[#308026]'
              : errorMessage
                ? 'border-[#e11717]'
                : 'border-transparent'
              }`}
            style={{
              background: isApplied
                ? '#fafff3'
                : errorMessage
                  ? '#fff5f5'
                  : `linear-gradient(257.95deg, #fafff3, #ffffff) padding-box, 
                       linear-gradient(30deg, #3F9733 10%, #8aaf85 30%, #E8F3E4 80%, #E8F3E4 100%) border-box`
            }}
          >
            <div className="flex flex-1 items-center gap-[8px]">
              <DiscountIcon
                className={`h-[22px] w-[22px] transition-colors duration-200 ${isApplied ? 'text-[#308026]' : errorMessage ? 'text-[#e11717]' : 'text-[#68727d]'
                  }`}
              />
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); if (errorMessage) setErrorMessage(null); }}
                disabled={isApplied}
                className={`w-full bg-transparent font-rajdhani text-[16px] outline-none transition-all ${isApplied
                  ? 'font-bold uppercase tracking-[1.2px] text-[#308026]'
                  : errorMessage ? 'text-[#e11717]' : 'text-[#242424]'
                  }`}
              />
            </div>

            <button
              onClick={async () => {
                const trimmed = inputValue.trim().toUpperCase();
                if (!trimmed) {
                  setErrorMessage("Please enter a code");
                  setShakeCount(prev => prev + 1);
                  return;
                }

                setIsValidating(true);
                const result = await validateCoupon(trimmed, subtotal, items);

                if (result.isValid && result.coupon) {
                  setLastDiscount(result.discountAmount);
                  applyCoupon(result.coupon);
                  onApply(result.discountAmount, trimmed);
                  setShowSparkles(true);
                  setIsValidating(false);
                  setTimeout(() => setShowSparkles(false), 2000);
                } else {
                  setIsValidating(false);
                  setErrorMessage(result.message || "Invalid Coupon Code");
                  setShakeCount(prev => prev + 1);
                }
              }}

              disabled={isApplied || isValidating}
              className={`font-rajdhani text-[14px] font-semibold tracking-[-0.2px] transition-colors active:scale-95 ${isApplied ? 'text-[#3F9733]' : errorMessage ? 'text-[#e11717]' : 'text-[#308026]'
                }`}
            >
              <AnimatePresence mode="wait">
                {isValidating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex justify-center items-center py-1"
                  >
                    <div className="w-[18px] h-[18px] border-[2px] border-[#308026]/30 border-t-[#308026] rounded-full animate-spin" />
                  </motion.div>
                ) : isApplied ? (
                  <motion.span
                    key="applied"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1"
                  >
                    Applied
                  </motion.span>
                ) : (
                  <motion.span
                    key="apply"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    Apply
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          <AnimatePresence>
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 px-1 font-rajdhani text-[12px] font-medium text-[#e11717]"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {isApplied && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center justify-between px-[12px] pt-1 overflow-hidden"
              aria-live="polite"
            >
              <div className="flex items-center gap-[6px]">
                <CouponAppliedIcon className="h-[15px] w-[15px] text-[#3F9733]" />
                <p className="font-rajdhani text-[16px] text-[#242424]">
                  Rs {lastDiscount || currentDiscount} Saved with <span className="font-semibold uppercase tracking-[0.5px]">“{coupon?.code}”</span>
                </p>
              </div>
              <button
                onClick={() => {
                  removeCoupon();
                  onApply(0, '');
                  setLastDiscount(0);
                }}
                className="font-rajdhani text-[13px] text-[#8b8e92] underline underline-offset-2 hover:text-[#242424] transition-colors"
              >
                Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default CartCoupons;
