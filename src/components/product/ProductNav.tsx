"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import BackIcon from '@/components/icons/BackIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import CartIcon from '@/components/icons/CartIcon';

export default function ProductNav() {
  const router = useRouter();

  const handleBack = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    router.back();
  };

  const handleBlur = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
  };

  return (
    <nav 
      aria-label="Top navigation" 
      className="flex w-full lg:max-w-[1280px] mx-auto min-w-0 px-[24px] py-[12px] gap-[12px] items-center self-stretch shrink-0 flex-nowrap bg-[#ffffff] relative overflow-hidden ]"
    >
      {/* Back Button */}
      <button 
        type="button"
        aria-label="Go back"
        onPointerUp={handleBack}
        className="flex w-[42px] h-[42px] p-[8px] justify-center items-center shrink-0 flex-nowrap bg-[#ffffff] rounded-[5px] border border-[#e8e8e8] relative shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] z-[1] outline-none transition-all duration-200 md:hover:bg-[#f2f3f5] "
      >
        <BackIcon className="w-[24px] h-[24px] shrink-0 relative z-[2] text-[#242424]" />
      </button>

      {/* Search Products Button */}
      <button
        type="button"
        aria-label="Search products"
        onPointerUp={handleBlur}
        className="flex flex-col justify-center items-center self-stretch flex-grow shrink-0 basis-0 flex-nowrap bg-[#ffffff] rounded-[6px] relative z-[3] outline-none transition-all duration-200 border border-transparent md:hover:bg-[#f2f3f5]  active:scale-[0.99] "
      >
        <div className="flex px-[12px] py-[10px] gap-[4px] items-center self-stretch shrink-0 flex-nowrap relative z-[4]">
          <SearchIcon className="w-[22px] h-[22px] shrink-0 relative z-[5] text-[#242424]" />
          <span 
            className="font-['Titillium_Web',sans-serif] text-[20px] font-[400] tracking-[-0.8px] bg-[linear-gradient(48.47deg,#bebebe,#020202)] bg-clip-text text-transparent whitespace-nowrap relative z-[6]"
          >
            Search products
          </span>
        </div>
      </button>

      {/* Cart Button */}
      <button 
        type="button"
        aria-label="View cart" 
        onPointerUp={handleBlur}
        className="flex w-[42px] h-[42px] p-[8px] flex-col justify-center items-center shrink-0 flex-nowrap relative z-[7] outline-none transition-all duration-200 rounded-[6px] md:hover:bg-[#f2f3f5] active:scale-98"
      >
        <div className="flex px-[1px] py-[2px] items-start shrink-0 relative z-[8]">
          <CartIcon className="w-[21.75px] h-[19.5px] shrink-0 relative z-[9] text-[#242424]" />
        </div>
      </button>
    </nav>
  );
}