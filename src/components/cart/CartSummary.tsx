'use client';

import React from 'react';
import DropDownIcon from '@/components/icons/DropDownIcon';

const CartSummary = () => {
  return (
    <section className="flex w-full flex-col bg-white mt-[12px]">
      <div className="flex flex-col border-t border-[#f1f5f9]">
        {/* MRP */}
        <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#f1f5f9]">
          <span className="font-titillium text-[16px] text-[#242424]">MRP</span>
          <span className="font-titillium text-[16px] text-[#242424] text-right">NPR 2000</span>
        </div>

        {/* Discounts */}
        <div className="flex justify-between items-center px-[24px] py-[18px] border-b border-[#f1f5f9]">
          <div className="flex items-center gap-[4px]">
            <span className="font-titillium text-[16px] text-[#242424]">Discounts</span>
            <DropDownIcon className="h-[16px] w-[16px] text-[#242424]" />
          </div>
          <span className="font-titillium text-[16px] text-[#242424] text-right">- NPR 2000</span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center px-[24px] py-[18px]">
          <span className="font-titillium text-[16px] font-semibold text-[#242424]">Sub Total Amount</span>
          <span className="font-titillium text-[16px] font-semibold text-[#242424]">NPR 2000</span>
        </div>
      </div>

      {/* Savings Highlight */}
      <div className="px-[24px] pb-[16px]">
        <div className="flex items-center justify-center rounded-[12px] bg-[#eaffcc] py-[14px]">
          <span className="font-titillium text-[16px] tracking-[-0.64px] text-[#242424]">
            You will save NPR 1450 on this order
          </span>
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-[24px] pb-[16px]">
        <p className="font-titillium text-[14px] text-[#8b8e92] leading-[20px] tracking-[-0.56px]">
          Note:     Additional Charges such as shipping Fees are calculated at Checkout
        </p>
      </div>
    </section>
  );
};

export default CartSummary;