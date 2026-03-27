'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';
import CreditCardIcon from '@/components/icons/CardIcon';
import NetBankingIcon from '@/components/icons/BankingIcon';
import WalletIcon from '@/components/icons/WalletIcon';
import QRIcon from '@/components/icons/QRIcon';
import CodIcon from '@/components/icons/CodIcon';
import PaymentOption from './PaymentOption';
import CodPaymentDetails from './CodPaymentDetails';

interface PaymentSectionProps {
  isOpen: boolean;
  isConfirmed: boolean;
  disabled?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: () => void;
  onPlaceOrder: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  isOpen,
  isConfirmed,
  disabled = false,
  selectedId,
  onSelect,
  onToggle,
  onPlaceOrder
}) => {
  return (
    <div className={`main-container mx-auto flex w-full max-w-[412px] flex-col items-start bg-white border-t border-[#f1f5f9] lg:max-w-none transition-all duration-300 ${
      disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
    }`}>
      
      {/* HEADER */}
      <button 
        onClick={onToggle}
        disabled={disabled}
        type="button"
        className={`flex w-full justify-between items-center px-[24px] transition-colors duration-300 outline-none ${
          isOpen ? 'bg-[#fafbfc] py-[24px]' : 'bg-white py-[24px]'
        }`}
      >
        <div className="flex items-center gap-[12px]">
          <h2 className="font-titillium text-[20px] font-semibold leading-[30px] tracking-[-0.8px] text-[#242424]">
            Payments
          </h2>
          {isConfirmed && !isOpen && !disabled && (
            <div className="flex px-[6px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[4px]">
              <span className="font-titillium text-[12px] leading-[12px] text-[#575757] tracking-[-0.48px] whitespace-nowrap">
                Ready to Pay
              </span>
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <DropDownIcon className="w-[18px] h-[18px] text-[#242424]" />
        </motion.div>
      </button>

      {/* CONTENT */}
      <AnimatePresence initial={false}>
        {isOpen && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-col gap-[24px] px-[24px] pb-[32px] pt-[24px] bg-white rounded-[24px_24px_0_0] border-b border-[#f1f5f9]">
              
              <div className="flex flex-col gap-[24px]">
                <span className="font-titillium text-[18px] font-semibold leading-[24px] text-[#242424]">Online Payments</span>
                <div className="flex flex-col gap-[12px]">
                  <PaymentOption id="cards" label="Credit/Debit Cards" icon={<CreditCardIcon />} isActive={selectedId === 'cards'} onSelect={onSelect} />
                  <PaymentOption id="netbanking" label="Net Banking" icon={<NetBankingIcon />} isActive={selectedId === 'netbanking'} onSelect={onSelect} />
                  <PaymentOption id="wallets" label="Wallets" icon={<WalletIcon />} isPopular={true} isActive={selectedId === 'wallets'} onSelect={onSelect} />
                </div>
              </div>

              <div className="flex flex-col gap-[24px]">
                <span className="font-titillium text-[18px] font-semibold leading-[24px] text-[#242424]">Other Payments</span>
                <div className="flex flex-col gap-[12px]">
                  <PaymentOption id="qr" label="Pay Via QR" icon={<QRIcon />} isActive={selectedId === 'qr'} onSelect={onSelect} />
                  
                  {/* Now just a normal PaymentOption */}
                  <PaymentOption 
                    id="cod" 
                    label="Pay Upon Delivery" 
                    icon={<CodIcon />} 
                    isActive={selectedId === 'cod'} 
                    onSelect={onSelect}
                  >
                    <CodPaymentDetails handlingFee={13} onPlaceOrder={onPlaceOrder} />
                  </PaymentOption>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSection;