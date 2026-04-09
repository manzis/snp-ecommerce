'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HelpIcon from '@/components/icons/HelpIcon';
import { useUIStore } from '@/store/uiStore';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  savedAmount?: number;
  isProcessing?: boolean;
}

const CANCELLATION_REASONS = [
  "Found a better price elsewhere",
  "Changed my mind",
  "Delivery is taking too long",
  "Ordered by mistake",
  "Other"
];

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  savedAmount = 0, 
  isProcessing = false 
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);

  // Reset state and hide bottom nav when opening
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedReason('');
      setCustomReason('');
      setHideBottomNav(true);
    } else {
      setHideBottomNav(false);
    }
    
    return () => setHideBottomNav(false);
  }, [isOpen, setHideBottomNav]);

  const handleNext = () => setStep(2);

  const handleConfirm = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? onClose : undefined}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col w-full bg-white rounded-t-[24px] overflow-hidden max-h-[85vh]"
          >
            {/* Handle */}
            <div className="flex justify-center p-[16px] shrink-0">
              <button 
                type="button"
                onClick={!isProcessing ? onClose : undefined} 
                className="w-[40px] h-[5px] bg-[#eaebf0] rounded-full" 
              />
            </div>

            <div className="flex flex-col px-[24px] pb-[32px] overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center gap-[24px]"
                  >
                    <div className="flex items-center justify-center w-[64px] h-[64px] bg-[#fff0f0] rounded-full">
                      <HelpIcon className="w-[32px] h-[32px] text-[#d92d20]" />
                    </div>

                    <div className="flex flex-col gap-[8px]">
                      <h2 className="font-titillium font-bold text-[22px] leading-[28px] text-[#242424]">
                        You're about to cancel a limited stock product!
                      </h2>
                      {savedAmount > 0 ? (
                        <p className="font-titillium text-[15px] leading-[22px] text-[#626262]">
                          You have saved <span className="font-bold text-[#308026] tracking-wide">Rs {savedAmount}</span> in this order. You might not get this precise offer next time!
                        </p>
                      ) : (
                        <p className="font-titillium text-[15px] leading-[22px] text-[#626262]">
                          Are you sure you want to cancel this order? Discarding this action cannot be undone.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col w-full gap-[12px] mt-[8px]">
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-[54px] rounded-[12px] bg-[#ffe900] active:scale-[0.98] transition-transform font-titillium font-bold text-[16px] text-[#242424]"
                      >
                        I want to keep the order
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full h-[54px] rounded-[12px] border border-[#eaebf0] active:scale-[0.98] transition-transform font-titillium font-bold text-[16px] text-[#d92d20]"
                      >
                        Proceed to Cancel
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-start gap-[20px]"
                  >
                    <h2 className="font-titillium font-bold text-[20px] leading-[24px] text-[#242424]">
                      Reason for cancellation
                    </h2>

                    <div className="flex flex-col w-full gap-[12px]">
                      {CANCELLATION_REASONS.map((reason) => (
                        <label 
                          key={reason} 
                          onClick={() => setSelectedReason(reason)}
                          className={`flex items-center gap-[12px] p-[16px] rounded-[12px] border cursor-pointer transition-colors ${selectedReason === reason ? 'border-[#242424] bg-[#fafbfb]' : 'border-[#eaebf0] hover:bg-[#fafbfb]'}`}
                        >
                          <div className={`flex items-center justify-center w-[20px] h-[20px] rounded-full border-[1.5px] ${selectedReason === reason ? 'border-[#242424]' : 'border-[#d0d5dd]'}`}>
                            {selectedReason === reason && <div className="w-[10px] h-[10px] rounded-full bg-[#242424]" />}
                          </div>
                          <span className={`font-titillium text-[15px] ${selectedReason === reason ? 'font-[600] text-[#242424]' : 'font-[400] text-[#626262]'}`}>
                            {reason}
                          </span>
                        </label>
                      ))}
                    </div>

                    <AnimatePresence>
                      {selectedReason === 'Other' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="w-full overflow-hidden"
                        >
                          <textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Please tell us specifically why..."
                            className="w-full p-[16px] min-h-[100px] border border-[#eaebf0] rounded-[12px] font-titillium text-[15px] outline-none focus:border-[#242424] transition-colors resize-none mb-[8px]"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={isProcessing || !selectedReason || (selectedReason === 'Other' && !customReason.trim())}
                      className="w-full h-[54px] mt-[12px] rounded-[12px] bg-[#d92d20] active:scale-[0.98] transition-transform font-titillium font-bold text-[16px] text-white disabled:opacity-50"
                    >
                      {isProcessing ? 'Cancelling Order...' : 'Confirm Cancellation'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={isProcessing}
                        className="w-full h-[40px] rounded-[12px] font-titillium font-semibold text-[14px] text-[#626262] hover:text-[#242424] transition-colors"
                      >
                        Back
                      </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CancelOrderModal;
