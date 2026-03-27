'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DiscountIcon from '@/components/icons/DiscountIcon';
import CouponAppliedIcon from '@/components/icons/DiscountIcon2';
import StarIcon from '@/components/icons/StarIcon';

interface CartCouponsProps {
  onApply: (discount: number, code: string) => void;
}

const CartCoupons: React.FC<CartCouponsProps> = ({ onApply }) => {
  const [code, setCode] = useState('');
  const [isApplied, setIsApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  const handleApply = useCallback(() => {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode || trimmedCode !== 'PREPAID') {
      setErrorMessage(trimmedCode ? "Invalid Coupon Code" : "Please enter a code");
      setShakeCount(prev => prev + 1);
      return;
    }

    setIsApplied(true);
    setErrorMessage(null);
    setShowSparkles(true);
    setCode(trimmedCode);
    onApply(100, trimmedCode);
    
    // Performance: Use a cleanup timer that doesn't block main thread
    const timer = setTimeout(() => setShowSparkles(false), 2000);
    return () => clearTimeout(timer);
  }, [code, onApply]);

  const handleRemove = () => {
    setIsApplied(false);
    setCode('');
    setErrorMessage(null);
    onApply(0, '');
  };

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
        <h2 className="font-titillium text-[18px] font-semibold tracking-[-0.72px] text-[#242424]">
          Coupons and Discounts
        </h2>
      </div>

      <div className="flex w-full flex-col gap-[8px]">
        <div className="px-[12px]">
        <motion.div 
            key={shakeCount}
            animate={shakeCount > 0 ? { x: [0, -10, 10, -7, 7, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`flex items-center justify-between rounded-[12px] border-[1px] p-[12px] transition-all duration-300 ${
              isApplied 
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
                className={`h-[18px] w-[18px] transition-colors duration-200 ${
                  isApplied ? 'text-[#308026]' : errorMessage ? 'text-[#e11717]' : 'text-[#68727d]'
                }`} 
              />
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={code}
                onChange={(e) => { setCode(e.target.value); if (errorMessage) setErrorMessage(null); }}
                disabled={isApplied}
                className={`w-full bg-transparent font-titillium text-[16px] outline-none transition-all ${
                  isApplied 
                    ? 'font-bold uppercase tracking-[1.2px] text-[#308026]' 
                    : errorMessage ? 'text-[#e11717]' : 'text-[#242424]'
                }`}
              />
            </div>

            <button
              onClick={handleApply}
              disabled={isApplied}
              className={`min-w-[60px] font-titillium text-[14px] font-semibold tracking-[-0.2px] transition-colors active:scale-95 ${
                isApplied ? 'text-[#3F9733]' : errorMessage ? 'text-[#e11717]' : 'text-[#308026]'
              }`}
            >
              <AnimatePresence mode="wait">
                {isApplied ? (
                  <motion.span key="applied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
                    Applied
                  </motion.span>
                ) : (
                  <motion.span key="apply" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                className="mt-1 px-1 font-titillium text-[12px] font-medium text-[#e11717]"
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isApplied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-[12px] pt-1"
              aria-live="polite"
            >
              <div className="flex items-center gap-[6px]">
                <CouponAppliedIcon className=" h-[15px] w-[15px] text-[#3F9733] "/>
                <p className="font-titillium text-[16px] text-[#242424]">
                  Rs 100 Saved with <span className="font-semibold uppercase tracking-[0.5px]">“{code}”</span>
                </p>
              </div>
              <button 
                onClick={handleRemove}
                className="font-titillium text-[13px] text-[#8b8e92] underline underline-offset-2 hover:text-[#242424] transition-colors"
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