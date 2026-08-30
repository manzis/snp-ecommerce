'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProductBannersProps {
  banners?: (string | undefined)[];
  linkedBanners?: any[];
  variant?: 'split' | 'white';
}

/**
 * Premium Banner Carousel with native CSS hardware acceleration.
 * Optimized for both desktop and mobile with zero JS hydration overhead.
 */
const ProductBanners: React.FC<ProductBannersProps> = ({ banners = [], linkedBanners = [], variant = 'split' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // High-performance normalization of banner data from multiple source patterns
  const normalizedBanners = React.useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set();

    // 1. Process Modern Linked Banners
    (linkedBanners || []).forEach(item => {
      const banner = item?.banner || item; 
      if (!banner?.image_url || banner.is_active === false) return;
      
      if (!seenIds.has(banner.id)) {
        seenIds.add(banner.id);
        
        const bTargets = banner.products || banner.target_product || banner.product;
        const targetData = Array.isArray(bTargets) ? bTargets[0] : bTargets;
        const slug = targetData?.slug || banner.product_slug;
        const link = banner.link_url || (slug ? `/product/${slug}` : null);
        
        list.push({
          id: banner.id,
          image_url: banner.image_url.trim(),
          title: banner.title || 'Special Promotion',
          link: link,
          type: banner.display_type || 'promo'
        });
      }
    });

    // 2. Process Legacy Banners
    (banners || []).filter(Boolean).forEach((url, idx) => {
      const id = `legacy-${idx}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          image_url: url!.trim(),
          title: 'Promotion',
          link: null,
          type: 'legacy'
        });
      }
    });

    return list;
  }, [banners, linkedBanners]);

  const total = normalizedBanners.length;

  const scrollToSlide = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  }, []);

  // Optimized Autoplay Logic
  useEffect(() => {
    if (total <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % total;
        scrollToSlide(next);
        return next;
      });
    }, 6000); 
    return () => clearInterval(interval);
  }, [total, isHovered, scrollToSlide]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const paginate = useCallback((direction: number) => {
    const next = (activeIndex + direction + total) % total;
    scrollToSlide(next);
  }, [activeIndex, total, scrollToSlide]);

  const handleBannerClick = (banner: any) => {
    if (!banner.link) return;
    router.push(banner.link);
  };

  const sectionBgClass = variant === 'white' 
    ? 'bg-white' 
    : 'bg-[linear-gradient(to_bottom,#ffffff_50%,#F1F7F9_50%)]';

  return (
    <section 
      id="storefront-premium-banner"
      className={`w-full ${sectionBgClass} py-[8px] md:py-[16px] lg:py-[20px] group/section select-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto max-w-[1440px] w-full px-[12px] md:px-[24px] lg:px-[32px]">
        <div className="relative h-[500px] md:h-[600px] lg:h-[680px] w-full bg-zinc-950 rounded-[16px] md:rounded-[24px] overflow-hidden shadow-sm">
        
        {/* Native CSS Snap Container */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full gap-[0px] overflow-x-auto overflow-y-hidden snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {normalizedBanners.map((banner, idx) => (
            <div 
              key={banner.id}
              className={`relative h-full w-full flex-[0_0_100%] snap-start snap-always will-change-transform ${banner.link ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => handleBannerClick(banner)}
            >
                <Image 
                    src={banner.image_url} 
                    alt={banner.title}
                    fill 
                    className="object-cover object-center transition-transform duration-[2000ms]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
                    priority={idx === 0}
                    loading={idx === 0 ? undefined : "lazy"}
                    {...(idx === 0 ? { fetchPriority: "high" } : {})}
                />
                
                {/* Visual Depth Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 pointer-events-none" />
                <div className="absolute inset-0 bg-black/5 pointer-events-none" />

                {/* Click Hint Overlay */}
                {banner.link && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                        className={`px-8 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm font-semibold tracking-wide shadow-2xl transition-all duration-300 transform ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    >
                        EXPLORE NOW
                    </div>
                 </div>
                )}
            </div>
          ))}
        </div>

        {/* Cinematic Progress Indicators */}
        {total > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/5">
                {normalizedBanners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); scrollToSlide(idx); }}
                        className={`relative h-1.5 rounded-full overflow-hidden outline-none transition-all duration-500 ease-out ${activeIndex === idx ? 'w-8 bg-white/40' : 'w-2 bg-white/40 opacity-40 hover:bg-white/60'}`}
                    >
                        {activeIndex === idx && (
                             <div 
                                className="absolute inset-0 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                style={{ width: isHovered ? '100%' : '100%', transition: 'width 6s linear' }}
                             />
                        )}
                    </button>
                ))}
            </div>
        )}

        {/* High-Contrast Navigation (Hidden on Mobile) */}
        {total > 1 && (
        <div className="hidden md:block">
            <button 
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/10 backdrop-blur-lg flex items-center justify-center text-white opacity-0 group-hover/section:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-95 border border-white/10"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/10 backdrop-blur-lg flex items-center justify-center text-white opacity-0 group-hover/section:opacity-100 transition-all hover:bg-white/20 hover:scale-110 active:scale-95 border border-white/10"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
      )}
        </div>
      </div>
    </section>
  );
};

export default ProductBanners;
