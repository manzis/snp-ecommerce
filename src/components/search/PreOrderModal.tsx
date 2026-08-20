'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon';
import { useUIStore } from '@/store/uiStore';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductName?: string;
}

const PreOrderModal: React.FC<PreOrderModalProps> = ({ isOpen, onClose, initialProductName = '' }) => {
  const [productName, setProductName] = useState(initialProductName);
  const [brandName, setBrandName] = useState('');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);

  React.useEffect(() => {
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

  // Update initialProductName when modal opens with a new search query
  React.useEffect(() => {
    if (isOpen && initialProductName) {
      setProductName(initialProductName);
    }
  }, [isOpen, initialProductName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError('Product Name is required');
      return;
    }

    const message = `*Product Availability Inquiry*
Product Name: ${productName}
Brand Name: ${brandName || 'N/A'}
Size/Variant: ${size || 'N/A'}
Additional Notes: ${notes || 'N/A'}`;

    const whatsappUrl = `https://wa.me/9779767609390?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-[2px] p-[8px] lg:p-[16px] touch-none"
        >
          {/* OVERLAY */}
          <div onClick={onClose} className="absolute inset-0 cursor-pointer" />

          <div className="flex w-full flex-col items-center max-w-full lg:max-w-[500px] z-[201] pointer-events-none">
            {/* CLOSE BUTTON */}
            <div className="flex w-full justify-end mb-[10px] pointer-events-auto">
              <button
                onClick={onClose}
                className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-gray-100 hover:bg-gray-200 transition-colors shadow-md"
                title="Close modal"
              >
                <CloseIcon className="h-[20px] w-[20px] text-[#3f3f3f]" />
              </button>
            </div>

            {/* PANEL */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="relative flex flex-col w-full bg-white rounded-[24px] lg:rounded-[16px] lg:shadow-2xl overflow-hidden pointer-events-auto max-h-[85vh]"
            >
              <div className="flex justify-center p-[16px] lg:hidden">
                <button onClick={onClose} className="w-[40px] h-[5px] bg-[#eaebf0] rounded-full" />
              </div>

              <div className="flex flex-col gap-[20px] px-[24px] pb-[32px] overflow-y-auto w-full lg:pt-[32px]">
                <div className="flex flex-col">
                  <h2 className="font-rajdhani text-[24px] font-bold text-[#242424]">Know Availability</h2>
                  <p className="font-rajdhani text-[15px] text-[#838383] mt-[4px]">
                    Fill in the details below and we will get back to you with availability and quotation via WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
                  <div className="flex flex-col">
                    <label className="text-[13px] font-rajdhani font-semibold text-[#242424] mb-[6px] ml-[4px]">
                      Product Name <span className="text-[#d92d20]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Optimum Nutrition Gold Standard Whey"
                      value={productName}
                      onChange={(e) => {
                        setProductName(e.target.value);
                        setError('');
                      }}
                      className={`w-full h-[50px] px-[16px] border outline-none transition-colors rounded-[10px] font-rajdhani ${
                        error ? 'border-[#d92d20]' : 'border-[#eaebf0] focus:border-[#308026]'
                      }`}
                    />
                    {error && <span className="text-[#d92d20] text-[12px] font-rajdhani mt-[4px] ml-[4px]">{error}</span>}
                  </div>

                  <div className="flex flex-col md:flex-row gap-[16px]">
                    <div className="flex flex-col flex-1">
                      <label className="text-[13px] font-rajdhani font-semibold text-[#242424] mb-[6px] ml-[4px]">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Optimum Nutrition"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full h-[50px] px-[16px] border border-[#eaebf0] focus:border-[#308026] outline-none transition-colors rounded-[10px] font-rajdhani"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-[13px] font-rajdhani font-semibold text-[#242424] mb-[6px] ml-[4px]">
                        Size / Variant
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 lbs, Double Rich Chocolate"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full h-[50px] px-[16px] border border-[#eaebf0] focus:border-[#308026] outline-none transition-colors rounded-[10px] font-rajdhani"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[13px] font-rajdhani font-semibold text-[#242424] mb-[6px] ml-[4px]">
                      Additional Notes
                    </label>
                    <textarea
                      placeholder="Any specific requirements or questions?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full min-h-[100px] p-[16px] border border-[#eaebf0] focus:border-[#308026] outline-none transition-colors rounded-[10px] font-rajdhani resize-y"
                    />
                  </div>

                  <div className="mt-[8px] sticky bottom-0 bg-white pt-[8px]">
                    <button
                      type="submit"
                      className="w-full h-[54px] bg-[#308026] hover:bg-[#25661d] active:scale-[0.98] transition-all rounded-[12px] flex items-center justify-center gap-[8px]"
                    >
                      {/* WhatsApp Icon */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M17.472 14.382C17.153 14.222 15.584 13.447 15.297 13.344C15.01 13.24 14.802 13.189 14.595 13.498C14.388 13.807 13.781 14.529 13.593 14.735C13.406 14.941 13.218 14.967 12.9 14.807C12.581 14.647 11.552 14.312 10.334 13.226C9.387 12.382 8.747 11.341 8.56 11.022C8.373 10.703 8.541 10.533 8.7 10.375C8.843 10.233 9.019 10.012 9.178 9.837C9.337 9.661 9.387 9.537 9.485 9.332C9.583 9.126 9.533 8.945 9.453 8.785C9.373 8.625 8.736 7.078 8.468 6.438C8.211 5.827 7.95 5.912 7.762 5.903C7.59 5.895 7.382 5.894 7.175 5.894C6.968 5.894 6.633 5.972 6.346 6.281C6.059 6.59 5.262 7.338 5.262 8.859C5.262 10.38 6.378 11.85 6.537 12.067C6.696 12.283 8.718 15.395 11.838 16.741C12.58 17.061 13.159 17.254 13.612 17.397C14.358 17.634 15.038 17.598 15.578 17.521C16.183 17.435 17.442 16.764 17.7 16.042C17.958 15.32 17.958 14.701 17.878 14.572C17.799 14.443 17.592 14.366 17.273 14.207"
                          fill="white"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.001 22C17.5238 22 22 17.5228 22 12C22 6.47715 17.5238 2 12 2C6.47615 2 2 6.47715 2 12C2 13.8242 2.4878 15.5348 3.32836 17L2.14856 21.3259L6.59218 20.1554C8.1963 21.3414 10.0387 22 12.001 22ZM12.001 19.9984C10.1523 19.9984 8.42398 19.4975 6.94528 18.6309L6.50567 18.3703L3.63345 19.1271L4.39714 16.3268L4.12028 15.8679C3.17646 14.3015 2.63753 12.2155 2.63753 12.0003C2.63753 6.83063 6.83296 2.63661 12.0026 2.63661C17.1722 2.63661 21.3676 6.83063 21.3676 12.0003C21.3676 17.1699 17.1722 21.364 12.0026 21.364H12.001V19.9984Z"
                          fill="white"
                        />
                      </svg>
                      <span className="font-rajdhani font-bold text-[16px] text-white">Send Request via WhatsApp</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
};

export default PreOrderModal;
