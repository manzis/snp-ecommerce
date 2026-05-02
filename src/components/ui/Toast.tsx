"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import CheckIcon from '@/components/icons/CheckIcon';
import CloseIcon from '@/components/icons/CloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  description?: string;
  onClose: () => void;
}

export const Toast = ({ message, type, description, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-[rgba(63,150,51,0.92)]' : 'bg-[rgba(141,11,11,0.92)]';
  const orbitStroke = isSuccess ? '#096e00' : '#5e0000ff';

  /**
   * PIXEL PERFECT GEOMETRY CALCULATION
   * Container Width: 263px
   * Container Height: 38px (Default) or 64px (Description)
   * SVG is inset -4px, so SVG Width is 271px
   */
  const svgWidth = 271;
  const svgHeight = description ? 72 : 46; // (64 + 8) or (38 + 8)

  // Path Coordinates: M (StartPoint) L (LineTo) A (ArcTo)
  // For 38px height: Radius is 22
  // For 64px height: Radius is 35
  const pathD = description
    ? "M 36 1 L 235 1 A 35 35 0 0 1 235 71 L 36 71 A 35 35 0 0 1 36 1 Z"
    : "M 23 1 L 248 1 A 22 22 0 0 1 248 45 L 23 45 A 22 22 0 0 1 23 1 Z";

  return (
    <div className="fixed top-[100px] left-1/2 z-[2000] pointer-events-none">
      <motion.div
        initial={{ y: -30, opacity: 0, scale: 0.9, x: "-50%" }}
        animate={{ y: 0, opacity: 1, scale: 1, x: "-50%" }}
        exit={{ y: -20, opacity: 0, scale: 0.95, x: "-50%" }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
          mass: 0.8
        }}
        layout // Smoothly animates the height change if description is added dynamically
        className={`
          relative flex w-[263px] ${description ? 'h-[64px]' : 'h-[38px]'}
          justify-start items-center rounded-full pl-[16px] pr-[36px]
          border-b-[1.5px] border-white/100 
          shadow-[0_8px_20px_0_rgba(0,0,0,0.2)] pointer-events-auto
          ${bgColor}
          backdrop-blur-md transition-[height] duration-300
        `}
      >
        {/* 1. OUTER ORBITING PROGRESS BAR */}
        <svg
          key={description ? 'desc' : 'no-desc'} // Force re-render to reset path animation
          className="absolute -inset-[4px] pointer-events-none overflow-visible"
          style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d={pathD}
            stroke={orbitStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </svg>

        {/* 2. CONTENT GROUP */}
        <div className="flex items-start gap-[10px] z-10 py-[4px]">
          {/* Icon Section */}
          <div className={`shrink-0 flex items-center justify-center ${description ? 'mt-[4px]' : 'mt-0'}`}>
            {isSuccess ? (
              <CheckIcon className="w-[18px] h-[18px] text-white" />
            ) : (
              <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#8d0b0b] leading-none">!</span>
              </div>
            )}
          </div>

          {/* Text Section */}
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="font-custom text-[14px] font-normal leading-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {message}
            </span>
            {description && (
              <span className="font-titillium text-[12px] font-normal leading-tight text-white/90 mt-[3px] line-clamp-2">
                {description}
              </span>
            )}
          </div>
        </div>

        {/* 3. CLOSE BUTTON */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] outline-none flex items-center justify-center transition-all hover:opacity-100 opacity-80 active:scale-75 z-20"
        >
          <CloseIcon className="w-full h-full text-white" />
        </button>
      </motion.div>
    </div>
  );
};
