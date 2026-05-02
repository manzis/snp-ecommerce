'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import MediaLightbox from '@/components/ui/MediaLightBox';

import type { ProductHighlightItem } from '@/services/productService';

interface ProductHighlightsProps {
  highlights?: ProductHighlightItem[];
}

const ProductHighlights: React.FC<ProductHighlightsProps> = ({ highlights = [] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const startTime = useRef<number>(0);
  const isInteracting = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (!mounted || highlights.length <= 1 || isDragging) return;

    // Only set an interval if the current slide is an image
    if (highlights[activeTab]?.type === 'image') {
      const timer = setTimeout(() => {
        setActiveTab((prev) => (prev + 1) % highlights.length);
      }, 5000); // 5 second duration for images
      return () => clearTimeout(timer);
    }
  }, [activeTab, mounted, highlights, isDragging]);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    isInteracting.current = true;
    setIsDragging(true);
    startTime.current = Date.now();
    const touch = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  };

  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    
    const diffX = startX.current - clientX;
    const diffY = startY.current - clientY;
    const elapsedTime = Date.now() - startTime.current;

    // 1. Navigation logic (Horizontal Swipes)
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30 && highlights.length > 0) {
      if (diffX > 0 && activeTab < highlights.length - 1) setActiveTab(prev => prev + 1);
      else if (diffX < 0 && activeTab > 0) setActiveTab(prev => prev - 1);
    } 
    // 2. Lightbox logic (Intentional Taps Only)
    else if (elapsedTime < 250 && Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
      setIsLightboxOpen(true);
    }
    
    setIsDragging(false);
  };

  if (highlights.length === 0) return null;
  if (!mounted) return <div className="w-full h-[485px] bg-[#f9fafb] rounded-[8px]" />;

  return (
    <section className="relative mx-auto flex w-full max-w-[362px] md:max-w-none flex-col items-start gap-[24px] lg:mx-0 select-none">
      <h2 className="font-titillium text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424]">
        Product Highlights
      </h2>

      {/* 
          FLUID LAYOUT WRAPPER 
          - Mobile/Tablet: Vertical stack or fluid width
          - Desktop (lg): Horizontal flex with proportional ratios
      */}
      <div className="flex flex-col lg:flex-row lg:gap-[6px] w-full lg:h-[485px] items-stretch">
        
        {/* 
            LEFT COLUMN: MAIN VIEWER 
            - flex-[2.1]: Occupies roughly 68% of the available width
            - h-[485px]: Fixed height to match Product Details vertical rhythm
        */}
        <div 
          className="relative flex h-[485px] w-full lg:flex-[2.1] flex-col overflow-hidden rounded-[8px] border-[2px] border-white bg-[#F9F9F9] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] cursor-grab active:cursor-grabbing shrink-0"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
        >
          <div key={activeTab} className="relative h-full w-full pointer-events-none animate-in fade-in duration-500">
            {highlights[activeTab]?.type === 'video' ? (
              <video
                src={highlights[activeTab].src}
                poster={highlights[activeTab].poster}
                autoPlay muted loop playsInline
                className="h-full w-full object-cover"
                aria-label={highlights[activeTab].alt}
              />
            ) : (
              <Image
                src={(highlights[activeTab]?.src || '/images/protein.png').trim()}
                alt={highlights[activeTab]?.alt || 'Highlight Image'}
                fill draggable={false}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
                priority
              />
            )}

            {/* Mobile-only Pagination (Hides on Desktop) */}
            <div className="absolute bottom-[16px] left-0 right-0 z-30 flex lg:hidden justify-center items-center gap-[6px] pointer-events-auto">
              {highlights.map((_, idx) => (
                <button
                  key={`hl-pag-${idx}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveTab(idx); }}
                  className={`h-[2.5px] rounded-[20px] transition-all duration-300 ${idx === activeTab ? 'bg-black w-[32px]' : 'bg-white/60 w-[24px]'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 
            RIGHT COLUMN: THUMBNAILS (Proportional Shrink/Fill)
            - flex-[1]: Occupies roughly 32% of the available width
            - hidden -> lg:flex: Only visible on Desktop/Large Tablet
        */}
        <div className="hidden lg:flex flex-col gap-[6px] lg:flex-[1] h-full">
          {highlights.slice(0, 3).map((item, idx) => {
            const isActive = activeTab === idx;
            
            return (
              <button
                key={`hl-thumb-${idx}`}
                onClick={() => setActiveTab(idx)}
                className={`relative flex-1 w-full overflow-hidden rounded-[8px] border-[2px] transition-all duration-300 shadow-[0_1px_3px_0_rgba(16,24,40,0.1)]
                  ${isActive ? 'border-[#3F9633]' : 'border-white'}
                `}
              >
                <Image
                  src={(item.type === 'video' ? (item.poster || '/images/protein.png') : (item.src || '/images/protein.png')).trim()}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1440px) 25vw, 300px"
                />
                
                {/* VIDEO INDICATOR */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                       <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-[#242424] border-b-[5px] border-b-transparent ml-1" />
                    </div>
                  </div>
                )}
                
                {!isActive && <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors" />}
              </button>
            );
          })}
        </div>
      </div>

      <MediaLightbox 
        isOpen={isLightboxOpen}
        media={highlights.map((h, i) => ({ type: h.type as 'image' | 'video', url: h.src, alt: h.alt || `Highlight ${i + 1}` }))}
        initialIndex={activeTab}
        onClose={() => setIsLightboxOpen(false)}
      />
    </section>
  );
};

export default ProductHighlights;
