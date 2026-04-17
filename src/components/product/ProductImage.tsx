"use client";

import Image from 'next/image';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ActionButton from './ActionButton';
import StarIcon from '@/components/icons/GreenStar';
import ShareIcon from '@/components/icons/Share';
import WishlistIcon from '@/components/icons/Wishlisht';
import MediaLightbox, { LightboxMedia } from '@/components/ui/MediaLightBox';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ZUSTAND STORE
  const { activeVariantImage } = useProductSelectionStore();

  const startX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedFlavourImage = activeVariantImage;

  const displayImages = React.useMemo(() => {
    if (!selectedFlavourImage) return images;
    // Filter out the selected image if it happens to be in the images array
    const filtered = images.filter(img => img !== selectedFlavourImage);
    return [selectedFlavourImage, ...filtered];
  }, [images, selectedFlavourImage]);

  useEffect(() => {
    if (selectedFlavourImage) {
      setIsTransitioning(false);
      setActiveIndex(0);
    }
  }, [selectedFlavourImage]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 200);
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

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    if (direction === 'next' && activeIndex < displayImages.length - 1) {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    } else if (direction === 'prev' && activeIndex > 0) {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex, displayImages.length, isTransitioning]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = startX.current - clientX;
    
    if (Math.abs(diff) > 35) {
      if (diff > 0) navigate('next');
      else navigate('prev');
    } else if (Math.abs(diff) < 5) {
      // Treat as click if barely moved
      setIsLightboxOpen(true);
    }
  };

  if (!mounted) return <div className="w-full h-[320px] lg:h-[560px] bg-white" />;

  return (
    <div className="mx-auto flex w-full max-w-[500px] lg:max-w-none flex-col items-center gap-[24px] relative select-none ">
      <div
        /* 
           FRAME LOCK: 
           - Mobile: h-[318px] (Exact Token)
           - Desktop: lg:h-[560px] (Increased for Premium Layout)
        */
        className="relative h-[350px] lg:h-[560px] w-full overflow-hidden bg-white cursor-grab active:cursor-grabbing border border-[#F5F5F5]"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
      >
        <div
          className={`flex h-full w-full transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none ${stockStatus === 'out_of_stock' ? 'opacity-50 grayscale-[0.3]' : ''}`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTransitionEnd={() => setIsTransitioning(false)}
        >
          {displayImages.map((img, idx) => (
            <div key={`${img}-${idx}`} className="relative h-full w-full shrink-0">
              <Image
                src={img}
                alt={productName}
                fill
                className="object-cover lg:object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {stockStatus === 'out_of_stock' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none px-[2px]">
            <div className="w-full bg-white/95 backdrop-blur-[4px] py-8 lg:py-12 flex flex-col items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-y border-[#F0F0F0]/80">
              <h2 className="font-custom text-[24px] lg:text-[36px] font-bold tracking-[-0.02em] uppercase leading-none bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                Out of Stock
              </h2>
              <p className="font-titillium text-[12px] lg:text-[14px] font-medium text-[#797979] mt-3 tracking-wide">
                This product is no longer available!
              </p>
            </div>
          </div>
        )}

        {/* Rating Badge - Absolute Positioned */}
        <div className="absolute left-[0px] bottom-[0px] z-20 flex h-[31px] items-center gap-[10px] bg-[#ffe900] px-[8px] py-[6px] shadow-sm">
          <div className="flex gap-[2px] items-center shrink-0">
            <StarIcon className="w-[13px] h-[13px] text-[#242424]" />
            <span className="font-titillium text-[14px] font-[600] text-[#242424] ml-1">{rating}</span>
            <div className="w-[1px] h-[10px] bg-black mx-2 opacity-20" />
            <span className="font-titillium text-[14px] font-[600] text-[#797979]">{reviewsCount}</span>
          </div>
        </div>

        {/* 
            ACTION BUTTONS: 
            - CRITICAL FIX: Changed from fixed left to right-[12px] anchor.
            - This ensures they stay pinned to the corner when the container widens on desktop.
        */}
        <div className="absolute right-[12px] bottom-[12px] flex flex-col gap-[12px] z-20">
          <ActionButton
            label="Share"
            onClick={handleShare}
            icon={<ShareIcon className="w-full h-full text-[#242424]" />}
          />
          <ActionButton
            label="Wishlist"
            onClick={handleWishlist}
            icon={
              <div className={`transition-transform duration-200 ${animateHeart ? 'scale-110' : 'scale-100'}`}>
                <WishlistIcon
                  className={`w-full h-full transition-all duration-300 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-[#242424]'
                    }`}
                />
              </div>
            }
          />
        </div>
      </div>

      {/* 
          PAGINATION BAR: 
          - Now responsive: w-full (max-w-[362px] on mobile, 100% on desktop)
      */}
      <div className="flex w-full h-[2.5px] shrink-0 overflow-hidden rounded-full bg-[#E8E8E8]">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onPointerUp={(e) => e.currentTarget.blur()}
            onClick={() => !isTransitioning && setActiveIndex(idx)}
            className={`h-full flex-1 transition-colors duration-400 ${idx === activeIndex ? 'bg-[#242424]' : 'bg-transparent'
              } md:hover:bg-[#242424]/10`}
          />
        ))}
      </div>

      <MediaLightbox 
        isOpen={isLightboxOpen}
        media={displayImages.map(img => ({ type: 'image', url: img, alt: productName }))}
        initialIndex={activeIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};

export default ProductImage;