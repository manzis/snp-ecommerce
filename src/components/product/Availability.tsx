'use client'; // CRITICAL: This fixes the Hook Error

import React, { useState } from 'react';
import InventoryIcon from '@/components/icons/InventoryIcon';
import InfoIcon from '@/components/icons/InfoIcon';
import EyeIcon from '@/components/icons/EyeIcon';
import AvailabilityPopup from './AvailabilityPopup';

interface AvailabilityProps {
  stockStatus: 'in_stock' | 'pre_order' | 'out_of_stock';
}

const Availability: React.FC<AvailabilityProps> = ({ stockStatus }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const getStatusColor = () => {
    switch (stockStatus) {
      case 'in_stock':
      case 'pre_order': return 'bg-[#3F9733]';
      case 'out_of_stock': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = () => {
    switch (stockStatus) {
      case 'in_stock': return 'In Stock';
      case 'pre_order': return 'Pre-Order';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unavailable';
    }
  };

  const getSubText = () => {
    switch (stockStatus) {
      case 'in_stock': return 'Get Faster Delivery, 1 to 2 days';
      case 'pre_order': return 'Available for Pre-Order, Ships in 4 to 7 days';
      case 'out_of_stock': return 'Restocking soon, Stay tuned';
      default: return '';
    }
  };

  return (
    /* Relative wrapper so the Absolute Popup anchors to THIS component */
    <div className="relative w-full max-w-[700px] lg:max-w-none mx-auto lg:mx-0 px-[24px]">

      <section
        className={`flex w-full flex-col items-start rounded-[12px] overflow-hidden shrink-0 ${stockStatus === 'out_of_stock' ? 'bg-gray-100' : 'bg-[linear-gradient(95.13deg,#FFFDE7_30%,#ffe900_100%)]'}`}
      >
        {/* FRAME 40: Status & Delivery Info (56px) */}
        <div className={`relative flex w-full flex-row items-start gap-[10px] rounded-[12px] p-[10px] shrink-0 ${getStatusColor()}`}>
          <div className="relative flex-shrink-0">
            <InventoryIcon className="h-full w-full text-white" />
          </div>

          <div className="flex flex-grow flex-row items-start justify-between gap-[12px]">
            <div className="flex flex-col justify-center items-start gap-[2px] ">
              <h3 className="whitespace-nowrap font-titillium text-[20px] font-bold leading-[24px] tracking-[-0.10px] text-white">
                Availability : <span className="font-semibold">{getStatusText()}</span>
              </h3>
              <p className="whitespace-nowrap font-titillium text-[12px] font-normal leading-[14px] text-white">
                {getSubText()}
              </p>
            </div>

            {/* INFO TRIGGER */}
            <button
              onClick={() => setIsPopupOpen(!isPopupOpen)}
              className="relative  w-[20px] flex-shrink-0 active:scale-90 transition-transform outline-none"
            >
              <InfoIcon className="h-full w-full text-white" />
            </button>
          </div>
        </div>

        {/* FRAME 43: Social Proof (32px) */}
        <div className="flex w-full items-center justify-center gap-[4px] px-[12px] py-[8px] shrink-0">
          <div className="relative  w-[16px] flex-shrink-0">
            <EyeIcon className="h-full w-full text-[#000000]" />
          </div>
          <p className="whitespace-nowrap font-titillium text-[14px] font-normal leading-[16px] text-[#121212]">
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
