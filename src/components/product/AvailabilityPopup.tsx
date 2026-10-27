'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import StockIcon from '@/components/icons/StockIcon';
import TickIcon from '@/components/icons/CircularTick';
import PreOrderIcon from '@/components/icons/VanIcon';

interface AvailabilityPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvailabilityPopup: React.FC<AvailabilityPopupProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop for click outside closure */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centered Modal Card */}
      <div className="relative z-10 w-full max-w-[362px] flex flex-col select-none rounded-[14px] overflow-hidden border border-[#E8E8E8] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 transition-colors shadow-xs"
        >
          <X className="h-4 w-4" />
        </button>

        {/* SECTION 1: IN STOCK (Lime) */}
        <div
          className="flex w-full items-start gap-[12px] p-[16px] pr-[36px]"
          style={{
            background: 'linear-gradient(269.37deg, #EAFFCD -1.23%, #FFFFFF 112.02%)',
          }}
        >
          <StockIcon className="h-[20px] w-[20px] shrink-0 text-[#242424]" />
          <div className="flex flex-1 flex-col items-start justify-center gap-[6px]">
            <span className="font-rajdhani text-[18px] font-semibold leading-[20px] tracking-[-0.50px] text-[#242424] whitespace-nowrap">
              In Stock
            </span>
            <div className="flex flex-col items-start gap-[10px] self-stretch">
              <p className="font-rajdhani text-[14px] font-medium leading-[18px] tracking-[-0.50px] text-[#242424]">
                Shipped Directly From Store within Nepal.
              </p>
              <div className="flex items-center gap-[12px] shrink-0">
                <div className="flex items-center gap-[6px] shrink-0">
                  <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                  <span className="font-rajdhani text-[14px] font-medium leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                    Faster Delivery
                  </span>
                </div>
                <div className="flex items-center gap-[6px] shrink-0">
                  <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                  <span className="font-rajdhani text-[14px] font-medium leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                    Verified Products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: GLOBAL (White) */}
        <div className="flex w-full items-start gap-[12px] border-t border-[#E5E5E5] p-[16px] bg-white">
          <PreOrderIcon className="h-[20px] w-[20px] shrink-0 text-[#242424]" />
          <div className="flex flex-1 flex-col items-start justify-center gap-[6px]">
            <span className="font-rajdhani text-[18px] font-semibold leading-[20px] tracking-[-0.50px] text-[#242424] whitespace-nowrap">
              Global (Pre-Order)
            </span>
            <div className="flex flex-col items-start gap-[10px] self-stretch">
              <p className="font-rajdhani text-[14px] font-medium leading-[18px] tracking-[-0.50px] text-[#242424]">
                Shipped internationally in pre-order Basis.
              </p>
              <div className="flex items-center gap-[12px] shrink-0">
                <div className="flex items-center gap-[6px] shrink-0">
                  <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                  <span className="font-rajdhani text-[14px] font-medium leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                    7 Day Delivery
                  </span>
                </div>
                <div className="flex items-center gap-[6px] shrink-0">
                  <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                  <span className="font-rajdhani text-[14px] font-medium leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                    Verified Products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPopup;
