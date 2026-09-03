'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon2';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/ToastProvider';
import type { CartItemType } from '@/services/cartService';

interface OutOfStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  outOfStockItems: CartItemType[];
  onProceed?: () => void;
}

const OutOfStockModal: React.FC<OutOfStockModalProps> = ({
  isOpen,
  onClose,
  outOfStockItems,
  onProceed
}) => {
  const [mounted, setMounted] = useState(false);
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);
  const { removeItem } = useCartStore();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setHideBottomNav(isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      setHideBottomNav(false);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, setHideBottomNav]);

  if (!mounted || !isOpen || outOfStockItems.length === 0) return null;

  const firstItem = outOfStockItems[0];

  const handleRemoveItem = (item: CartItemType) => {
    removeItem(item);
    showToast(`Removed "${item.name}" from cart`, "success");
    
    if (outOfStockItems.length <= 1) {
      onClose();
      if (onProceed) {
        onProceed();
      }
    }
  };

  const handleRemoveAllOutOfStock = () => {
    outOfStockItems.forEach(item => removeItem(item));
    showToast("Out of stock item(s) removed from cart", "success");
    onClose();
    if (onProceed) {
      onProceed();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 px-[16px] backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-[340px] lg:max-w-[360px] overflow-hidden rounded-[20px] bg-white p-[20px] text-center shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute right-[16px] top-[16px] z-10 flex h-[36px] w-[36px] items-center justify-center rounded-[10px] bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Close modal"
            >
              <CloseIcon className="h-[18px] w-[18px] text-[#3f3f3f]" />
            </button>

            {/* Circular Item Image Header */}
            <div className="relative mx-auto mb-[16px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#fef2f2] border-2 border-[#fee2e2] p-2 overflow-hidden shadow-inner">
              <Image
                src={firstItem.image || '/images/protein.webp'}
                alt={firstItem.name}
                fill
                className="object-contain p-1"
              />
            </div>

            {/* Title & Description */}
            <h2 className="mb-[6px] font-rajdhani text-[20px] font-bold leading-[26px] tracking-[-0.5px] text-[#242424]">
              Item Out of Stock
            </h2>
            
            <p className="mb-[24px] font-rajdhani text-[14px] leading-[20px] text-[#575757]">
              Remove item from cart to continue checkout since it&apos;s out of stock.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-[10px]">
              <button
                type="button"
                onClick={handleRemoveAllOutOfStock}
                className="flex w-full items-center justify-center rounded-[10px] bg-[#dc2626] hover:bg-[#b91c1c] py-[12px] font-rajdhani text-[15px] font-bold uppercase text-white transition-all active:scale-[0.98] shadow-sm"
              >
                Remove Item &amp; Continue
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-[10px] bg-[#f1f5f9] hover:bg-[#e2e8f0] py-[12px] font-rajdhani text-[15px] font-bold text-[#242424] transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default OutOfStockModal;
