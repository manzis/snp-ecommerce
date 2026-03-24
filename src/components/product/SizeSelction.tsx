'use client';

import React, { useState } from 'react';

const sizes = ['1kg', '2kg', '3kg'];

const SizeSelection: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<string>('1kg');

  return (
    <section className="relative flex flex-col items-start gap-[16px] w-full h-[79px]">
      {/* 
          HEADER: Selected Size
          - tracking-[-0.02em]: Exact Figma Token
          - leading-[18px]: Matching box height for 1:1 verticality
      */}
      <h3 className="w-[135px] h-[18px] whitespace-nowrap text-left font-titillium text-[18px] font-semibold tracking-[-0.02em] text-[#242424] leading-[18px]">
        Selected Size : <span className="font-normal">{selectedSize}</span>
      </h3>

      {/* 
          FRAME 12: Buttons Row
          - pt-[2px] buffer to prevent 'Outside Border' clipping
      */}
      <div className="flex w-[222px] h-[45px] flex-row items-start gap-[12px] pt-[2px] px-[2px]">
        {sizes.map((size) => {
          const isActive = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              /* 
              */
              className={`
                group relative flex h-[45px] w-[66px] flex-shrink-0 flex-col items-center justify-center rounded-[6px] transition-all duration-100 ease-in
                outline-[1.5px] outline-offset-0
                ${isActive 
                  ? 'bg-[#000000] outline-[#242424]' 
                  : 'bg-[#FFFFFF] outline-[#E9E9E9]'}
              `}
            >
              {/* 
                  FRAME 17: Inner Content Wrapper
                  - padding: 10px
                  - height: 38px (internal)
              */}
              <div className="flex h-[38px] w-[66px] flex-row items-center justify-center p-[10px] gap-[10px]">
                <span 
                  className={`
                    whitespace-nowrap text-center font-titillium text-[18px] font-semibold leading-[18px] tracking-[-0.02em] transition-colors duration-200
                    ${isActive ? 'text-[#FFFFFF]' : 'text-[#000000]'}
                  `}
                >
                  {size}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SizeSelection;