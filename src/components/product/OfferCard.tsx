'use client';

import React, { useState, useEffect } from 'react';
import TicketIcon from '@/components/icons/TicketIcon';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';

const OffersCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const [coupons, setCoupons] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCoupons() {
      const { fetchActiveCoupons } = await import('@/services/productService');
      const data = await fetchActiveCoupons();
      // Transform for UI
      const mapped = data.map(c => ({
        code: c.code,
        detail: c.description || (c.type === 'percentage' ? `Get ${c.value}% off on your order.` : `Flat Rs. ${c.value} off on your order.`)
      }));
      setCoupons(mapped);
      setLoading(false);
    }
    loadCoupons();
  }, []);

  const handleCopy = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!mounted) return <div className=" h-[82px]  bg-white rounded-[12px] shadow-sm" />;

  return (

    <div
      className="relative flex w-full max-w-[700px]  lg:max-w-none flex-col items-start gap-[2px] rounded-[12px] shadow-[0px_1px_2px_rgba(16,24,40,0.04)] overflow-hidden transition-all duration-500 transition-bounce"
      style={{
        background: 'linear-gradient(269.37deg, #EAFFCD -1.23%, #FFFFFF 112.02%)',
      }}
    >
      {/* 
          HEADER SECTION (FRAME 93) 
          - Logic: justify-between for far-left and far-right pinning
          - Style: Diagonal Gradient Inside Border
      */}
      <button
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        className="group relative flex h-[40px]  w-full flex-row items-center justify-between rounded-[12px] p-[8px] shadow-[0px_1px_2px_rgba(16,24,40,0.04)] outline-none z-20 border-[1px] border-transparent"
        style={{
          background: `
      linear-gradient(white, white) padding-box, 
      linear-gradient(30deg, #3F9733 10%, #3F9733 10%, #E5E5E5 80%, #E5E5E5 100%) border-box
    `,
        }}
      >
        {/* Left Side: Icon + Label Group */}
        <div className="flex flex-row items-center gap-[12px]">
          <TicketIcon className="h-[24px] w-[24px] flex-shrink-0" />
          <span className="font-titillium text-[18px] font-semibold leading-[18px] text-[#242424]">
            Available Offers For you
          </span>
        </div>

        {/* Right Side: Rotatable Chevron */}
        <div
          className={`h-[20px] w-[20px] flex-shrink-0 transition-transform duration-500 transition-bounce
            ${isExpanded ? 'rotate-90' : 'rotate-0'}
          `}
        >
          <ChevronLeftIcon className="h-full w-full text-black" />
        </div>
      </button>

      {/* 
          DYNAMIC COLLAPSIBLE AREA
          - grid-rows-[0fr] -> grid-rows-[1fr]
          - This is the secret for smooth transition to 'height: auto'
      */}
      <div
        className={`
          grid w-full transition-all duration-500 transition-bounce
          ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
        `}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-0 py-[6px]">
            {coupons.map((coupon, index) => {
              const isThisCopied = copiedCode === coupon.code;
              return (
                <div
                  key={index}
                  className="flex h-[58px] w-full flex-row items-center gap-[12px] p-[12px] border-b border-[#242424]/5 last:border-none"
                >
                  {/* COUPON CODE - 8px fixed padding, never squishes */}
                  <div className="flex h-[34px] min-w-[63px] flex-shrink-0 items-center justify-center rounded-[4px] border border-dashed border-[#318126] px-[8px] bg-white/40">
                    <span className="font-titillium text-[14px] font-semibold leading-[18px] tracking-[0.09em] text-[#242424] uppercase">
                      {coupon.code}
                    </span>
                  </div>

                  {/* COUPON DETAILS - Flex Fill Middle */}
                  <div className="flex-1 font-titillium text-[13px] font-[400] leading-[15px] text-[#242424] line-clamp-2">
                    {coupon.detail}
                  </div>

                  {/* COPY BUTTON - Premium state feedback */}
                  <button
                    className={`
                      flex h-[32px] min-w-[60px] flex-shrink-0 items-center justify-center rounded-[6px] border px-[10px] shadow-[0px_1px_2px_rgba(16,24,40,0.04)] 
                      transition-all duration-200 active:scale-90
                      ${isThisCopied
                        ? 'bg-[#3F9733] border-[#3F9733] scale-105'
                        : 'bg-white border-[#EAEBF0]'}
                    `}
                    onClick={(e) => handleCopy(e, coupon.code)}
                  >
                    <span className={`font-titillium text-[13px] font-[400] leading-[16px] tracking-[0.1px] transition-colors duration-200 ${isThisCopied ? 'text-white' : 'text-[#252525]'}`}>
                      {isThisCopied ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 
          COLLAPSED SUBTEXT 
          - Only visible when height is small
          - Transition ensures it doesn't overlap coupons during expansion
      */}
      <div
        className={`
          w-full flex h-[36px]  items-center justify-center px-[12px] pb-[12px] pt-[8px] transition-all duration-300
          ${isExpanded ? 'hidden h-0 opacity-0' : 'flex h-[36px] opacity-100'}
        `}
      >
        <span className="font-titillium text-[18px] font-[300] leading-[18px] text-[#242424] ">
          Apply offers for maximum Savings
        </span>
      </div>
    </div>

  );
};

export default OffersCard;