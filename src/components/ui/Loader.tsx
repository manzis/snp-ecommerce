"use client";

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Loader Component
 * 
 * ADJUSTMENTS:
 * - Increased height to 34px for better presence
 * - Increased width to 90px to prevent text cramping
 * - Scaled font to 15px (DK Jalebi)
 * - Maintained exact brand colors: #3F9733 & #318126
 */
const Loader: React.FC = () => {
  const dotVariants = {
    initial: { opacity: 0.2, y: 0 },
    animate: { opacity: 1, y: -2 },
  };

  return (
    <div className="flex h-[34px] w-[90px] items-center justify-center rounded-[10px] border border-[#318126] bg-[#3F9733] px-[16px] py-[6px] relative overflow-hidden shadow-sm">

      {/* LUXURY SHIMMER EFFECT */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] pointer-events-none"
      />

      {/* CENTERED LOADING TEXT */}
      <div className="relative z-10 flex items-center justify-center">
 <span className="font-rajdhani font-bold text-[15px] font-[500] leading-none text-white flex items-baseline tracking-[0.3px]">
          Loading
          <div className="flex ml-[2px] gap-[1px]">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: i * 0.15
                }}
                className="inline-block"
              >
                .
              </motion.span>
            ))}
          </div>
        </span>
      </div>
    </div>
  );
};

export default Loader;
