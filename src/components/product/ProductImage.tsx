"use client";

import Image from 'next/image';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ActionButton from './ActionButton';
import StarIcon from '@/components/icons/GreenStar';
import ShareIcon from '@/components/icons/Share';
import WishlistIcon from '@/components/icons/Wishlisht';

type ProductImageProps = {
  images: string[];
  rating: number;
  reviewsCount: string;
  productName?: string;
};

const ProductImage = ({ images, rating, reviewsCount, productName = "Product" }: ProductImageProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const startX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) {}
    }
  };

  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    if (direction === 'next' && activeIndex < images.length - 1) {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev + 1);
    } else if (direction === 'prev' && activeIndex > 0) {
      setIsTransitioning(true);
      setActiveIndex((prev) => prev - 1);
    }
  }, [activeIndex, images.length, isTransitioning]);

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
    }
  };

  if (!mounted) return <div className="w-full h-[318px] lg:h-[560px] bg-white rounded-[6px]" />;

  return (
    <div className="mx-auto flex w-full max-w-[500px] lg:max-w-none flex-col items-center gap-[24px] relative select-none">
      <div 
        /* 
           FRAME LOCK: 
           - Mobile: h-[318px] (Exact Token)
           - Desktop: lg:h-[560px] (Increased for Premium Layout)
        */
        className="relative h-[318px] lg:h-[560px] w-full overflow-hidden rounded-[6px] bg-white cursor-grab active:cursor-grabbing border border-[#F5F5F5]"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
      >
        <div 
          className="flex h-full w-full transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTransitionEnd={() => setIsTransitioning(false)}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative h-full w-full shrink-0">
              <Image 
                src={img} 
                alt={productName} 
                fill 
                className="object-contain lg:object-cover" 
                priority={idx === 0} 
              />
            </div>
          ))}
        </div>

        {/* Rating Badge - Absolute Positioned */}
        <div className="absolute left-[12px] top-[12px] z-20 flex h-[31px] items-center gap-[10px] rounded-[6px] bg-[#ffe900] px-[8px] py-[6px] shadow-sm">
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
                  className={`w-full h-full transition-all duration-300 ${
                    isWishlisted ? 'text-red-500 fill-red-500' : 'text-[#242424]'
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
            className={`h-full flex-1 transition-colors duration-400 ${
                idx === activeIndex ? 'bg-[#242424]' : 'bg-transparent'
            } md:hover:bg-[#242424]/10`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImage;