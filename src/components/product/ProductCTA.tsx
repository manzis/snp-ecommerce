"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/ToastProvider';
import { useCart } from '@/context/CartContext';

/**
 * ProductCTA - Final Stable Version
 */
const ProductCTA = () => {
  const [isInCart, setIsInCart] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far the user has scrolled
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Detect if user is near the bottom (Footer zone)
      // 150px is a safe threshold to start hiding before the footer fully appears
      const isAtBottom = (scrollY + windowHeight) >= (documentHeight - 150);

      if (isAtBottom) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!isInCart) {
      addToCart();
      showToast("Successfully Added to Cart", "success");
      setIsInCart(true);
    } else {
      router.push('/cart');
    }
  };

  const blurButton = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.footer
          key="product-cta-bar"
          /* Premium Slide Animation */
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            mass: 0.8
          }}
          className="fixed bottom-0 left-0 right-0 w-full z-[100] bg-[#fcfff8] shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)] lg:hidden"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            position: 'fixed',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          <div className="relative mx-auto flex h-[72px] w-full max-w-[410px] items-center justify-between overflow-hidden flex-nowrap md:max-w-7xl">
            {/* Add to Cart / Go to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              onPointerUp={blurButton}
              className="relative flex h-full basis-0 flex-grow shrink-0 items-center justify-center gap-[10px] bg-[#ffffff] px-[10px] py-[10px] outline-none transition-colors duration-200 active:bg-[#f2f3f5]"
            >
              <span className="relative z-[1] h-[15px] shrink-0 font-custom text-[16px] font-[400] leading-[14.592px] text-[#4d4d4d] whitespace-nowrap">
                {isInCart ? "Go to cart" : "Add to cart"}
              </span>
            </button>

            {/* Buy Now */}
            <button
              type="button"
              onPointerUp={blurButton}
              className="relative flex h-full basis-0 flex-grow shrink-0 items-center justify-center gap-[10px] bg-[#ffe900] px-[10px] py-[10px] z-[2] outline-none transition-colors duration-200 active:bg-[#e6d200]"
            >
              <span className="relative z-[3] h-[15px] shrink-0 font-custom text-[16px] font-[400] leading-[14.592px] text-[#1e1e1e] whitespace-nowrap">
                Buy Now
              </span>
            </button>
          </div>
        </motion.footer>
      )}
    </AnimatePresence>
  );
};

export default ProductCTA;