'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';

interface CheckoutSectionProps {
  title: string;
  statusText?: string;
  isCompleted?: boolean;
  isOpen: boolean;
  disabled?: boolean; // New prop for locking logic
  onClick: () => void;
  children: React.ReactNode;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  title,
  statusText,
  isOpen,
  disabled = false,
  onClick,
  children
}) => {
  return (
    <div className={`flex flex-col border-t border-[#f1f5f9] transition-all duration-300 ${
      disabled ? 'opacity-40 pointer-events-none bg-[#fdfdfd]' : 'bg-white opacity-100'
    }`}>
      <button 
        onClick={onClick}
        disabled={disabled}
        className="flex p-[24px] justify-between items-center w-full active:bg-[#f9fafb] transition-colors outline-none"
      >
        <div className="flex items-center gap-[12px]">
          <h3 className="font-rajdhani text-[20px] font-semibold leading-[30px] text-[#242424] tracking-[-0.8px]">
            {title}
          </h3>
          
          {/* Status Badge: Only show if NOT disabled and statusText exists */}
          {!disabled && statusText && (
            <div className="flex px-[6px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[4px]">
              <span className="font-rajdhani text-[12px] leading-[12px] text-[#575757] tracking-[-0.48px] whitespace-nowrap">
                {statusText}
              </span>
            </div>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <DropDownIcon className="w-[18px] h-[18px] text-[#242424]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutSection;
