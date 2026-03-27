'use client';

import React from 'react';

interface DeliveryMethod {
  id: string;
  title: string;
  price: string;
  desc: string;
}

interface DeliveryMethodSelectorProps {
  methods: DeliveryMethod[];
  selectedMethodId: string;
  onSelect: (id: string) => void;
}

const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({
  methods,
  selectedMethodId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col rounded-[12px] border border-[#eaebf0] overflow-hidden bg-white">
      {/* HEADER */}
      <div className="p-[12px_16px] bg-[#fafbfb] border-b border-[#f1f5f9]">
        <span className="font-titillium text-[18px] font-semibold text-[#242424]">Choose Delivery Options</span>
      </div>

      {/* METHODS LIST */}
      <div className="flex flex-col">
        {methods.map((opt) => (
          <div
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`flex p-[16px] gap-[12px] border-b border-[#eaebf0] last:border-b-0 cursor-pointer transition-colors duration-200 ${
              selectedMethodId === opt.id ? 'bg-[#f7faf6]' : 'hover:bg-[#fafafb]'
            }`}
          >
            {/* Perfected Radio */}
            <div className="flex items-center justify-center w-[18px] h-[18px] mt-[3px] rounded-full border-[2px] border-[#3f9633] transition-all shrink-0">
              {selectedMethodId === opt.id && (
                <div className="w-[8px] h-[8px] bg-[#3f9633] rounded-full" />
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-titillium text-[16px] font-semibold text-[#242424]">
                  {opt.title}
                </span>
                <span className="font-titillium text-[14px] font-semibold text-[#575757] tracking-[1.5px] whitespace-nowrap">
                  {opt.price}
                </span>
              </div>
              <span className="font-titillium text-[14px] text-[#68727d] leading-[20px]">
                {opt.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SHIPPING FOOTNOTE - Removed border-top */}
      <div className="px-[16px] py-[12px] /50">
        <p className="font-titillium text-[13px] leading-[18px] text-[#838383]">
          Shipping Free for orders above NPR 5000, Only applied to full priced items delivery text !!
        </p>
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;