'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface WalletPaymentDetailsProps {
  onPlaceOrder: (wallet: string) => void;
}

const WALLETS = [
  {
    id: 'fonepay',
    name: 'Fonepay',
    image: '/images/payments/fonepay.png',
    label: 'Fonepay',
  },
  {
    id: 'esewa',
    name: 'Esewa',
    image: '/images/payments/esewa.png',
    label: 'Esewa',
  },
  {
    id: 'khalti',
    name: 'Khalti',
    image: '/images/payments/khalti.png',
    label: 'Khalti',
  }
];

const WalletPaymentDetails: React.FC<WalletPaymentDetailsProps> = ({ onPlaceOrder }) => {
  const [selectedWallet, setSelectedWallet] = useState('esewa');

  const handleWalletSelect = (id: string) => {
    setSelectedWallet(id);
  };

  return (
    <div className="flex w-full flex-col gap-[16px] items-start transition-all duration-300 pt-[8px]">
      
      {/* Wallet Selection Grid */}
      <div className="flex w-full gap-[16px] justify-center items-center">
        {WALLETS.map((wallet) => {
          const isActive = selectedWallet === wallet.id;
          
          return (
            <button
              key={wallet.id}
              onClick={(e) => {
                e.stopPropagation();
                handleWalletSelect(wallet.id);
              }}
              type="button"
              className={`relative flex flex-1 items-center p-[2px] rounded-[12px] border-[1.5px] transition-all duration-300 outline-none ${
                isActive ? 'border-transparent' : 'border-[#e2e8f0]'
              }`}
              style={isActive ? {
                background: `linear-gradient(#fafff3, #fafff3) padding-box, 
                             linear-gradient(90deg, #3F9733 10%, #8aaf85 30%, #dae7d5ff 90%, #d6e6d1ff 100%) border-box`
              } : {}}
            >
              {/* Logo Container */}
              <div className={`relative h-[56px] w-full overflow-hidden rounded-[10px] transition-colors duration-300 ${
                isActive ? 'bg-transparent' : 'bg-[#f8f8f8]'
              }`}>
                <Image 
                  src={wallet.image} 
                  alt={wallet.name} 
                  fill 
                  className="object-cover rounded-[12px]"
                  sizes="(max-width: 412px) 33vw, 50px"
                />
              </div>

              {/* Absolute Positioned Label */}
              <div className="absolute top-[-7px] left-[8px] flex h-[14px] items-center justify-center bg-white px-[4px] z-10">
                <span className="font-titillium text-[10px] font-normal leading-[14px] tracking-[-0.2px] text-[#444444] whitespace-nowrap">
                  {wallet.label}
                </span>
              </div>

              {/* Selected Indicator Dot */}
              {isActive && (
                <motion.div 
                  layoutId="activeWalletDot"
                  className="absolute -bottom-1 -right-1 z-20 h-3 w-3 rounded-full bg-[#3f9633] border-2 border-white"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer & Action Button */}
      <div className="flex w-full flex-col gap-[15px] items-start">
        <div className="flex w-full min-w-0 justify-center items-center px-[2px]">
          <span className="flex-1 font-titillium text-[14px] font-normal leading-[20px] text-[#535353] text-left">
            Faster checkout with available wallets
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlaceOrder(selectedWallet);
          }}
          type="button"
          className="flex w-full h-[48px] items-center justify-center bg-[#ffe900] active:bg-[#f5e000] rounded-[12px] transition-all active:scale-[0.98] outline-none "
        >
          <span className="font-titillium text-[16px] font-semibold leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
            Pay Via {WALLETS.find(w => w.id === selectedWallet)?.name}
          </span>
        </button>
      </div>
    </div>
  );
};

export default WalletPaymentDetails;