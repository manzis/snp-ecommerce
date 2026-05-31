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
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-white/20 backdrop-blur-[1px] pointer-events-none"
        >
          {/* Main Loader Container: Minimal, Small, Sharp Rectangular with Green Border */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white border-[1px] border-[#3f9633] rounded-[2px] p-5 flex flex-row items-center gap-4 max-w-fit pointer-events-auto"
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
            <div className="relative overflow-hidden h-[20px] flex items-center min-w-[150px]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={message}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="font-rajdhani text-[14px] text-[#3f9633] font-semibold tracking-tight whitespace-nowrap block absolute"
                >
                  {message}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutLoader;
