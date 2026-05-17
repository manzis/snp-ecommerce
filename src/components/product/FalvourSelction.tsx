'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import type { ProductFlavour } from '@/services/productService';
import { useProductSelectionStore } from '@/store/productSelectionStore';

interface FlavourSelectionProps {
  flavours: ProductFlavour[];
}

const FlavourSelection: React.FC<FlavourSelectionProps> = ({ flavours }) => {
  const { selectedFlavorId: selectedId, setFlavorId: setSelectedId, setActiveVariantImage, flavorError } = useProductSelectionStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-selection of default flavour intentionally removed to enforce explicit user selection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div id="flavour-section" className="relative flex flex-col items-start gap-[15px] w-full ">
      {/* 
          ANIMATION SYSTEM 
          - marquee-scroll: Hardware-accelerated name reveal
          - selected-gradient: Figma-exact background
          - marquee-mask: Premium edge fading for text overflow
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}} />

      {/* Header: Dynamic text based on selection */}
      <h3 className="whitespace-nowrap text-left font-titillium text-[18px] font-semibold tracking-[-0.36px] text-[#242424]">
        {selectedId || flavours.length === 0 ? 'Selected Flavour : ' : 'Select Flavour'} <span className="font-normal">{flavours.length === 0 ? 'No Flavour' : (flavours.find(f => f.id === selectedId)?.flavour_name || '')}</span>
      </h3>

      {/* 
          SCROLL CONTAINER 
          - pt-[2px] buffer to prevent 'Outside Border' clipping
          - custom-scrollbar for desktop scrolling support
      */}
      <div 
        ref={scrollRef}
        className="flex w-full flex-nowrap gap-[14px] overflow-x-auto pt-[2px] pb-[6px] px-[2px] custom-scrollbar"
      >
        {flavours.length === 0 ? (
          <button
            type="button"
            className="group relative flex h-[45px] px-[16px] min-w-[66px] flex-shrink-0 flex-col items-center justify-center rounded-[6px] transition-all duration-100 ease-in outline-[1.5px] outline-offset-0 bg-[#000000] outline-[#242424]"
          >
            <div className="flex h-[38px] flex-row items-center justify-center gap-[10px]">
              <span className="whitespace-nowrap text-center font-titillium text-[18px] font-semibold leading-[18px] tracking-[-0.02em] text-[#FFFFFF]">
                No Flavour
              </span>
            </div>
          </button>
        ) : flavours.map((item) => {
          const isSelected = selectedId === item.id;
          const isLong = item.flavour_name.length > 10;

          return (
            <button
              key={item.id}
              type="button"
              disabled={!item.is_available}
              onClick={() => {
                setSelectedId(item.id);
                if (item.image_url) {
                  setActiveVariantImage(item.image_url);
                }
              }}
              /* 
                 FRAME 8: MAIN CARD
                 - Locked at 85px x 105px
                 - outline: Figma 'Outside' stroke logic
                 - Smart Animate: 200ms ease-in
              */
              className={`
                group relative flex h-[105px] w-[85px] flex-shrink-0 flex-col items-center justify-between rounded-[6px] transition-all duration-200 ease-in
                outline-[1.5px] outline-offset-0 overflow-hidden
                ${!item.is_available ? 'opacity-60 cursor-not-allowed bg-[#FAFAFA]' : 'cursor-pointer'}
                ${isSelected
                  ? 'outline-[#1D1D1D] p-[2px] selected-gradient'
                  : 'outline-[#E8E8E8] bg-[#FFFFFF] p-[4px]'}
              `}
            >
              {!item.is_available && (
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center  ">
                  <span className=" bg-[#EFEFEF] w-full px-[6px] py-[3px] font-titillium text-[10px] font-semibold tracking-[-0.02em] text-[#242424] text-center ">
                    Not Available
                  </span>
                </div>
              )}
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
                    src={(item.image_url || '/images/protein.webp').trim()}
                    alt={item.flavour_name || 'flavour'}
                    fill
                    className="object-contain"
                    sizes="81px"
                    priority={false}
                  />
                </div>
              </div>


              <div className={`
                relative flex h-[26px] flex-shrink-0 items-center justify-center overflow-hidden transition-all duration-200 ease-in
                ${isSelected
                  ? 'w-[81px] bg-[#3F9733] rounded-[5px]'
                  : 'w-[81px] bg-[#EFEFEF] rounded-[3px]'}
              `}>
                <div className={`relative w-full overflow-hidden ${isLong ? 'marquee-mask' : ''}`}>
                  <div className={isLong ? 'animate-marquee-continuous' : 'w-full text-center'}>
                    {/* TEXT: #242424 -> #FFFFFF | tracking: -0.06em */}
                    <span className={`
                      px-[2px] font-titillium text-[16px] font-semibold leading-[16px] tracking-[-0.06em] transition-colors duration-200
                      ${isSelected ? 'text-[#FFFFFF]' : 'text-[#242424]'}
                    `}>
                      {item.flavour_name}
                    </span>
                    {isLong && (
                      <span className={`
                        pr-10 font-titillium text-[16px] font-semibold leading-[16px] tracking-[-0.06em]
                        ${isSelected ? 'text-[#FFFFFF]' : 'text-[#242424]'}
                      `}>
                        {item.flavour_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {flavorError && (
        <span data-error="true" className="text-[#FF3333] font-titillium text-[14px] font-semibold mt-[-8px]">
          Please select a flavour
        </span>
      )}
    </div>
  );
};

export default FlavourSelection;
