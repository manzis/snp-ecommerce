"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useVolatileProductData } from '@/hooks/useVolatileProductData';

/**
 * ProductCTA - Final Stable Version
 */
const ProductCTA = ({ productSlug, stockStatus: propsStockStatus, isPreview = false }: { productSlug?: string, stockStatus?: string, isPreview?: boolean }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const { volatileData } = useVolatileProductData(productSlug || '');
  
  const stockStatus = volatileData ? volatileData.stock_status : propsStockStatus;
  const isOutOfStock = stockStatus === 'out_of_stock';

  useEffect(() => {
    if (isPreview) {
      setIsVisible(true);
      return;
    }

    let active = true;

    const handleScroll = () => {
      if (!active) return;
      const scrollY = window.scrollY;

      // If user is at the top of the page, hide the bottom CTA
      if (scrollY < 100) {
        setIsVisible(false);
        return;
      }

      const inlineCta = document.getElementById('inline-cta-container');
      if (inlineCta) {
        const rect = inlineCta.getBoundingClientRect();
        // Show fixed CTA only if the inline CTA has scrolled completely out of view at the top
        const hasScrolledPast = rect.bottom < 0;
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const isAtBottom = (scrollY + windowHeight) >= (documentHeight - 150);

        setIsVisible(hasScrolledPast && !isAtBottom);
      } else {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        if (documentHeight <= windowHeight) {
          setIsVisible(false); // Hide on load if no scrolling needed
          return;
        }
        const isAtBottom = (scrollY + windowHeight) >= (documentHeight - 150);
        setIsVisible(!isAtBottom);
      }
    };

    // Delay attaching the scroll listener by 150ms.
    // This allows Next.js in production to complete the scroll-to-top transition
    // and let the product page layout height hydrate.
    const timer = setTimeout(() => {
      if (active) {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      }
    }, 150);

    // Guarantee the bottom CTA is hidden initially until user scrolls down
    setIsVisible(false);

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPreview]);

  useEffect(() => {
    const handleSuccess = () => setIsInCart(true);
    window.addEventListener('addToCartSuccess', handleSuccess);
    return () => window.removeEventListener('addToCartSuccess', handleSuccess);
  }, []);

  // Prefetch cart route for snappy Buy Now navigation
  useEffect(() => {
    router.prefetch('/cart');
  }, [router]);

  // Buy Now: wait for Zustand persist flush before navigating
  useEffect(() => {
    const handleBuyNowSuccess = async () => {
      // Allow Zustand persist middleware to flush to localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.innerWidth >= 1024) {
        useCartStore.getState().setCartOpen(true);
      } else {
        router.push('/cart');
      }
    };
    window.addEventListener('buyNowCartSuccess', handleBuyNowSuccess);
    return () => window.removeEventListener('buyNowCartSuccess', handleBuyNowSuccess);
  }, [router]);

  const handleAddToCart = () => {
    if (!isInCart) {
      window.dispatchEvent(new CustomEvent('requestAddToCart'));
    } else {
      if (window.innerWidth >= 1024) {
        useCartStore.getState().setCartOpen(true);
      } else {
        router.push('/cart');
      }
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
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center lg:hidden transition-all duration-300 ease-out ${isVisible ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}
      style={{
        transform: isVisible ? 'translateY(0) translateZ(0)' : 'translateY(100%) translateZ(0)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <footer
        className="pointer-events-auto relative flex w-full items-center justify-between px-[16px] gap-[12px] bg-[#ffffff] shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)] border-t border-[#f1f5f9]"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 9px)',
          paddingTop: '11px',
        }}
      >
        {/* Add to Cart / Go to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          onPointerUp={blurButton}
          disabled={isOutOfStock}
          className={`relative flex h-[56px] basis-0 flex-grow shrink-0 items-center justify-center gap-[10px] rounded-[10px] border border-[#e2e8f0] outline-none transition-colors duration-200 ${isOutOfStock ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-[#ffffff] active:bg-[#f2f3f5]'}`}
        >
          <span className="uppercase relative z-[1] h-[17px] shrink-0 font-rajdhani font-bold text-[17px] tracking-[-0.015em] font-[500] leading-[17px] text-[#4d4d4d] whitespace-nowrap">
            {isOutOfStock ? "Out of Stock" : (isInCart ? "Go to cart" : "Add to cart")}
          </span>
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={handleBuyNow}
          onPointerUp={blurButton}
          disabled={isOutOfStock}
          className={`relative flex h-[56px] basis-0 flex-grow shrink-0 items-center justify-center gap-[10px] rounded-[10px] z-[2] outline-none transition-colors duration-200 ${isOutOfStock ? 'bg-gray-200 cursor-not-allowed opacity-60' : 'bg-[#ffe900] active:bg-[#e6d200]'}`}
        >
          <span className="uppercase relative z-[3] h-[17px] shrink-0 font-rajdhani font-bold text-[17px] tracking-[-0.015em] font-[500] leading-[17px] text-[#1e1e1e] whitespace-nowrap">
            {isOutOfStock ? "Unavailable" : "Buy Now"}
          </span>
        </button>
      </footer>
    </div>
  );
};

export default ProductCTA;
