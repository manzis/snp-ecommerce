'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoIcon from '@/components/icons/PriceInfoIcon';

interface CartCheckoutBarProps {
  totalAmount: string;
  mrpAmount: string;
  onCheckout: () => void;
  isStatic?: boolean; // Prop to toggle between fixed (mobile) and static (desktop)
}

const CartCheckoutBar: React.FC<CartCheckoutBarProps> = ({ 
  totalAmount, 
  mrpAmount, 
  onCheckout,
  isStatic = false
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isStatic) return; // Don't run scroll logic if static

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isAtBottom = (scrollY + windowHeight) >= (documentHeight - 150);
      setIsVisible(!isAtBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStatic]);

  // The base UI content shared between both versions
  const Content = (
    <div className="mx-auto flex h-full w-full max-w-[410px] lg:max-w-[1280px] flex-row pt-[10px] lg:pb-[8px] lg:pr-[8px] ">
      {/* LEFT SECTION: Price Info */}
      <div className="flex flex-1 basis-0  h-full items-center bg-white px-[24px]  ">
        <div className="flex items-start gap-[10px]">
          <div className="flex flex-col">
            <span className="font-titillium text-[13px] text-[#4d4d4d] leading-[19px] line-through">
              {mrpAmount}
            </span>
            <span className="font-custom text-[20px] text-[#4d4d4d] leading-[22px]">
              {totalAmount}
            </span>
          </div>
          <div className="mt-[4px]">
            <InfoIcon className="h-[18px] w-[18px] text-[#4d4d4d]" />
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Checkout Button */}
      <div className="flex flex-1 basis-0 h-full items-start justify-center bg-white px-[16px] lg:bg-transparent lg:pr-0">
        <button 
          onClick={onCheckout}
          className="w-full h-[60px] flex items-center justify-center bg-[#ffe900] active:bg-[#f5e000] rounded-[12px] transition-all outline-none border-none shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-[0.98]"
        >
          <span className="font-custom text-[18px] text-[#1e1e1e] uppercase tracking-[0.2px]">
            Checkout
          </span>
        </button>
      </div>
    </div>
  );

  if (isStatic) {
    return (
      <div className="relative w-full h-[72px] bg-[#fcfff8] border border-[#f1f5f9] rounded-[12px] overflow-hidden ">
        {Content}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cart-checkout-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          className="fixed bottom-0 left-0 right-0 z-50 h-[80px] bg-[#fcfff8] border-t border-[#f1f5f9] lg:hidden shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)] "
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          {Content}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartCheckoutBar;