'use client';

import React from 'react';

interface CodPaymentDetailsProps {
  handlingFee?: number;
  onPlaceOrder: () => void;
}

const CodPaymentDetails: React.FC<CodPaymentDetailsProps> = ({ 
  handlingFee = 13, 
  onPlaceOrder 
}) => {
  return (
    <div className="flex w-full flex-col gap-[15px] items-start transition-all duration-300">
      {/* Note Section */}
      <div className="flex w-full min-w-0 gap-[10px] justify-center items-center self-stretch">
        <span className="flex flex-1 font-titillium text-[14px] font-normal leading-[20px] text-[#535353] text-left">
          Due to Cash handling Fees, NPR {handlingFee} will be added for pay on delivery orders
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlaceOrder();
        }}
        type="button"
        className="flex w-full min-w-0 h-[48px] py-[12px] gap-[10px] justify-center items-center self-stretch bg-[#ffe900] active:bg-[#f5e000] rounded-[12px] transition-all active:scale-[0.98] outline-none border-none "
      >
        <span className="font-titillium text-[16px] font-semibold leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
          Place Order ( Pay on Delivery)
        </span>
      </button>
    </div>
  );
};

export default CodPaymentDetails;
