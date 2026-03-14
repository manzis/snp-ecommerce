'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HomeIcon from '@/components/icons/HomeIcon';
import VanIcon from '@/components/icons/VanIcon';
import StoreIcon from '@/components/icons/StoreIcon';
import ArrowIcon from '@/components/icons/ChevronLeftIcon';
import CheckIcon from '@/components/icons/TickIcon';

const DeliveryDetails: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home' | 'pickup'>('home');

  return (
    <section className="flex flex-col gap-[16px] w-full max-w-[700px] lg:max-w-none">
      {/* SECTION HEADER */}
      <h2 className="font-titillium text-[20px] font-semibold tracking-[-0.4px] text-[#242424] leading-[18px]">
        Delivery Details
      </h2>

      <div className="flex flex-col gap-[4px] w-full">
        {/* 1. EXPANDABLE SELECTION BLOCK */}

  <div 
  className="relative flex flex-col rounded-[6px] overflow-hidden transition-[height] duration-350 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] border-[1px]"
  style={{
    height: isExpanded ? '116px' : '46px',
    /* 
       Logic: 
       - If expanded: Use the layered gradient (padding-box for fill, border-box for stroke).
       - If collapsed: Use a simple solid fill and match the border color to the background.
    */
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
              <span className="font-titillium text-[16px] font-semibold leading-[16px] tracking-[-0.02em] text-[#242424]">
                Home Delivery
              </span>
              <span className="font-titillium text-[16px] font-[300] leading-[16px] tracking-[-0.02em] text-[#242424]">
                Kathmandu, Baneshwor, 40
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
    {/* items-stretch forces children to 70px height, allowing the border to touch top and bottom */}
    <div className="flex flex-row w-full h-[70px] bg-white items-stretch">
      
      {/* Home Option - items-start keeps checkbox at the top */}
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
          <span className="font-titillium text-[13px] font-semibold leading-[16px] tracking-[-0.02em]">Home Delivery (Default)</span>
          <span className="font-titillium text-[12px] font-[300] leading-[18px] tracking-[-0.02em]">Kathmandu, Nepal..</span>
        </div>
      </div>

      {/* Pickup Option - border-l touches full 70px because of items-stretch */}
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
          <span className="font-titillium text-[13px] font-semibold leading-[16px] tracking-[-0.02em]">Pickup</span>
          <span className="font-titillium text-[12px] font-[300] leading-[18px] tracking-[-0.02em]">Via Nearest Branch</span>
        </div>
      </div>

    </div>
  </div>
</div>
        
      </div>

        {/* Delivery Date Row */}
        <div className="flex items-center gap-[6px] self-stretch rounded-[6px] bg-[#efefef] px-[12px] py-[14px]">
          <VanIcon className="h-[18px] w-[18px] text-[#242424] flex-shrink-0" />
          <span className="font-titillium text-[16px] font-semibold tracking-[-0.32px] text-[#242424] leading-[16px]">
            Delivery By 14 March, Sat
          </span>
        </div>

        {/* Seller Info Row */}
        <div className="relative flex items-start gap-[6px] self-stretch rounded-[6px] bg-[#efefef] px-[12px] py-[14px]">
          <StoreIcon className="h-[18px] w-[18px] text-[#242424] flex-shrink-0 mt-[1px]" />
          <div className="flex flex-col items-start justify-center gap-[4px]">
            <span className="font-titillium text-[16px] font-semibold tracking-[-0.32px] text-[#242424] leading-[16px]">
              Fullfilled By Bright Nepcare Pvt. Ltd.
            </span>
            <span className="font-titillium text-[12px] font-light text-[#242424] opacity-70 leading-[16px]">
              Authencity Granted | Genuine Seller
            </span>
            <Link 
              href="/seller" 
              className="absolute right-[12px] bottom-[14px] mt-[4px] font-titillium text-[12px] font-normal underline text-[#242424] decoration-1 underline-offset-2"
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