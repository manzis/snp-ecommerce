'use client';

import React from 'react';
import ChangeIcon from '@/components/icons/ChangeIcon';

interface DeliveryAddressProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  name?: string;
  phoneSuffix?: string;
  address?: string;
  type?: string;
  onChange: () => void;
  onLogin: () => void;
  onCreate: () => void;
  hasAddresses: boolean;
}

const DeliveryAddress: React.FC<DeliveryAddressProps> = ({
  isLoggedIn,
  isLoading,
  name,
  phoneSuffix,
  address,
  type,
  onChange,
  onLogin,
  onCreate,
  hasAddresses
}) => {
  return (
    <section className="flex flex-col w-full bg-white border-t border-[#f1f5f9] px-[24px] py-[24px] relative">
      <div className="flex items-center justify-between">
        <div className="flex flex-col flex-1 min-w-0">
          <div className="font-titillium text-[16px] leading-[24px] tracking-[-0.64px] text-[#242424]">
            <span className="font-semibold">Delivery to : </span>
            {isLoading ? (
              <span className="text-[#8a8e91] animate-pulse">Checking status...</span>
            ) : !isLoggedIn ? (
              <span className="text-[#8a8e91]">Login to view saved address</span>
            ) : hasAddresses ? (
              <span>{name}...{phoneSuffix}</span>
            ) : (
              <span className="text-[#8a8e91]">No saved addresses</span>
            )}
          </div>
          {isLoggedIn && hasAddresses && address && (
            <span className="font-titillium text-[16px] text-[#8a8e91] leading-[28px] tracking-[-0.6px] truncate">
              {address}
            </span>
          )}
        </div>

        {/* Home/Work/Other Badge - Only if logged in and has address */}
        {isLoggedIn && hasAddresses && type && (
          <div className="hidden lg:flex lg:ms-4 h-[24px] w-fit items-center justify-center rounded-[6px] bg-[#e8f5e7] px-[8px] shrink-0 self-start mt-[1px]">
            <span className="font-titillium text-[14px] text-[#242424] tracking-[-0.56px]">{type}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="ml-[12px] shrink-0">
          {isLoading ? (
            <div className="w-[80px] h-[36px] bg-[#f1f5f9] animate-pulse rounded-[6px]" />
          ) : !isLoggedIn ? (
            <button
              onClick={onLogin}
              className="flex items-center gap-[6px] rounded-[6px] border border-[#eaebf0] bg-white p-[8px_16px] active:scale-95 transition-transform"
            >
              <span className="font-titillium text-[14px] font-semibold text-[#6a6c6e]">Login</span>
            </button>
          ) : !hasAddresses ? (
            <button
              onClick={onCreate}
              className="flex items-center gap-[6px] rounded-[6px] border border-[#eaebf0] bg-white p-[8px_16px] active:scale-95 transition-transform"
            >
              <span className="font-titillium text-[14px] font-semibold text-[#6a6c6e]">Create</span>
            </button>
          ) : (
            <button
              onClick={onChange}
              className="flex items-center gap-[6px] rounded-[6px] border border-[#eaebf0] bg-white p-[8px_12px] active:scale-95 transition-transform"
            >
              <span className="font-titillium text-[14px] font-semibold text-[#6a6c6e]">Change</span>
              <ChangeIcon className="h-[16px] w-[16px] text-[#6a6c6e]" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default DeliveryAddress;