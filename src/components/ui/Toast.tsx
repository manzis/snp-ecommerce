"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

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
  const bgColor = isSuccess ? 'bg-[rgba(63,150,51,0.96)]' : 'bg-[rgba(141,11,11,0.96)]';

  return (
    <div className="fixed top-[40px] md:top-[100px] left-1/2 z-[2000] pointer-events-none">
      <motion.div
        initial={{ y: -30, opacity: 0, scale: 0.95, x: "-50%" }}
        animate={{ y: 0, opacity: 1, scale: 1, x: "-50%" }}
        exit={{ y: -20, opacity: 0, scale: 0.95, x: "-50%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        layout
        className={`
          relative flex min-w-[280px] max-w-[400px] items-center rounded-[8px] pl-[14px] pr-[36px] py-[12px]
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto backdrop-blur-md
          ${bgColor}
        `}
      >
        {/* ICON */}
        <div className="shrink-0 flex items-center justify-center mr-[12px]">
          {isSuccess ? (
            <div className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-white/20">
              <svg className="w-[12px] h-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-white/20">
              <span className="text-[13px] font-bold text-white leading-none mt-[1px]">!</span>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col justify-center overflow-hidden">
          <span className="font-rajdhani font-semibold text-[15px] leading-tight text-white">
            {message}
          </span>
          {description && (
            <span className="font-rajdhani text-[13px] font-medium leading-[16px] text-white/80 mt-[4px] line-clamp-2">
              {description}
            </span>
          )}
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] outline-none flex items-center justify-center transition-opacity hover:opacity-100 opacity-60 active:scale-95"
        >
          <CloseIcon className="w-[14px] h-[14px] text-white" />
        </button>
      </motion.div>
    </div>
  );
};
