'use client';

import React from 'react';
import { Home, ChevronDown } from 'lucide-react';

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
  const handleClick = () => {
    if (!isLoggedIn) {
      onLogin();
    } else if (!hasAddresses) {
      onCreate();
    } else {
      onChange();
    }
  };

  const displayName = !isLoggedIn
    ? 'Select Delivery Address'
    : isLoading
    ? 'Loading address...'
    : hasAddresses && name
    ? name
    : 'Add Delivery Address';

  const displaySubtitle = !isLoggedIn
    ? 'Login to view or select saved addresses'
    : isLoading
    ? 'Fetching your location...'
    : hasAddresses && address
    ? address
    : 'Tap here to add a new delivery address';

  return (
    <section className="w-full bg-white rounded-b-[20px] sm:rounded-b-[24px] px-[16px] sm:px-[20px] lg:px-[24px] pt-[16px] pb-[14px] sm:pt-[18px] sm:pb-[14px] lg:pt-[20px] lg:pb-[16px] shadow-none flex items-center justify-between gap-3 transition-all">
      {/* Clickable Address Area */}
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer group select-none text-left"
      >
        <div className="w-[20px] h-[20px] mt-0.5 flex items-center justify-center text-[#18181b] shrink-0">
          <Home className="w-[18px] h-[18px] stroke-[1.8] text-[#18181b]" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {/* Name + Chevron */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-rajdhani font-bold text-[17px] sm:text-[18px] text-[#18181b] leading-tight truncate group-hover:text-[#308026] transition-colors">
              {displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-[#71717a] group-hover:translate-y-0.5 transition-transform shrink-0" />
            {type && hasAddresses && isLoggedIn && (
              <span className="font-rajdhani text-[11px] font-semibold uppercase tracking-wider bg-[#f4f4f5] text-[#52525b] px-2 py-0.5 rounded-[4px]">
                {type}
              </span>
            )}
          </div>

          {/* Full address preview */}
          <p className="font-rajdhani font-medium text-[14px] text-[#71717a] leading-tight truncate mt-1 w-full">
            {displaySubtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DeliveryAddress;
