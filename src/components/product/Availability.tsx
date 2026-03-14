'use client'; // CRITICAL: This fixes the Hook Error

import React, { useState } from 'react';
import InventoryIcon from '@/components/icons/InventoryIcon'; 
import InfoIcon from '@/components/icons/InfoIcon';
import EyeIcon from '@/components/icons/EyeIcon';
import AvailabilityPopup from './AvailabilityPopup';

const Availability: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    /* Relative wrapper so the Absolute Popup anchors to THIS component */
    <div className="relative w-full max-w-[700px] lg:max-w-none mx-auto lg:mx-0">
      
      <section 
        className="flex w-full flex-col items-start rounded-[12px] bg-[#FFEA00] overflow-hidden h-[88px] shrink-0"
      >
        {/* FRAME 40: Status & Delivery Info (56px) */}
        <div className="relative flex h-[56px] w-full flex-row items-start gap-[10px] rounded-[12px] bg-[#3F9733] p-[10px] shrink-0">
          <div className="relative h-[24px] w-[24px] flex-shrink-0">
            <InventoryIcon className="h-full w-full text-white" />
          </div>

          <div className="flex h-[36px] flex-grow flex-row items-start justify-between gap-[12px]">
            <div className="flex flex-col justify-center items-start gap-[2px] h-[36px]">
              <h3 className="whitespace-nowrap font-titillium text-[20px] font-bold leading-[20px] tracking-[-0.04em] text-white">
                Availability : <span className="font-semibold">In Stock</span>
              </h3>
              <p className="whitespace-nowrap font-titillium text-[12px] font-normal leading-[14px] text-white">
                Get Faster Delivery, 1 to 2 days
              </p>
            </div>

            {/* INFO TRIGGER */}
            <button 
              onClick={() => setIsPopupOpen(!isPopupOpen)}
              className="relative h-[20px] w-[20px] flex-shrink-0 active:scale-90 transition-transform outline-none"
            >
              <InfoIcon className="h-full w-full text-white" />
            </button>
          </div>
        </div>

        {/* FRAME 43: Social Proof (32px) */}
        <div className="flex h-[32px] w-full items-center justify-center gap-[4px] px-[12px] py-[8px] shrink-0">
          <div className="relative h-[16px] w-[16px] flex-shrink-0">
            <EyeIcon className="h-full w-full text-[#000000]" />
          </div>
          <p className="whitespace-nowrap font-titillium text-[14px] font-normal leading-[14px] text-[#121212]">
            92 People viewing this item now, <span className="font-semibold">Selling Fast!</span>
          </p>
        </div>
      </section>

      {/* THE POPUP: Positioned absolutely relative to the container above */}
      <AvailabilityPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </div>
  );
};

export default Availability;