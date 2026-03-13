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
  
  const startX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

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
        alert('Link copied to clipboard!');
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
    const endX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = startX.current - endX;
    if (Math.abs(diff) > 35) { 
      if (diff > 0) navigate('next');
      else navigate('prev');
    }
  };

  return (
    <div className="mx-auto flex w-[362px] flex-col items-center gap-[24px] relative select-none">
      <div 
        className="relative h-[318px] w-full overflow-hidden rounded-[6px] bg-white cursor-grab active:cursor-grabbing"
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
              <Image src={img} alt={productName} fill className="object-cover" priority={idx === 0} />
            </div>
          ))}
        </div>

        {/* Rating Badge */}
        <div className="absolute left-0 top-0 z-20 flex h-[31px] items-center gap-[10px] rounded-[6px] bg-[#ffe900] px-[8px] py-[6px]">
          <div className="flex gap-[2px] items-center shrink-0">
            <StarIcon className="w-[13px] h-[13px] text-[#242424]" />
            <span className="font-titillium text-[14px] font-[600] text-[#242424] ml-1">{rating}</span>
            <div className="w-[1px] h-[10px] bg-black mx-2 opacity-20" />
            <span className="font-titillium text-[14px] font-[600] text-[#797979]">{reviewsCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButton
          label="Share"
          onClick={handleShare}
          icon={<ShareIcon className="w-full h-full text-[#242424]" />}
          className="absolute top-[223px] left-[320px] z-20"
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
          className="absolute top-[272px] left-[320px] z-20"
        />
      </div>

      {/* Pagination Bar */}
      <div className="flex w-[362px] h-[2.5px] shrink-0 overflow-hidden rounded-full bg-[#E8E8E8]">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
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