'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const flavours = [
  { id: 1, name: 'Vanilla', img: '/images/vanilla.jpg' },
  { id: 2, name: 'Cream Chocolate Chip', img: '/images/chocolate.jpg' },
  { id: 4, name: 'Magnesium', img: '/images/magnesium.jpg' },
  { id: 6, name: 'Fish Oil', img: '/images/fishoil.jpg' },
];

const FlavourSelection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="relative flex flex-col items-start gap-[15px] w-full">
      {/* 
          ANIMATION SYSTEM 
          - marquee-scroll: Hardware-accelerated name reveal
          - selected-gradient: Figma-exact background
          - marquee-mask: Premium edge fading for text overflow
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-continuous {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll 6s linear infinite;
        }
        .marquee-mask {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .selected-gradient {
          background: linear-gradient(0.28deg, #FFFEF4 0.22%, #EDFFE8 99.74%);
        }
      `}} />

      {/* Header: Dynamic text based on selection */}
      <h3 className="whitespace-nowrap text-left font-titillium text-[18px] font-semibold tracking-[-0.36px] text-[#242424]">
        Selected Flavour : <span className="font-normal">{flavours.find(f => f.id === selectedId)?.name || 'Unflavoured'}</span>
      </h3>
      
      {/* 
          SCROLL CONTAINER 
          - pt-[2px] buffer to prevent 'Outside Border' clipping
          - no-scrollbar for clean prototype feel
      */}
      <div className="flex w-full flex-nowrap gap-[14px] overflow-x-auto pt-[2px] pb-[6px] px-[2px] no-scrollbar">
        {flavours.map((item) => {
          const isSelected = selectedId === item.id;
          const isLong = item.name.length > 10;
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              /* 
                 FRAME 8: MAIN CARD
                 - Locked at 85px x 105px
                 - outline: Figma 'Outside' stroke logic
                 - Smart Animate: 200ms ease-in
              */
              className={`
                group relative flex h-[105px] w-[85px] flex-shrink-0 flex-col items-center justify-between rounded-[6px] transition-all duration-200 ease-in
                outline-[1.5px] outline-offset-0
                ${isSelected 
                  ? 'outline-[#1D1D1D] p-[2px] selected-gradient' 
                  : 'outline-[#E8E8E8] bg-[#FFFFFF] p-[4px]'}
              `}
            >
              {/* 
                  FRAME 11: IMAGE WRAPPER
                  - Expands 77px -> 81px on selection due to padding reduction
              */}
              <div className={`
                relative flex flex-col items-start gap-[10px] py-[4px] transition-all duration-200 ease-in
                ${isSelected ? 'w-[81px] h-[75px]' : 'w-[77px] h-[71px]'}
              `}>
                <div className={`relative w-full flex-grow transition-all duration-200 ease-in ${isSelected ? 'h-[67px]' : 'h-[63px]'}`}>
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    className="object-contain"
                    sizes="81px"
                    priority={item.id === 1}
                  />
                </div>
              </div>

            
              <div className={`
                relative flex h-[26px] flex-shrink-0 items-center justify-center overflow-hidden transition-all duration-200 ease-in
                ${isSelected 
                  ? 'w-[81px] bg-[#3F9733] rounded-[5px]' 
                  : 'w-[77px] bg-[#EFEFEF] rounded-[3px]'}
              `}>
                <div className={`relative w-full overflow-hidden ${isLong ? 'marquee-mask' : ''}`}>
                  <div className={isLong ? 'animate-marquee-continuous' : 'w-full text-center'}>
                    {/* TEXT: #242424 -> #FFFFFF | tracking: -0.06em */}
                    <span className={`
                      px-[2px] font-titillium text-[16px] font-semibold leading-[16px] tracking-[-0.06em] transition-colors duration-200
                      ${isSelected ? 'text-[#FFFFFF]' : 'text-[#242424]'}
                    `}>
                      {item.name}
                    </span>
                    {isLong && (
                      <span className={`
                        pr-10 font-titillium text-[16px] font-semibold leading-[16px] tracking-[-0.06em]
                        ${isSelected ? 'text-[#FFFFFF]' : 'text-[#242424]'}
                      `}>
                        {item.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FlavourSelection;