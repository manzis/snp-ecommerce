"use client";

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { optimizeImage } from '@/lib/optimizeImage';
import { Heart, Send } from 'lucide-react';
import MediaLightbox from '@/components/ui/MediaLightBox';
import { useProductSelectionStore } from '@/store/productSelectionStore';

type ProductImageProps = {
  images: string[];
  rating: number;
  reviewsCount: string;
  productName?: string;
  stockStatus?: string;
  flavours?: any[];
};

const ProductImage = ({ images, rating, reviewsCount, productName = "Product", stockStatus, flavours = [] }: ProductImageProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mouse drag-to-scroll refs for desktop interaction
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // ZUSTAND STORE
  const { activeVariantImage, selectedSize, selectedFlavorId } = useProductSelectionStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedFlavourImage = activeVariantImage;

  const displayImages = React.useMemo(() => {
    if (!selectedFlavourImage) return images;
    // Replace the default main image (images[0]) with the selected variant image
    // and keep the remaining secondary gallery images without showing the main image
    const secondaryGallery = images.slice(1).filter(img => img !== selectedFlavourImage);
    return [selectedFlavourImage, ...secondaryGallery];
  }, [images, selectedFlavourImage]);

  // Auto-scroll back to slide 0 whenever user picks any size, flavour, or variant image
  useEffect(() => {
    if (selectedSize || selectedFlavorId || selectedFlavourImage) {
      setActiveIndex(0);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  }, [selectedSize, selectedFlavorId, selectedFlavourImage]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = { title: productName, text: `Check out ${productName}!`, url: shareUrl };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch (err) { }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) { }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isMouseDownRef.current) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < displayImages.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToSlide = (idx: number) => {
    if (scrollRef.current) {
      const targetIdx = Math.max(0, Math.min(displayImages.length - 1, idx));
      scrollRef.current.scrollTo({
        left: targetIdx * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
      setActiveIndex(targetIdx);
    }
  };

  // Mouse drag interaction logic for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    startXRef.current = e.clientX;
    if (scrollRef.current) {
      startScrollLeftRef.current = scrollRef.current.scrollLeft;
    }
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !scrollRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }
    if (hasDraggedRef.current) {
      scrollRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsDragging(false);

    if (hasDraggedRef.current && scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      if (width > 0) {
        const targetIndex = Math.max(
          0,
          Math.min(
            displayImages.length - 1,
            Math.round(scrollRef.current.scrollLeft / width)
          )
        );
        scrollToSlide(targetIndex);
      }
    }
  };

  const handleImageClick = (idx: number) => {
    if (hasDraggedRef.current) return;
    setActiveIndex(idx);
    setIsLightboxOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-none flex-col items-center gap-0 lg:gap-[20px] relative select-none">
      <div
        className="relative h-[410px] sm:h-[450px] lg:h-[620px] w-full overflow-hidden bg-white group"
      >
        {/* Main Image Scroll / Drag Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex h-full w-full gap-[1px] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging
              ? 'snap-none cursor-grabbing'
              : 'snap-x snap-mandatory cursor-grab md:cursor-pointer'
          } ${stockStatus === 'out_of_stock' ? 'opacity-50 grayscale-[0.3]' : ''}`}
        >
          {displayImages.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              className="relative h-full w-full flex-[0_0_100%] snap-start snap-always"
              onClick={() => handleImageClick(idx)}
            >
              <Image
                src={optimizeImage(img, 1000)}
                alt={`${productName} view ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-contain pointer-events-none select-none"
                priority={idx === 0}
                loading={idx === 0 ? undefined : "lazy"}
                draggable={false}
                {...(idx === 0 ? { fetchPriority: "high" } : {})}
              />
            </div>
          ))}
        </div>

        {/* Left & Right Slide Navigation Buttons (Mobile & Desktop) */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                if (activeIndex > 0) scrollToSlide(activeIndex - 1);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={activeIndex === 0}
              className={`absolute left-6 md:left-3 top-1/2 -translate-y-1/2 z-20 flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/95 shadow-none backdrop-blur-sm border border-black/10 text-[#242424] transition-all duration-200 ${
                activeIndex === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-white hover:scale-105 active:scale-95 cursor-pointer opacity-90 md:opacity-80 md:group-hover:opacity-100'
              }`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 pr-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                if (activeIndex < displayImages.length - 1) scrollToSlide(activeIndex + 1);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              disabled={activeIndex === displayImages.length - 1}
              className={`absolute right-6 md:right-3 top-1/2 -translate-y-1/2 z-20 flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/95 shadow-none backdrop-blur-sm border border-black/10 text-[#242424] transition-all duration-200 ${
                activeIndex === displayImages.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-white hover:scale-105 active:scale-95 cursor-pointer opacity-90 md:opacity-80 md:group-hover:opacity-100'
              }`}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 pl-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Out of Stock Overlay */}
        {stockStatus === 'out_of_stock' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-2 lg:px-4">
            <div className="w-full bg-white/90 backdrop-blur-[6px] py-5 lg:py-7 px-4 flex flex-col items-center justify-center">
              <h2 className="font-rajdhani font-bold text-[22px] lg:text-[30px] tracking-[-0.02em] uppercase leading-none text-red-600">
                Out of Stock
              </h2>
              <p className="font-rajdhani text-[12px] sm:text-[13.5px] lg:text-[14.5px] font-medium text-[#707070] mt-2 tracking-wide text-center flex items-center justify-center gap-1.5 whitespace-nowrap">
                <span>The product is not currently available</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-rajdhani font-semibold text-[11.5px] sm:text-[13px] lg:text-[13.5px] shrink-0">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
                  </span>
                  <span>Restocking soon</span>
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Rating Badge (Bottom Left) */}
        <div className="absolute left-6 md:left-4 bottom-4 z-20 flex h-[35px] items-center bg-white px-3.5 rounded-[10px] border border-black/10 shadow-none">
          <div className="flex items-center shrink-0">
            <span className="font-rajdhani font-bold text-[15px] leading-none text-[#18181B]">{rating || '4.8'}</span>
            <svg className="w-4 h-4 fill-[#10B981] text-[#10B981] shrink-0 ml-2 mr-3" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div className="w-[1px] h-3.5 bg-gray-200 mr-3" />
            <span className="font-rajdhani font-semibold text-[14px] leading-none text-[#71717A]">
              {String(reviewsCount || '0').replace(/[()]/g, '').replace(/reviews?/i, '').trim()}
            </span>
          </div>
        </div>

        {/* Action Buttons (Wishlist & Share - Top Right) */}
        <div className="absolute top-4 right-6 md:top-4 md:right-4 flex flex-col gap-2.5 z-20">
          <button
            type="button"
            aria-label="Wishlist"
            onClick={handleWishlist}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex h-[40px] w-[40px] md:h-[42px] md:w-[42px] items-center justify-center rounded-[12px] bg-white text-[#242424] border border-black/10 shadow-none hover:bg-[#fafafa] active:scale-95 transition-all outline-none"
          >
            <div className="relative flex items-center justify-center">
              <Heart
                size={22}
                strokeWidth={1.8}
                className={`transition-colors duration-200 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#242424]'
                }`}
              />
              {!isWishlisted && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold leading-none text-[#242424] select-none">
                  +
                </span>
              )}
            </div>
          </button>

          <button
            type="button"
            aria-label="Share"
            onClick={handleShare}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="flex h-[40px] w-[40px] md:h-[42px] md:w-[42px] items-center justify-center rounded-[12px] bg-white text-[#242424] border border-black/10 shadow-none hover:bg-[#fafafa] active:scale-95 transition-all outline-none"
          >
            <Send size={20} strokeWidth={1.9} className="text-[#242424] -translate-x-[0.5px] translate-y-[0.5px]" />
          </button>
        </div>
      </div>

      {/* Pagination Line Indicator & Desktop Thumbnails */}
      <div className="flex flex-col items-center justify-center w-full px-6 lg:px-0 pt-3.5 pb-6 lg:py-0">
        <div className="flex w-full max-w-[320px] sm:max-w-[360px] lg:max-w-none h-[3.5px] shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onPointerUp={(e) => e.currentTarget.blur()}
              onClick={() => scrollToSlide(idx)}
              className={`h-full flex-1 transition-colors duration-300 ${
                idx === activeIndex ? 'bg-[#242424]' : 'bg-transparent'
              } md:hover:bg-[#242424]/10`}
            />
          ))}
        </div>

        {/* Desktop Thumbnail Selector */}
        {displayImages.length > 1 && (
          <div className="hidden md:flex items-center justify-center gap-2 overflow-x-auto py-1 lg:mt-3">
            {displayImages.map((img, idx) => (
              <button
                key={`thumb-${img}-${idx}`}
                type="button"
                onClick={() => scrollToSlide(idx)}
                onMouseDown={(e) => e.stopPropagation()}
                className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-[10px] overflow-hidden border-2 transition-all duration-200 shrink-0 bg-white ${
                  idx === activeIndex
                    ? 'border-[#242424] scale-105 shadow-sm'
                    : 'border-[#F0F0F0] opacity-60 hover:opacity-100 hover:border-gray-300'
                }`}
              >
                <Image
                  src={optimizeImage(img, 200)}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {mounted && (
        <MediaLightbox
          isOpen={isLightboxOpen}
          media={displayImages.map(img => ({ type: 'image', url: optimizeImage(img, 1200), alt: productName }))}
          initialIndex={activeIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductImage;
