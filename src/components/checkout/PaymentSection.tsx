'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  excludeOptions = []
}) => {
  return (
    <div className={`main-container mx-auto flex w-full max-w-[412px] flex-col items-start border-t border-[#f1f5f9] lg:max-w-none transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>

      {/* SECTION HEADER */}
      <button
        onClick={onToggle}
        disabled={disabled}
        type="button"
        className={`flex w-full justify-between items-center px-[24px] transition-colors duration-300 outline-none ${isOpen ? 'bg-[#fafbfc] py-[24px]' : 'bg-white py-[24px]'
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
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <DropDownIcon className="w-[18px] h-[18px] text-[#242424]" />
        </motion.div>
      </button>

      {/* SECTION CONTENT */}
      <AnimatePresence initial={false}>
        {isOpen && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="w-full  overflow-hidden"
          >
            <div className="flex flex-col gap-[24px] px-[24px] pb-[32px] pt-[24px] bg-white rounded-[24px_24px_0_0] border-t border-[#f1f5f9]">

              {/* ONLINE PAYMENTS GROUP */}
              <div className="flex flex-col gap-[24px]">
                <span className="font-titillium text-[18px] font-semibold leading-[24px] text-[#242424] tracking-[-0.07px]">
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
                  >
                    <WalletPaymentDetails onPlaceOrder={() => onPlaceOrder()} />
                  </PaymentOption>
                </div>
              </div>

              {/* OTHER PAYMENTS GROUP */}
              <div className="flex flex-col gap-[24px]">
                <span className="font-titillium text-[18px] font-semibold leading-[24px] text-[#242424] tracking-[-0.72px]">
                  Other Payments
                </span>
                <div className="flex flex-col gap-[12px]">
                  <PaymentOption
                    id="qr"
                    label="Pay Via QR"
                    icon={<QRIcon />}
                    isActive={selectedId === 'qr'}
                    onSelect={onSelect}
                  >
                    <QrPaymentDetails
                      initialFile={initialQrData?.file}
                      initialRemarks={initialQrData?.remarks}
                      onChange={onQrDataChange}
                      hasError={hasQrError}
                      onVerify={(data) => {
                        onPlaceOrder({ qrFile: data.file, qrRemarks: data.remarks });
                      }}
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
                            src="/images/cod-icon.png"
                            alt="Cash on Delivery"
                            fill
                            className="object-contain"
                            sizes="18px"
                          />
                        </div>
                      }
                      isActive={selectedId === 'cod'}
                      onSelect={onSelect}
                    >
                      <CodPaymentDetails handlingFee={13} onPlaceOrder={onPlaceOrder} />
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
