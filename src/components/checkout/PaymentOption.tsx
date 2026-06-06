'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';

interface PaymentOptionProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isPopular?: boolean;
  isActive: boolean;
  onSelect: (id: string) => void;
  children?: React.ReactNode;
  error?: string;
  badge?: string;
  badgeType?: 'discount' | 'fee';
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  id,
  label,
  icon,
  isPopular,
  isActive,
  onSelect,
  children,
  error,
  badge,
  badgeType = 'discount'
}) => {
  // GRADIENT TOKENS (Preserved exactly)
  const activeGradient = 'linear-gradient(30deg, #FCFFFA 40%, #eaffcc 100%)';
  const inactiveGradient = 'linear-gradient(45deg, #FDFFFA 50%, #fafff3 100%)';

  return (
    <motion.div
      layout
      initial={false}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full mt-[8px]" // Added mt-8 to give space for the badge to overflow
    >
      {/* Custom Badge (e.g. Rs 25 Off or Rs 23 Fee) positioned at top edge */}
      {badge && (
        <div className={`absolute -top-[10px] right-[48px] flex h-[20px] px-[8px] justify-center items-center rounded-[6px] z-10 pointer-events-none overflow-hidden ${
          badgeType === 'discount' 
            ? 'bg-[#3f9633] text-white' 
            : 'bg-[#ffe900] border border-[#ebd700] text-[#242424]'
        }`}>
          <motion.div
            className="absolute top-0 bottom-0 w-[50%] skew-x-[-20deg]"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent)',
            }}
            initial={{ left: '-100%' }}
            animate={{ left: '250%' }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: Infinity,
            }}
          />
          <span className="font-rajdhani text-[11px] font-[700] leading-[11px] tracking-[0.2px] uppercase relative z-10">
            {badge}
          </span>
        </div>
      )}
      
      <motion.button
        layout="position"
        onClick={() => onSelect(id)}
        type="button"
        style={{
          background: isActive ? activeGradient : inactiveGradient,
        }}
        className={`flex w-full min-h-[56px] px-[16px] py-[16px] justify-between items-center transition-all duration-300 outline-none rounded-[16px] ${
          isActive 
            ? 'border-[1.5px] border-[#242424]' 
            : 'border-[1px] border-[#e2e8f0]'
        }`}
      >
        <div className="flex items-center gap-[10px]">
          {/* Icon Container */}
          <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0 text-[#242424]">
            {icon}
          </div>

          {/* Label */}
          <span className="font-rajdhani text-[16px] font-semibold leading-[24px] tracking-[-0.07px] text-[#242424]">
            {label}
          </span>

          {/* Popular Tag */}
          {isPopular && !badge && (
            <div className="flex h-[18px] px-[6px] justify-center items-center bg-[#3f9633] rounded-[6px] ml-[2px]">
              <span className="font-rajdhani text-[10px] font-medium leading-[6px] text-white tracking-[0.2px] uppercase">
                POPULAR
              </span>
            </div>
          )}

        </div>
        
        {/* Chevron Icon */}
        <motion.div 
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "circOut" }}
          className="text-[#242424]"
        >
          <DropDownIcon className="w-[16px] h-[16px]" />
        </motion.div>
      </motion.button>

      {/* EXPANSION WITH FADE-IN */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.25, delay: 0.1 } 
            }}
            className="overflow-hidden"
          >
            <div className="mt-[16px] pb-[12px] px-[2px] flex flex-col gap-3">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                  <span className="text-[11px] font-medium text-red-600">
                    {error}
                  </span>
                </div>
              )}
              {/* Internal container to ensure content fades in smoothly */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PaymentOption;
