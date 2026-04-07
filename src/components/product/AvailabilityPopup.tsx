'use client';

import React from 'react';
import StockIcon from '@/components/icons/StockIcon';
import TickIcon from '@/components/icons/CircularTick';
import PreOrderIcon from '@/components/icons/VanIcon';

interface AvailabilityPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvailabilityPopup: React.FC<AvailabilityPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop for "Click Outside" closure */}
      <div
        className="fixed inset-0 z-[60] bg-transparent px-[24px]"
        onClick={onClose}
      />

      <div className="absolute bottom-[calc(100%+12px)] right-0 z-[70] flex w-full max-w-[362px] flex-col items-end select-none animate-in fade-in zoom-in-95 slide-in-from-bottom-2 rounded-[8px] duration-200 transition-bounce shadow-smooth  " >

        <div className="relative w-full flex flex-col items-start rounded-[8px] border border-[#E8E8E8] bg-white">

          {/* SECTION 1: IN STOCK (Lime) - Manual top rounded corners applied */}
          <div className="flex w-full items-start gap-[12px]  p-[16px] rounded-t-[7px]" style={{
            background: 'linear-gradient(269.37deg, #EAFFCD -1.23%, #FFFFFF 112.02%)',
          }}>
            <StockIcon className="h-[20px] w-[20px] shrink-0 text-[#242424]" />
            <div className="flex flex-1 flex-col items-start justify-center gap-[6px]">
              <span className="font-titillium text-[18px] font-semibold leading-[20px] tracking-[-0.50px] text-[#242424] whitespace-nowrap">
                In Stock
              </span>
              <div className="flex flex-col items-start gap-[10px] self-stretch">
                <p className="font-titillium text-[14px] font-normal leading-[18px] tracking-[-0.50px] text-[#242424]">
                  Shipped Directly From Store within Nepal.
                </p>
                <div className="flex items-center gap-[12px] shrink-0">
                  <div className="flex items-center gap-[6px] shrink-0">
                    <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                    <span className="font-titillium text-[14px] font-normal leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                      Faster Delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px] shrink-0">
                    <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                    <span className="font-titillium text-[14px] font-normal leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                      Verified Products
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: WAREHOUSE (White) - Manual bottom rounded corners applied */}
          <div className="flex w-full items-start gap-[12px] border-t border-[#E5E5E5] p-[16px] bg-white rounded-b-[7px]">
            <PreOrderIcon className="h-[20px] w-[20px] shrink-0 text-[#242424]" />
            <div className="flex flex-1 flex-col items-start justify-center gap-[6px]">
              <span className="font-titillium text-[18px] font-semibold leading-[20px] tracking-[-0.50px] text-[#242424] whitespace-nowrap">
                Warehouse (Pre-Order)
              </span>
              <div className="flex flex-col items-start gap-[10px] self-stretch">
                <p className="font-titillium text-[14px] font-normal leading-[18px] tracking-[-0.50px] text-[#242424]">
                  Shipped internationally in pre-order Basis.
                </p>
                <div className="flex items-center gap-[12px] shrink-0">
                  <div className="flex items-center gap-[6px] shrink-0">
                    <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                    <span className="font-titillium text-[14px] font-normal leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                      7 Day Delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px] shrink-0">
                    <TickIcon className="h-[16px] w-[16px] text-[#575757]" />
                    <span className="font-titillium text-[14px] font-normal leading-[16px] tracking-[-0.50px] text-[#575757] whitespace-nowrap">
                      Verified Products
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 
              TOOLTIP ARROW FIX:
              - Outside the flex sections but inside the relative container.
              - bg-white: Matches Section 2.
              - border: Exact #E8E8E8 match.
              - z-10: Sits above the backdrop but the top half is masked by the section content.
          */}
          <div
            className="absolute -bottom-[6.5px] right-[14px] w-[12px] h-[12px] rotate-45 bg-white border-b border-r border-[#E8E8E8] border-t-[#ffffff] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] z-[70]"
          />
        </div>
      </div>
    </>
  );
};

export default AvailabilityPopup;