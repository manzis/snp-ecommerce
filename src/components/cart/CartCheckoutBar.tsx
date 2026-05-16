'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoIcon from '@/components/icons/PriceInfoIcon';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface CartCheckoutBarProps {
  totalAmount: string;
  mrpAmount: string;
  onCheckout: () => void;
  isStatic?: boolean;
  buttonText?: string;
}

const CartCheckoutBar: React.FC<CartCheckoutBarProps> = ({
  totalAmount,
  mrpAmount,
  onCheckout,
  isStatic = false,
  buttonText = "Checkout"
}) => {
  // FIXED: Moved the hook call inside the component body
  const { openLogin } = useAuthModal();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (pathname !== '/checkout') {
      router.prefetch('/checkout');
    }
  }, [router, pathname]);

  const handleAction = () => {
    if (user) {
      if (pathname !== '/checkout') {
        setIsNavigating(true);
      }
      if (onCheckout) onCheckout();
      
      if (pathname !== '/checkout') {
        router.push('/checkout');
      }
    } else {
      // Open login modal with a callback that auto-navigates to checkout after login
      openLogin(() => {
        if (onCheckout) onCheckout();
        router.push('/checkout');
      });
    }
  };

  const Content = (
    <div className="mx-auto flex h-full w-full max-w-[410px] lg:max-w-[1280px] flex-row pt-[10px] lg:pt-0 lg:items-center">
      {/* LEFT SECTION: Price Info */}
      <div className="flex flex-1 basis-0 h-full items-center bg-white px-[24px]">
        <div className="flex items-start gap-[10px]">
          <div className="flex flex-col">
            <span className="font-titillium text-[13px] text-[#4d4d4d] leading-[19px] line-through">
              {mrpAmount}
            </span>
            <div className="flex items-center font-custom text-[20px] text-[#242424] leading-[22px]">
              <span className="mr-1">Rs.</span>
              {totalAmount.replace(/NPR\s?|Rs\.?\s?/ig, '').split('').map((char, index) => (
                <div key={index} className="relative overflow-hidden h-[22px] min-w-[11px] flex justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={char + index}
                      initial={{ y: 22, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -22, opacity: 0 }}
                      transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                    >
                      {char}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-[4px]">
            <InfoIcon className="h-[18px] w-[18px] text-[#4d4d4d]" />
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Action Button */}
      <div className="flex flex-1 basis-0 h-full items-start lg:items-center justify-center bg-white px-[16px] lg:bg-transparent lg:pr-0">
        <button
          onClick={handleAction}
          disabled={isNavigating || buttonText === 'Processing...'}
          className={`w-full h-[60px] lg:h-[52px] flex items-center justify-center rounded-[12px] transition-all outline-none border-none shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-[0.98] ${buttonText === 'Processing...' || isNavigating
            ? 'bg-[#3f9633] text-white' 
            : 'bg-[#ffe900] active:bg-[#f5e000] text-[#1e1e1e]'
          }`}
        >
          {isNavigating ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="font-custom text-[18px] uppercase tracking-[0.2px] text-white">
                Preparing...
              </span>
            </div>
          ) : (
            <span className={`font-custom text-[18px] uppercase tracking-[0.2px] ${buttonText === 'Processing...' ? 'text-white' : 'text-[#1e1e1e]'}`}>
              {buttonText}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  if (isStatic) {
    return (
      <div className="relative w-full h-[72px] bg-[#fcfff8] border border-[#f1f5f9] rounded-[12px] overflow-hidden">
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
          transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 h-[80px] bg-[#fcfff8] border-t border-[#f1f5f9] lg:hidden shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)]"
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
