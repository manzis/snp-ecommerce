'use client';

import React, { useEffect } from 'react';
import type { ProductSize } from '@/services/productService';
import { useProductSelectionStore } from '@/store/productSelectionStore';

interface SizeSelectionProps {
  sizes: ProductSize[];
}

const SizeSelection: React.FC<SizeSelectionProps> = ({ sizes }) => {
  const { selectedSize, setSize: setSelectedSize, setActiveVariantImage, sizeError } = useProductSelectionStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [hasOverflow, setHasOverflow] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 4;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  const centerElement = React.useCallback((el: HTMLElement) => {
    const container = scrollRef.current;
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Scroll so the element is centered, giving maximum visibility to upcoming items on the right
    const scrollOffset = elRect.left - containerRect.left - (containerRect.width / 2) + (elRect.width / 2);

    container.scrollBy({
      left: scrollOffset,
      behavior: 'smooth',
    });
  }, []);

  const handleSlide = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(160, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Auto-selection of default size intentionally removed to enforce explicit user selection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(checkScroll);
      ro.observe(el);
    }

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      ro?.disconnect();
    };
  }, [checkScroll, sizes]);

  // Auto-scroll when selected size changes (e.g. initial select or auto-switched size)
  useEffect(() => {
    if (!selectedSize || !scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector<HTMLElement>(`[data-size-label="${selectedSize}"]`);
    if (activeBtn) {
      centerElement(activeBtn);
    }
  }, [selectedSize, centerElement]);

  return (
    <section id="size-section" className="relative flex flex-col items-start gap-[16px] w-full h-auto min-h-[79px] ">
      <style dangerouslySetInnerHTML={{
        __html: `
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

      {/* 
          HEADER: Selected Size + Slider Controls
          - tracking-[-0.02em]: Exact Figma Token
          - leading-[18px]: Matching box height for 1:1 verticality
      */}
      <div className="flex items-center justify-between w-full gap-2">
        <h3 className="h-[18px] whitespace-nowrap text-left font-rajdhani text-[18px] font-semibold tracking-[-0.02em] text-[#242424] leading-[18px]">
          {selectedSize ? `Selected Size: ` : 'Select Size'}{' '}
          <span className="font-medium text-[#515151]">
            {sizes.length === 0 ? 'One Size' : (selectedSize || '')}
          </span>
        </h3>

        {hasOverflow && sizes.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[12px] font-rajdhani font-semibold text-[#8E8E93] uppercase tracking-[0.04em] flex items-center gap-1">
              <span className="hidden sm:inline">{sizes.length} Sizes</span>
              <span className="inline sm:hidden">Slide &rarr;</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSlide('left')}
                disabled={!canScrollLeft}
                aria-label="Slide sizes left"
                className={`h-[26px] w-[26px] rounded-[6px] border flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? 'border-[#E8E8E8] bg-white text-[#242424] hover:border-[#1D1D1D] hover:bg-[#FAFAFA] active:scale-95 shadow-sm'
                    : 'border-[#F0F0F0] bg-[#FAFAFA] text-[#C0C0C0] opacity-40 cursor-not-allowed'
                }`}
              >
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleSlide('right')}
                disabled={!canScrollRight}
                aria-label="Slide sizes right"
                className={`h-[26px] w-[26px] rounded-[6px] border flex items-center justify-center transition-all ${
                  canScrollRight
                    ? 'border-[#E8E8E8] bg-white text-[#242424] hover:border-[#1D1D1D] hover:bg-[#FAFAFA] active:scale-95 shadow-sm'
                    : 'border-[#F0F0F0] bg-[#FAFAFA] text-[#C0C0C0] opacity-40 cursor-not-allowed'
                }`}
              >
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 
          FRAME 12: Buttons Row with Slider Arrows & Fade Overlays
          - pt-[2px] buffer to prevent 'Outside Border' clipping
      */}
      <div className="relative w-full group">
        {/* Left Arrow with Fade Gradient */}
        {hasOverflow && canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 pl-1 bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none transition-all duration-200">
            <button
              type="button"
              onClick={() => handleSlide('left')}
              aria-label="Previous sizes"
              className="pointer-events-auto h-[28px] w-[28px] rounded-full bg-white border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#242424] hover:bg-[#FAFAFA] hover:border-[#1D1D1D] hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        <div 
          ref={scrollRef}
          className="flex w-full flex-nowrap gap-[12px] overflow-x-auto overflow-y-hidden pt-[2px] pb-[6px] px-[2px] custom-scrollbar scroll-smooth"
        >
          {sizes.length === 0 ? (
            <button
              type="button"
              className="group relative flex h-[45px] px-[16px] min-w-[66px] flex-shrink-0 flex-col items-center justify-center rounded-[6px] transition-all duration-100 ease-in outline-[1.5px] outline-offset-0 bg-[#000000] outline-[#242424]"
            >
              <div className="flex h-[38px] flex-row items-center justify-center p-[10px] gap-[10px]">
                <span className="whitespace-nowrap text-center font-rajdhani text-[18px] font-semibold leading-[18px] tracking-[-0.02em] text-[#FFFFFF]">
                  One Size
                </span>
              </div>
            </button>
          ) : sizes.map((sizeObj) => {
            const isActive = selectedSize === sizeObj.size_label;

            return (
              <button
                key={sizeObj.id}
                data-size-label={sizeObj.size_label}
                data-selected={isActive}
                type="button"
                disabled={!sizeObj.is_available}
                onClick={(e) => {
                  setSelectedSize(sizeObj.size_label);
                  centerElement(e.currentTarget);
                }}
                /* 
                */
                className={`
                  group relative flex h-[45px] min-w-[66px] flex-shrink-0 flex-col items-center justify-center rounded-[6px] transition-all duration-100 ease-in
                  outline-[1.5px] outline-offset-0 overflow-hidden
                  ${!sizeObj.is_available ? 'opacity-60 cursor-not-allowed bg-[#FAFAFA]' : 'cursor-pointer'}
                  ${isActive
                    ? 'bg-[#000000] outline-[#242424]'
                    : 'bg-[#FFFFFF] outline-[#E9E9E9]'}
                `}
              >
                {!sizeObj.is_available && (
                  <div className="absolute z-10 inset-0 flex items-center justify-center bg-[#FAFAFA]/60 overflow-hidden rounded-[6px]">
                    <svg className="absolute w-full h-full text-[#D4D4D4]" preserveAspectRatio="none">
                      <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
                {/* 
                    FRAME 17: Inner Content Wrapper
                    - padding: 10px
                    - height: 38px (internal)
                */}
                <div className="flex h-[38px] min-w-[66px] flex-row items-center justify-center p-[10px] gap-[10px]">
                  <span
                    className={`
                      whitespace-nowrap text-center font-rajdhani text-[18px] font-semibold leading-[18px] tracking-[-0.02em] transition-colors duration-200
                      ${isActive ? 'text-[#FFFFFF]' : 'text-[#000000]'}
                    `}
                  >
                    {sizeObj.size_label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow with Fade Gradient */}
        {hasOverflow && canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 pr-1 bg-gradient-to-l from-white via-white/85 to-transparent pointer-events-none transition-all duration-200">
            <button
              type="button"
              onClick={() => handleSlide('right')}
              aria-label="More sizes"
              className="pointer-events-auto h-[28px] w-[28px] rounded-full bg-white border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#242424] hover:bg-[#FAFAFA] hover:border-[#1D1D1D] hover:scale-105 active:scale-95 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {sizeError && (
        <span data-error="true" className="text-[#FF3333] font-rajdhani text-[14px] font-semibold mt-[-8px]">
          Please select a size
        </span>
      )}
    </section>
  );
};

export default SizeSelection;
