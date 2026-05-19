'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import CloseIcon from '@/components/icons/SearchCloseIcon';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export interface LightboxMedia {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  media: LightboxMedia[];
  initialIndex?: number;
  onClose: () => void;
}

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  media,
  initialIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateShow, setAnimateShow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync index and manage transition states for entrance/exit
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setShouldRender(true);
      // Wait a microtask before triggering entrance transitions
      const timer = setTimeout(() => setAnimateShow(true), 20);
      return () => clearTimeout(timer);
    } else {
      setAnimateShow(false);
      // Wait for exit transition to complete (150ms) before unmounting from DOM
      const timer = setTimeout(() => setShouldRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < media.length - 1) {
      setCurrentIndex(p => p + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(p => p - 1);
    }
  };

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-150 ease-out ${
        animateShow ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* HEADER AREA */}
      <div className="absolute top-0 left-0 right-0 flex h-[100px] items-start justify-between px-[32px] pt-[32px] z-50 pointer-events-none">
        <span className="font-titillium text-[14px] font-semibold text-white tracking-[1px] opacity-70">
          {media.length > 1 ? `${currentIndex + 1} / ${media.length}` : ''}
        </span>

        {/* CLOSE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto flex items-center justify-center transition-all active:scale-90 outline-none"
        >
          <CloseIcon className="h-[32px] w-[32px] text-white drop-shadow-md" />
        </button>
      </div>

      <div className="relative flex h-full w-full items-center justify-center">
        {/* PREV BUTTON */}
        {media.length > 1 && currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-[25px] z-50 flex h-[45px] w-[45px] items-center justify-center rounded-[12px] bg-[#ffffff]/[80%] shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-[#242424] active:scale-90 transition-transform outline-none"
          >
            <ChevronLeftIcon className="rotate-180" />
          </button>
        )}

        {/* MAIN IMAGE DISPLAY (SLIDING WINDOW & HARDWARE-ACCELERATED) */}
        <div 
          className={`relative w-full h-full max-w-[550px] max-h-[75vh] transition-all duration-300 ease-out ${
            animateShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {media.map((item, idx) => {
            const isActive = idx === currentIndex;
            const isAdjacent = Math.abs(idx - currentIndex) <= 1;

            // Render only current and adjacent items to preload/decode them in the background
            if (!isAdjacent) return null;

            return (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-all duration-300 ease-out flex items-center justify-center ${
                  isActive
                    ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                    : 'opacity-0 scale-95 z-0 pointer-events-none'
                }`}
              >
                {item.type === 'video' ? (
                  isActive && (
                    <video
                      src={item.url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      playsInline
                    />
                  )
                ) : (
                  <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={5}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                    doubleClick={{ step: 0.5 }}
                    disabled={!isActive}
                  >
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <div className="relative w-full h-full max-w-[800px] max-h-[85vh] aspect-square flex items-center justify-center cursor-zoom-in">
                        <Image
                          src={item.url}
                          alt={item.alt || "Media Preview"}
                          fill
                          className="object-contain pointer-events-none"
                          sizes="(max-width: 768px) 100vw, 800px"
                          priority={isActive}
                        />
                      </div>
                    </TransformComponent>
                  </TransformWrapper>
                )}
              </div>
            );
          })}
        </div>

        {/* NEXT BUTTON */}
        {media.length > 1 && currentIndex < media.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-[25px] z-50 flex h-[45px] w-[45px] items-center justify-center rounded-[12px] bg-[#ffffff]/[80%] shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-[#242424] active:scale-90 transition-transform outline-none"
          >
            <div className="flex items-center justify-center h-[24px] w-[24px]">
              <ChevronLeftIcon />
            </div>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MediaLightbox;
