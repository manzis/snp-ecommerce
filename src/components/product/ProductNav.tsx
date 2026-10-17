"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackIcon from '@/components/icons/BackIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import CartIcon from '@/components/icons/CartIcon';
import PackageIcon2 from '@/components/icons/PackageIcon2';
import { useCart } from '@/context/CartContext';
import { useCartStore } from '@/store/cartStore';

/**
 * ProductNav component for the top navigation bar.
 * Redirects to the search page when the search bar is clicked.
 */
export default function ProductNav() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [isBumping, setIsBumping] = React.useState(false);

  React.useEffect(() => {
    const handleBump = () => {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 550);
    };
    window.addEventListener('cartBump', handleBump);
    return () => window.removeEventListener('cartBump', handleBump);
  }, []);

  const handleBack = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    router.back();
  };

  const handleHome = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    router.push('/');
  };

  const handleSearchRedirect = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    router.push('/search?autofocus=true');
  };

  const handleCart = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (window.innerWidth >= 1024) {
      useCartStore.getState().setCartOpen(true);
    } else {
      router.push('/cart');
    }
  };

  return (
    <nav
      aria-label="Top navigation"
      className="flex w-full lg:px-[60px] mx-auto min-w-0 px-[24px] py-[12px] gap-[12px] items-center self-stretch shrink-0 flex-nowrap bg-[#ffffff] relative overflow-hidden"
    >
      {/* Back Button */}
      <button
        type="button"
        aria-label="Go back"
        onPointerUp={handleBack}
        className="flex w-[42px] h-[42px] items-center shrink-0 flex-nowrap rounded-[5px]  relative  z-[1] outline-none transition-all duration-200 md:hover:bg-[#f2f3f5]"
      >
        <BackIcon className="w-[24px] h-[24px] shrink-0 relative z-[2] text-[#242424]" />
      </button>

      {/* Search Products Button (Triggers Redirect) */}
      <button
        type="button"
        aria-label="Search products"
        onPointerUp={handleSearchRedirect}
        className="flex flex-col justify-center items-center self-stretch flex-grow shrink-0 basis-0 flex-nowrap bg-[#F6F6F8] rounded-full relative z-[3] outline-none transition-all duration-200 hover:bg-[#EBEBEF] active:scale-[0.99] shadow-none"
      >
        <div className="flex px-[14px] py-[9px] gap-[8px] items-center self-stretch shrink-0 flex-nowrap relative z-[4]">
          <SearchIcon className="w-[20px] h-[20px] shrink-0 relative z-[5] text-[#8E8E93]" />
          <span
            className="inline-block pt-[2px] font-rajdhani text-[18px] leading-none font-[500] tracking-[-0.5px] text-[#71717A] whitespace-nowrap relative z-[6]"
          >
            Search products
          </span>
        </div>
      </button>

      <div className="flex items-center gap-[4px]">
        {/* Home Button */}
        <button
          type="button"
          aria-label="Go to home"
          onPointerUp={handleHome}
          className="flex w-[42px] h-[42px] p-[8px] flex-col justify-center items-center shrink-0 flex-nowrap relative z-[7] outline-none transition-all duration-200 rounded-[6px] md:hover:bg-[#f2f3f5] active:scale-[0.98]"
        >
          <PackageIcon2 className="w-[22px] h-[22px] shrink-0 relative z-[8] text-[#242424]" />
        </button>

        {/* Cart Button */}
        <button
          id="top-nav-cart-btn"
          type="button"
          aria-label="View cart"
          onPointerUp={handleCart}
          className={`flex w-[42px] h-[42px] p-[8px] flex-col justify-center items-center shrink-0 flex-nowrap relative z-[7] outline-none rounded-[6px] md:hover:bg-[#f2f3f5] active:scale-[0.98] transition-all duration-300 ${
            isBumping ? 'scale-125' : 'scale-100'
          }`}
        >
          {isBumping && (
            <span className="absolute inset-0 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" />
          )}
          <div className="flex px-[1px] py-[2px] items-start shrink-0 relative z-[8]">
            <CartIcon className={`w-[21.75px] h-[19.5px] shrink-0 relative z-[9] text-[#242424] transition-transform duration-300 ${isBumping ? 'rotate-[-10deg] scale-110' : ''}`} />
            {cartCount > 0 && (
              <div className={`absolute -right-[10px] -top-[8px] flex h-[18px] min-w-[18px] items-center justify-center rounded-[6px] border-[1.5px] border-white px-[5px] py-[2px] z-[10] transition-all duration-300 ${isBumping ? 'bg-emerald-600 scale-125' : 'bg-[#242424]'}`}>
                <span className="font-rajdhani text-[10px] font-medium leading-none text-white">
                  {cartCount}
                </span>
              </div>
            )}
          </div>
        </button>
      </div>
    </nav>
  );
}
