'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import DropDownIcon from '@/components/icons/DropDownIcon';
import CreditCardIcon from '@/components/icons/CardIcon';
import NetBankingIcon from '@/components/icons/BankingIcon';
import WalletIcon from '@/components/icons/WalletIcon';
import QRIcon from '@/components/icons/QRIcon';
import PaymentOption from './PaymentOption';
import CodPaymentDetails from './CodPaymentDetails';
import WalletPaymentDetails from './WalletPaymentDetails';
import QrPaymentDetails from './QRPaymentDetails';
import CardPaymentDetails from './CardPaymentDetails';
import NetbankingPaymentDetails from './NetbankingPaymentDetails';

interface PaymentSectionProps {
  isOpen: boolean;
  isConfirmed: boolean;
  disabled?: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: () => void;
  onPlaceOrder: (data?: { qrFile?: File | null; qrRemarks?: string }) => void;
  onQrDataChange?: (data: { file: File | null; remarks: string }) => void;
  initialQrData?: { file: File | null; remarks: string };
  hasQrError?: boolean;
  externalError?: string | null;
  excludeOptions?: string[];
  totalAmount?: string;
  codFee?: number;
  isProcessing?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  isOpen,
  isConfirmed,
  disabled = false,
  selectedId,
  onSelect,
  onToggle,
  onPlaceOrder,
  onQrDataChange,
  initialQrData,
  hasQrError = false,
  externalError,
  excludeOptions = [],
  totalAmount,
  codFee = 40,
  isProcessing = false
}) => {
  return (
    <div className={`w-full bg-white rounded-[20px] shadow-none overflow-hidden transition-all duration-300 ${
      disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
    }`}>

      {/* SECTION HEADER */}
      <button
        onClick={onToggle}
        disabled={disabled}
        type="button"
        className="flex w-full justify-between items-center px-[20px] sm:px-[24px] py-[18px] sm:py-[20px] bg-white transition-colors duration-200 outline-none"
      >
        <div className="flex items-center gap-[10px] sm:gap-[12px]">
          <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-rajdhani text-[13px] font-bold shrink-0 transition-colors ${
            isConfirmed ? 'bg-[#308026] text-white' : 'bg-[#242424] text-white'
          }`}>
            {isConfirmed ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              '3'
            )}
          </div>
          <h2 className="font-rajdhani text-[18px] sm:text-[19px] font-bold leading-tight tracking-tight text-[#18181b]">
            Payments
          </h2>
          {isConfirmed && !isOpen && !disabled && (
            <div className="flex px-[8px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[6px]">
              <span className="font-rajdhani text-[12px] font-semibold text-[#166534] tracking-tight whitespace-nowrap">
                Ready to Pay
              </span>
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <DropDownIcon className="w-[18px] h-[18px] text-[#18181b]" />
        </motion.div>
      </button>

      {/* SECTION CONTENT */}
      <AnimatePresence initial={false}>
        {isOpen && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
            className="w-full overflow-hidden"
          >
            <div id="checkout-payment-options" className="w-full flex flex-col gap-[22px] px-[20px] sm:px-[24px] pb-[28px] pt-[16px] bg-white border-t border-[#f0f3ee]">

              {/* TOP Validation Error Banner for Payment */}
              <AnimatePresence>
                {externalError && (
                  <motion.div
                    id="checkout-payment-error"
                    initial={{ height: 0, opacity: 0, y: -6 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -6 }}
                    className="flex items-center gap-[8px] p-[10px_14px] bg-[#fff5f5] border border-[#fecaca] rounded-[10px] text-[#e11717] mb-[2px]"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#e11717]" />
                    <span className="font-rajdhani text-[14px] font-semibold tracking-[-0.2px]">
                      {externalError}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ONLINE PAYMENTS GROUP */}
              <div className="flex flex-col gap-[14px]">
                <span className="font-rajdhani text-[17px] font-bold leading-[22px] text-[#18181b] tracking-[-0.3px]">
                  Online Payments
                </span>
                <div className="flex flex-col gap-[12px]">
                  <PaymentOption
                    id="cards"
                    label="Credit/Debit Cards"
                    icon={<CreditCardIcon />}
                    isActive={selectedId === 'cards'}
                    onSelect={onSelect}
                    error="This payment method is currently unavailable"
                  >
                    <CardPaymentDetails />
                  </PaymentOption>

                  <PaymentOption
                    id="netbanking"
                    label="Net Banking"
                    icon={<NetBankingIcon />}
                    isActive={selectedId === 'netbanking'}
                    onSelect={onSelect}
                    error="This payment method is currently unavailable"
                  >
                    <NetbankingPaymentDetails />
                  </PaymentOption>

                  <PaymentOption
                    id="wallets"
                    label="Wallets"
                    icon={<WalletIcon />}
                    isPopular={true}
                    isActive={selectedId === 'wallets'}
                    onSelect={onSelect}
                    error="This payment method is currently unavailable"
                    badge="Rs 25 Off"
                  >
                    <WalletPaymentDetails 
                      onPlaceOrder={() => onPlaceOrder()} 
                      totalAmount={totalAmount}
                      isProcessing={isProcessing}
                    />
                  </PaymentOption>
                </div>
              </div>

              {/* OTHER PAYMENTS GROUP */}
              <div className="flex flex-col gap-[24px]">
                <span className="font-rajdhani text-[18px] font-semibold leading-[24px] text-[#242424] tracking-[-0.72px]">
                  Other Payments
                </span>
                <div className="flex flex-col gap-[12px]">
                  <PaymentOption
                    id="qr"
                    label={totalAmount ? `Pay via QR ( ${totalAmount} )` : "Pay via QR"}
                    icon={<QRIcon />}
                    isActive={selectedId === 'qr'}
                    onSelect={onSelect}
                    badge="Rs 25 Off"
                  >
                    <QrPaymentDetails
                      initialFile={initialQrData?.file}
                      initialRemarks={initialQrData?.remarks}
                      onChange={onQrDataChange}
                      hasError={hasQrError}
                      onVerify={(data) => {
                        onPlaceOrder({ qrFile: data.file, qrRemarks: data.remarks });
                      }}
                      totalAmount={totalAmount}
                      isProcessing={isProcessing}
                    />
                  </PaymentOption>

                  {/* PAY ON DELIVERY - Swapped CodIcon for next/image */}
                  {!excludeOptions.includes('cod') && (
                    <PaymentOption
                      id="cod"
                      label="Pay Upon Delivery"
                      icon={
                        <div className="relative w-[18px] h-[18px]">
                          <Image
                            src="/images/cod.png"
                            alt="Cash on Delivery"
                            fill
                            className="object-contain"
                            sizes="18px"
                          />
                        </div>
                      }
                      isActive={selectedId === 'cod'}
                      onSelect={onSelect}
                      badge={`+ Rs ${codFee} Fee`}
                      badgeType="fee"
                    >
                      <CodPaymentDetails handlingFee={codFee} onPlaceOrder={onPlaceOrder} isProcessing={isProcessing} />
                    </PaymentOption>
                  )}
                </div>
              </div>

              {/* Validation Error Message for Payment */}
              <AnimatePresence>
                {externalError && !selectedId && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-[12px] font-semibold text-[#ef4444] px-[2px] mt-[-12px] mb-[12px]"
                  >
                    {externalError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentSection;
