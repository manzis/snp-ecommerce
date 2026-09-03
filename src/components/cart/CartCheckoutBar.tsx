'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfoIcon from '@/components/icons/PriceInfoIcon';
import { useAuthModal } from '@/context/AuthModalContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

interface CartCheckoutBarProps {
  totalAmount: string;
  mrpAmount: string;
  onCheckout: () => void;
  isStatic?: boolean;
  buttonText?: string;
  onInfoClick?: () => void;
}

const CartCheckoutBar: React.FC<CartCheckoutBarProps> = ({
  totalAmount,
  mrpAmount,
  onCheckout,
  isStatic = false,
  buttonText = "Checkout",
  onInfoClick
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
      // Pre-warm the serverless function and database connection silently.
      // This eliminates the 1-3 second delay on the first "Checkout" click 
      // by ensuring the DB and JS chunks are already loaded/warm.
      useCartStore.getState().reverifyCartPrices().catch(() => {});
    }
  }, [router, pathname]);

  const handleAction = async () => {
    setIsNavigating(true);
    // Reverify prices & stock strictly before proceeding (bypassing throttle)
    await useCartStore.getState().reverifyCartPrices(true);
    setIsNavigating(false);

    if (onCheckout) {
      onCheckout();
      return;
    }

    if (pathname !== '/checkout') {
      router.push('/checkout');
    }
  };

  const Content = (
    <div className="mx-auto flex h-full w-full max-w-[410px] lg:max-w-[1280px] flex-row lg:items-center">
      {/* LEFT SECTION: Price Info */}
      <div className="flex flex-1 basis-0 h-full items-center bg-transparent px-[24px]">
        <div className="flex items-start gap-[10px]">
          <div className="flex flex-col">
            <span className="font-rajdhani text-[13px] text-[#4d4d4d] leading-[19px] line-through">
              {mrpAmount}
            </span>
            <div className="flex items-center font-rajdhani font-bold text-[22px] text-[#242424] leading-[24px]">
              <span className="mr-1">Rs.</span>
              {totalAmount.replace(/NPR\s?|Rs\.?\s?/ig, '').split('').map((char, index) => (
                <div key={index} className="relative overflow-hidden h-[24px] min-w-[12px] flex justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={char + index}
                      initial={{ y: 24, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -24, opacity: 0 }}
                      transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
                    >
                      {char}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onInfoClick}
            className="mt-[4px] cursor-pointer hover:bg-gray-100 p-1 -m-1 rounded-full transition-colors outline-none"
          >
            <InfoIcon className="h-[18px] w-[18px] text-[#4d4d4d]" />
          </button>
        </div>
      </div>

      {/* RIGHT SECTION: Action Button */}
      <div className="flex flex-1 basis-0 h-full items-center justify-center bg-transparent px-[16px]">
        <button
          onClick={handleAction}
          disabled={isNavigating || buttonText === 'Processing...'}
          className={`w-full h-[56px] lg:h-[52px] flex items-center justify-center rounded-[10px] transition-all outline-none border-none shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-[0.98] ${buttonText === 'Processing...' || isNavigating
            ? 'bg-[#3f9633] text-white'
            : 'bg-[#ffe900] active:bg-[#f5e000] text-[#1e1e1e]'
            }`}
        >
          {isNavigating ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="uppercase font-rajdhani font-bold text-[17px] tracking-[-0.015em] font-[500] leading-[17px] whitespace-nowrap text-white">
                Preparing...
              </span>
            </div>
          ) : (
            <span className={`uppercase font-rajdhani font-bold text-[17px] tracking-[-0.015em] font-[500] leading-[17px] whitespace-nowrap ${buttonText === 'Processing...' ? 'text-white' : 'text-[#1e1e1e]'}`}>
              {buttonText}
            </span>
          )}
        </button>
      </div>
    </div>
  );

  if (isStatic) {
    return (
      <div className="relative w-full h-[88px] bg-[#fcfff8] border border-[#f1f5f9] rounded-[10px] overflow-hidden">
        {Content}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none lg:hidden">
          <motion.div
            key="cart-checkout-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            className="pointer-events-auto relative w-full max-w-[410px] md:max-w-7xl bg-[#fcfff8] border-t border-[#f1f5f9] shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)]"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
              paddingTop: '10px',
            }}
          >
            {Content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartCheckoutBar;
