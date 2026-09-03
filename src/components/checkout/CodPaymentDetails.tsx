'use client';

import React from 'react';

interface CodPaymentDetailsProps {
  handlingFee?: number;
  onPlaceOrder: () => void;
  isProcessing?: boolean;
}

const CodPaymentDetails: React.FC<CodPaymentDetailsProps> = ({
  handlingFee = 23,
  onPlaceOrder,
  isProcessing = false
}) => {
  return (
    <div className="flex w-full flex-col gap-[15px] items-start transition-all duration-300">
      {/* Note Section */}
      <div className="flex w-full min-w-0 gap-[10px] justify-center items-center self-stretch">
        <span className="flex flex-1 font-rajdhani text-[14px] font-medium leading-[20px] text-[#535353] text-left">
          Due to Cash handling Fees, NPR {handlingFee} will be added for pay on delivery orders
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isProcessing) {
            onPlaceOrder();
          }
        }}
        disabled={isProcessing}
        type="button"
        className={`flex w-full min-w-0 h-[48px] py-[12px] gap-[10px] justify-center items-center self-stretch rounded-[12px] transition-all outline-none border-none ${
          isProcessing
            ? 'bg-[#e2e8f0] cursor-not-allowed opacity-75'
            : 'bg-[#ffe900] active:bg-[#f5e000] active:scale-[0.98]'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#242424] border-t-transparent" />
            <span className="font-rajdhani text-[16px] font-semibold leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
              Placing Order...
            </span>
          </div>
        ) : (
          <span className="font-rajdhani text-[16px] font-semibold leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
            Place Order ( Pay on Delivery)
          </span>
        )}
      </button>
    </div>
  );
};

export default CodPaymentDetails;
