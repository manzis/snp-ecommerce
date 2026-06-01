'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HomeIcon from '@/components/icons/HomeIcon';
import VanIcon from '@/components/icons/VanIcon';
import StoreIcon from '@/components/icons/StoreIcon';
import ArrowIcon from '@/components/icons/ChevronLeftIcon';
import CheckIcon from '@/components/icons/TickIcon';
import type { Seller } from '@/services/productService';

// Helper type extended from ProductDetailsProps
interface DeliveryDetailsProps {
  seller: Seller | null;
  stockStatus?: string;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ seller, stockStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home' | 'pickup'>('home');

  const getDeliveryText = () => {
    const today = new Date();

    if (stockStatus === 'pre_order') {
      const start = new Date(today);
      start.setDate(start.getDate() + 4);
      const end = new Date(today);
      end.setDate(end.getDate() + 6);

      const formatMonth = (d: Date) => new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
      return `Delivery By ${start.getDate()}${formatMonth(start)} - ${end.getDate()}${formatMonth(end)}`;
    } else {
      const delivery = new Date(today);
      delivery.setDate(delivery.getDate() + 2);

      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(delivery);
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(delivery);
      return `Delivery By ${delivery.getDate()} ${monthName}, ${dayName}`;
    }
  };

  return (
    <section className="flex flex-col gap-[18px] w-full max-w-[700px] lg:max-w-none ">
      {/* SECTION HEADER */}
      <h2 className="font-rajdhani text-[20px] font-semibold tracking-[-0.4px] text-[#242424] leading-[18px]">
        Delivery Details
      </h2>

      <div className="flex flex-col gap-[4px] w-full">
        {/* 1. EXPANDABLE SELECTION BLOCK */}

        <div
          className="relative flex flex-col rounded-[6px] overflow-hidden transition-[height] duration-350 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] border-[1px]"
          style={{
            height: isExpanded ? '116px' : '46px',
            borderColor: isExpanded ? 'transparent' : '#EAFFCD',
            background: isExpanded
              ? `linear-gradient(#EAFFCD, #EAFFCD) padding-box, 
         linear-gradient(360deg, #5e9756 10%, #8aaf85 0%, #efefef 80%, #fafafa 100%) border-box`
              : '#EAFFCD'
          }}
        >
          {/* Trigger Row */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-[46px] w-full items-center justify-between px-[12px] py-[14px] outline-none z-10"
          >
            <div className="flex items-center gap-[6px]">
              <HomeIcon className="w-[16px] h-[16px] text-[#242424]" />
              <div className="flex items-center gap-[6px]">
                <span className="font-rajdhani text-[16px] font-semibold leading-[16px] tracking-[-0.2px] text-[#242424]">
                  Home Delivery
                </span>
                <span className="font-rajdhani text-[16px] font-[500] leading-[16px] tracking-[-0.2px] text-[#515151]">
                  Kathmandu, Nepal
                </span>
              </div>
            </div>
            <div className={`w-[18px] h-[18px] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
              <ArrowIcon className="w-full h-full text-black" />
            </div>
          </button>

          {/* Options Row (Visible on Expand) */}
          <div className={`grid w-full transition-all duration-400 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="flex flex-row w-full h-[70px] bg-white items-stretch">

                <div
                  onClick={() => setDeliveryType('home')}
                  className="flex flex-1 items-start gap-[12px] px-[12px] pt-[18px] cursor-pointer"
                >
                  <div className="flex items-center justify-center w-[16px] h-[20px]">
                    <div className={`w-[16px] h-[16px] rounded-[6px] flex items-center justify-center transition-all duration-200 ${deliveryType === 'home' ? 'bg-[#3F9733] shadow-[0_0_0_3px_#D6FFB2]' : 'border border-[#9C9C9C]'}`}>
                      {deliveryType === 'home' && <CheckIcon className="w-[10px] h-[10px] text-white" />}
                    </div>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <span className="font-rajdhani text-[13px] font-semibold leading-[16px] tracking-[-0.2px] text-[#242424]">Home Delivery (Default)</span>
                    <span className="font-rajdhani text-[12px] font-[500] leading-[18px] tracking-[-0.2px] text-[#515151]">Kathmandu, Nepal..</span>
                  </div>
                </div>

                <div
                  onClick={() => setDeliveryType('pickup')}
                  className="flex flex-1 items-start gap-[12px] px-[12px] pt-[18px] border-l border-[#e8e8e8] cursor-pointer"
                >
                  <div className="flex items-center justify-center w-[16px] h-[20px]">
                    <div className={`w-[16px] h-[16px] rounded-[6px] flex items-center justify-center transition-all duration-200 ${deliveryType === 'pickup' ? 'bg-[#3F9733] shadow-[0_0_0_3px_#D6FFB2]' : 'border border-[#9C9C9C]'}`}>
                      {deliveryType === 'pickup' && <CheckIcon className="w-[10px] h-[10px] text-white" />}
                    </div>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <span className="font-rajdhani text-[13px] font-semibold leading-[16px] tracking-[-0.2px] text-[#242424]">Pickup</span>
                    <span className="font-rajdhani text-[12px] font-[500] leading-[18px] tracking-[-0.2px] text-[#515151]">Via Nearest Branch</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Delivery Date Row */}
        <div className="flex items-center gap-[6px] self-stretch rounded-[6px] bg-gray-50 px-[12px] py-[14px]">
          <VanIcon className="h-[18px] w-[18px] text-[#242424] flex-shrink-0" />
          <span className="font-rajdhani text-[16px] font-semibold tracking-[-0.2px] text-[#242424] leading-[16px]">
            {getDeliveryText()}
          </span>
        </div>

        {/* Seller Info Row */}
        <div className="relative flex items-start gap-[6px] self-stretch rounded-[6px] bg-gray-50 px-[12px] py-[14px]">
          <StoreIcon className="h-[18px] w-[18px] text-[#242424] flex-shrink-0 mt-[1px]" />
          <div className="flex flex-col items-start justify-center gap-[4px]">
            <span className="font-rajdhani text-[16px] font-semibold tracking-[-0.2px] text-[#242424] leading-[16px]">
              Fullfilled By {seller?.name || 'Official Store'}
            </span>
            <span className="font-rajdhani text-[12px] font-medium text-[#242424] opacity-70 leading-[16px]">
              {seller?.is_verified ? 'Authenticity Granted | Genuine Seller' : 'Platform Verified Seller'}
            </span>
            <Link
              href="/seller"
              className="absolute right-[12px] bottom-[14px] mt-[4px] font-rajdhani text-[12px] font-medium underline text-[#242424] decoration-1 underline-offset-2"
            >
              Know More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryDetails;
