'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { ShoppingCart, LogOut, ArrowRight } from 'lucide-react';

interface CheckoutCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

const CheckoutCancelModal: React.FC<CheckoutCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false
}) => {
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);

  React.useEffect(() => {
    if (isOpen) {
      setHideBottomNav(true);
    } else {
      setHideBottomNav(false);
    }
  }, [isOpen, setHideBottomNav]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* MODAL CONTENT */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl font-rubik"
          >
            <div className="p-8">
              {/* ICON AREA */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-sm">
                  <ShoppingCart className="w-10 h-10 text-red-500" />
                </div>
              </div>

              {/* TEXT CONTENT */}
              <div className="text-center mb-8">
                <h2 className="text-[24px] font-bold text-[#242424] mb-3 leading-tight tracking-tight">
                  Wait, don't leave!
                </h2>
                <p className="text-[#71717a] text-[15px] leading-relaxed px-4">
                  Your items are ready. If you exit now, you'll need to restart the checkout process later.
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full h-[54px] flex items-center justify-center gap-2 bg-[#242424] text-white rounded-2xl font-bold text-[16px] transition-all hover:bg-black active:scale-[0.98]"
                >
                  <ArrowRight className="w-5 h-5" />
                  No, I want to proceed
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="w-full h-[54px] flex items-center justify-center gap-2 text-red-600 font-bold text-[16px] hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  Yes, cancel checkout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutCancelModal;
