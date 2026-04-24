'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutLoaderProps {
  isLoading: boolean;
  message?: string;
}

const CheckoutLoader: React.FC<CheckoutLoaderProps> = ({ 
  isLoading, 
  message = "Processing your order" 
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-white/20 backdrop-blur-[2px] pointer-events-none"
        >
          {/* Main Loader Container: Minimal, Small, Sharp Rectangular with Green Border */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white border-[1.5px] border-[#3f9633] rounded-none p-6 flex flex-row items-center gap-4 max-w-fit pointer-events-auto"
          >
            {/* Simple Small Spinner */}
            <div className="relative w-5 h-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-2 border-[#3f9633]/20 border-t-[#3f9633] rounded-full"
              />
            </div>

            {/* Small Minimalist Text */}
            <span className="font-titillium text-[14px] text-[#3f9633] font-medium tracking-tight whitespace-nowrap">
              {message}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutLoader;
