"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import CheckIcon from '@/components/icons/CheckIcon';
import CloseIcon from '@/components/icons/CloseIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  // Dynamic Colors based on State
  const bgColor = isSuccess ? 'bg-[rgba(63,150,51,0.92)]' : 'bg-[rgba(141,11,11,0.92)]';
  const orbitStroke = isSuccess ? '#096e00' : '#5e0000ff';

  return (
    <div className="fixed top-[125px] left-[335px] -translate-x-1/2 z-[200] pointer-events-none">
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.9, x: "-50%" }}
        animate={{ y: 0, opacity: 1, scale: 1, x: "-50%" }}
        exit={{ y: -20, opacity: 0, scale: 0.95, x: "-50%" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          relative flex w-[263px] h-[38px] 
          justify-start items-center rounded-full pl-[16px]
          border-b-[1.5px] border-white/100 
          shadow-[0_4px_12px_0_rgba(0,0,0,0.15)] pointer-events-auto
          ${bgColor}
          backdrop-blur-md
        `}
      >
        {/* 1. OUTER ORBITING PROGRESS BAR */}
        {/* SVG is 8px wider/taller than the div to create the 2px gap + stroke space */}
        <svg 
          className="absolute -inset-[4px] w-[271px] h-[46px] pointer-events-none overflow-visible" 
          viewBox="0 0 271 46" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            /* Path traces exactly 2px outside the div boundary */
            d="M 23 1 L 248 1 A 22 22 0 0 1 248 45 L 23 45 A 22 22 0 0 1 23 1 Z"
            stroke={orbitStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.8 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </svg>

        {/* 2. CENTERED CONTENT GROUP (Icon + Text Locked Together) */}
        <div className="flex items-center gap-[8px] z-10">
          <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">
            {isSuccess ? (
              <CheckIcon className="w-full h-full text-white" />
            ) : (
              /* Error Icon */
              <div className="w-[16px] h-[16px] rounded-full bg-white flex items-center justify-center">
                 <span className="text-[12px] font-bold text-[#8d0b0b] leading-none">!</span>
              </div>
            )}
          </div>

          <span className="font-custom text-[14px] font-normal leading-none text-white whitespace-nowrap">
            {message}
          </span>
        </div>

        {/* 3. CLOSE BUTTON (Absolute positioned to stay on right without pushing center) */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute right-[12px] w-[16px] h-[16px] outline-none flex items-center justify-center transition-transform active:scale-75 z-20"
        >
          <CloseIcon className="w-full h-full text-white/90" />
        </button>
      </motion.div>
    </div>
  );
};