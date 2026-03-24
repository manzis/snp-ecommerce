'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/SearchCloseIcon'; 
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'; 

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

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < media.length - 1) setCurrentIndex(p => p + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(p => p - 1);
  };

  const currentMedia = media[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* HEADER AREA */}
          <div className="absolute top-0 left-0 right-0 flex h-[100px] items-start justify-between px-[32px] pt-[32px] z-50 pointer-events-none">
            <span className="font-titillium text-[14px] font-semibold text-white tracking-[1px] opacity-70">
              {media.length > 1 ? `${currentIndex + 1} / ${media.length}` : ''}
            </span>
            
            {/* CLOSE BUTTON: Just the large white cross, no background */}
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="pointer-events-auto flex items-center justify-center transition-all active:scale-90 outline-none"
            >
              <CloseIcon className="h-[32px] w-[32px] text-white drop-shadow-md" />
            </button>
          </div>

          <div className="relative flex h-full w-full items-center justify-center">
            
            {/* PREV BUTTON: Rounded 10px, closer to center */}
            {media.length > 1 && currentIndex > 0 && (
              <button 
                onClick={handlePrev}
                className="absolute left-[25px] z-50 flex h-[45px] w-[45px] items-center justify-center rounded-[12px] bg-[#ffffff]/[80%] shadow-[0_10px_20px_rgba(0,0,0,0.3)] text-[#242424] active:scale-90 transition-transform outline-none"
              >
                <ChevronLeftIcon className='rotate-180'  />
              </button>
            )}

            {/* MAIN IMAGE DISPLAY */}
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-full max-w-[550px] max-h-[75vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {currentMedia && (
                <Image 
                  src={currentMedia.url} 
                  alt={currentMedia.alt || "Media Preview"} 
                  fill 
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              )}
            </motion.div>

            {/* NEXT BUTTON: Rounded 10px, closer to center */}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaLightbox;