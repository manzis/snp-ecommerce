"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ProductCTA - Final Stable Version
 */
const ProductCTA = ({ stockStatus, isPreview = false }: { stockStatus?: string, isPreview?: boolean }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const isOutOfStock = stockStatus === 'out_of_stock';

  useEffect(() => {
    if (isPreview) {
      setIsVisible(true);
      return;
    }

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
  }, [isPreview]);

  useEffect(() => {
    const handleSuccess = () => setIsInCart(true);
    window.addEventListener('addToCartSuccess', handleSuccess);
    return () => window.removeEventListener('addToCartSuccess', handleSuccess);
  }, []);

  // Buy Now: listen for cart add success triggered by Buy Now path, then redirect
  useEffect(() => {
    const handleBuyNowSuccess = () => {
      router.push('/cart');
    };
    window.addEventListener('buyNowCartSuccess', handleBuyNowSuccess);
    return () => window.removeEventListener('buyNowCartSuccess', handleBuyNowSuccess);
  }, [router]);

  const handleAddToCart = () => {
    if (!isInCart) {
      window.dispatchEvent(new CustomEvent('requestAddToCart'));
    } else {
      router.push('/cart');
    }
  };

  const handleBuyNow = () => {
    // Dispatch buy now — ProductOptions handles validation + add, then fires buyNowCartSuccess
    window.dispatchEvent(new CustomEvent('requestBuyNow'));
  };

  const blurButton = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.footer
          key="product-cta-bar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          className="fixed bottom-0 left-0 right-0 w-full z-[100] bg-[#fcfff8] shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)] lg:hidden"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          <div className="relative mx-auto flex h-[72px] w-full max-w-[410px] items-center justify-between overflow-hidden flex-nowrap md:max-w-7xl">
            {/* Add to Cart / Go to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              onPointerUp={blurButton}
              disabled={isOutOfStock}
              className={`relative flex h-full basis-0 flex-grow shrink-0 items-center justify-center gap-[10px] px-[10px] py-[10px] outline-none transition-colors duration-200 ${isOutOfStock ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-[#ffffff] active:bg-[#f2f3f5]'}`}
            >
              <span className="relative z-[1] h-[15px] shrink-0 font-custom text-[16px] font-[400] leading-[14.592px] text-[#4d4d4d] whitespace-nowrap">
                {isOutOfStock ? "Out of Stock" : (isInCart ? "Go to cart" : "Add to cart")}
              </span>
            </button>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              onPointerUp={blurButton}
              disabled={isOutOfStock}
              className={`relative flex h-full basis-0 flex-grow shrink-0 items-center justify-center gap-[10px] px-[10px] py-[10px] z-[2] outline-none transition-colors duration-200 ${isOutOfStock ? 'bg-gray-200 cursor-not-allowed opacity-60' : 'bg-[#ffe900] active:bg-[#e6d200]'}`}
            >
              <span className="relative z-[3] h-[15px] shrink-0 font-custom text-[16px] font-[400] leading-[14.592px] text-[#1e1e1e] whitespace-nowrap">
                {isOutOfStock ? "Unavailable" : "Buy Now"}
              </span>
            </button>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
};

export default ProductCTA;