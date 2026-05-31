import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CloseIcon from '@/components/icons/CloseIcon2';

interface PickupCodWarningModalProps {
  isOpen: boolean;
  mode?: 'pickup-warning' | 'cod-confirm';
  onClose: () => void;
  onSwitchToHomeDelivery?: () => void;
  onPayOnline?: () => void;
  onConfirmOrder?: () => void;
}

const PickupCodWarningModal: React.FC<PickupCodWarningModalProps> = ({
  isOpen,
  mode = 'pickup-warning',
  onClose,
  onSwitchToHomeDelivery,
  onPayOnline,
  onConfirmOrder
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-[16px] backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-[340px] overflow-hidden rounded-[20px] bg-white p-[20px] text-center shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-[16px] top-[16px] flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <CloseIcon className="h-[20px] w-[20px] text-[#3f3f3f]" />
          </button>

          {/* Image */}
          <div className="mx-auto mb-[16px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#f7faf6]">
            {/* You can replace this with your actual image later */}
            <div className="relative h-[48px] w-[48px]">
              <Image
                src={mode === 'pickup-warning' ? "/images/icons/actiondelivery.png" : "/images/icons/cashondelivery.png"}
                alt="Caution"
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
          </div>

          <h2 className="mb-[8px] font-rajdhani text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#242424]">
            {mode === 'pickup-warning' ? 'Action Required' : 'Confirm Cash on Delivery'}
          </h2>
          <p className="mb-[24px] font-rajdhani text-[14px] leading-[20px] text-[#575757]">
            {mode === 'pickup-warning'
              ? (
                <>
                  Pay on delivery is not available for <strong className="text-[#308026] font-bold">Pick from station</strong> orders. Please switch to home delivery or pay online to continue.
                </>
              )
              : (
                <>
                  <strong className="text-[#e11717] font-bold">Rs 23</strong> additional added for Pay on delivery orders.
                </>
              )}
          </p>

          <div className="flex flex-col gap-[10px]">
            {mode === 'pickup-warning' ? (
              <>
                <button
                  onClick={onSwitchToHomeDelivery}
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#ffe900] py-[12px] font-rajdhani text-[15px] font-bold text-[#242424] transition-all active:scale-[0.98] hover:bg-[#f5e000]"
                >
                  Switch to Home delivery
                </button>
                <button
                  onClick={onPayOnline}
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#f1f5f9] py-[12px] font-rajdhani text-[15px] font-bold text-[#242424] transition-all active:scale-[0.98] hover:bg-[#e2e8f0]"
                >
                  Pay online
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onConfirmOrder}
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#ffe900] py-[12px] font-rajdhani text-[15px] font-bold text-[#242424] transition-all active:scale-[0.98] hover:bg-[#f5e000]"
                >
                  Confirm Order
                </button>
                <button
                  onClick={onPayOnline}
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#f1f5f9] py-[12px] font-rajdhani text-[15px] font-bold text-[#242424] transition-all active:scale-[0.98] hover:bg-[#e2e8f0]"
                >
                  Pay online instead
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PickupCodWarningModal;
