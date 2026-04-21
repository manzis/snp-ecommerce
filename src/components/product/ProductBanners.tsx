'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductBannersProps {
  banners?: (string | undefined)[];
  linkedBanners?: any[];
}

/**
 * Premium Banner Carousel with GPU acceleration and defensive data resolution.
 * Optimized for both desktop and mobile with distinct interaction patterns.
 */
const ProductBanners: React.FC<ProductBannersProps> = ({ banners = [], linkedBanners = [] }) => {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // High-performance normalization of banner data from multiple source patterns
  const normalizedBanners = React.useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set();

    // 1. Process Modern Linked Banners (via product_banners relation)
    (linkedBanners || []).forEach(item => {
      // Handle both wrapping {banner: ...} and flat banner objects
      const banner = item?.banner || item; 
      if (!banner?.image_url || banner.is_active === false) return;
      
      if (!seenIds.has(banner.id)) {
        seenIds.add(banner.id);
        
        // Elite defensive resolution for target product slug
        // Checks all possible aliased join names suggested by database hints
        const bTargets = banner.products || banner.target_product || banner.product;
        const targetData = Array.isArray(bTargets) ? bTargets[0] : bTargets;
        const slug = targetData?.slug || banner.product_slug;
        const link = banner.link_url || (slug ? `/product/${slug}` : null);
        
        list.push({
          id: banner.id,
          image_url: banner.image_url,
          title: banner.title || 'Special Promotion',
          link: link,
          type: banner.display_type || 'promo'
        });
      }
    });

    // 2. Process Legacy Banners (as visual fallback only)
    (banners || []).filter(Boolean).forEach((url, idx) => {
      const id = `legacy-${idx}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        list.push({
          id,
          image_url: url!,
          title: 'Promotion',
          link: null,
          type: 'legacy'
        });
      }
    });

    return list;
  }, [banners, linkedBanners]);

  const total = normalizedBanners.length;

  // Optimized Autoplay Logic
  useEffect(() => {
    if (total <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % total);
    }, 6000); 
    return () => clearInterval(interval);
  }, [total, isHovered]);

  const paginate = useCallback((newDirection: number) => {
    setCurrentIndex(prev => (prev + newDirection + total) % total);
  }, [total]);

  const handleBannerClick = (banner: any) => {
    if (isDragging || !banner.link) return;
    router.push(banner.link);
  };

  if (!mounted || total === 0) return null;

  return (
    <section 
      id="storefront-premium-banner"
      className="relative w-full overflow-hidden bg-white border-y border-gray-100 group/section select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[530px] md:h-[650px] lg:h-[720px] w-full bg-zinc-950 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ 
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1]
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.05}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_, { offset }) => {
                setTimeout(() => setIsDragging(false), 50);
                if (offset.x < -70) paginate(1);
                else if (offset.x > 70) paginate(-1);
            }}
            onTap={() => handleBannerClick(normalizedBanners[currentIndex])}
            className={`absolute inset-0 w-full h-full z-10 will-change-transform ${normalizedBanners[currentIndex].link ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="w-full h-full relative pointer-events-none">
               <Image 
                    src={normalizedBanners[currentIndex].image_url} 
                    alt={normalizedBanners[currentIndex].title}
                    fill 
                    className="object-cover object-center transition-transform duration-[2000ms]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1920px"
                    priority={currentIndex === 0}
                    quality={90}
                />
                
                {/* Visual Depth Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
                <div className="absolute inset-0 bg-black/5" />

                {/* Click Hint Overlay */}
                {normalizedBanners[currentIndex].link && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isHovered && !isDragging ? 1 : 0, y: isHovered && !isDragging ? 0 : 10 }}
                        className="px-8 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm font-semibold tracking-wide shadow-2xl"
                    >
                        EXPLORE NOW
                    </motion.div>
                 </div>
                )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Progress Indicators */}
        {total > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/5">
                {normalizedBanners.map((_, idx) => (
                    <motion.button
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                        initial={false}
                        animate={{ 
                            width: currentIndex === idx ? 32 : 8,
                            opacity: currentIndex === idx ? 1 : 0.4
                        }}
                        transition={{ 
                            duration: 0.5, 
                            ease: [0.32, 0.72, 0, 1] 
                        }}
                        className="relative h-1.5 rounded-full bg-white/40 overflow-hidden group/bar outline-none"
                    >
                        {currentIndex === idx && (
                             <motion.div 
                                className="absolute inset-0 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: isHovered ? 0 : 6, ease: "linear" }}
                             />
                        )}
                        <div className="absolute inset-0 bg-transparent group-hover/bar:bg-white/20 transition-colors" />
                    </motion.button>
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
    </section>
  );
};

export default ProductBanners;
