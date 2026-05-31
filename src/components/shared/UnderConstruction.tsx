'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface UnderConstructionProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function UnderConstruction({
  title = "Page Under Construction",
  message = "We are currently working hard to bring you this part of our store. It will be back soon!",
  showBackButton = true
}: UnderConstructionProps) {
  return (
    <div className="flex min-h-[70dvh] w-full flex-col items-center justify-center bg-white px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* Animated Illustration */}
        <div className="relative mb-12 h-64 w-64">
           {/* Custom SVG Illustration */}
           <svg viewBox="0 0 200 200" className="h-full w-full">
             <motion.path
                d="M100 30 L170 150 L30 150 Z"
                fill="none"
                stroke="#308026"
                strokeWidth="4"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
             />
             <motion.circle
                cx="100"
                cy="105"
                r="25"
                fill="#308026"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
             />
             <motion.rect
                x="92"
                y="60"
                width="16"
                height="35"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
             />
             <motion.circle
                cx="100"
                cy="135"
                r="30"
                fill="#308026"
                opacity="0.1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ delay: 1.2 }}
             />
           </svg>
           
           {/* Visual Overlay */}
           <div className="absolute inset-0 flex items-center justify-center pt-12">
             <span className="font-rajdhani text-[130px] font-black text-[#242424]/5 pointer-events-none select-none">OOPS</span>
           </div>
        </div>

        <h1 className="font-rajdhani text-4xl font-bold tracking-tight text-[#242424] sm:text-5xl">
          {title}
        </h1>
        
        <div className="mt-8 space-y-4">
          <p className="max-w-lg text-lg leading-relaxed text-[#71717a]">
            {message}
          </p>
          <p className="text-[#a1a1aa] font-medium text-[15px]">
            Don't worry, we'll be back online soon with something fresh!
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="flex h-[56px] items-center justify-center rounded-full bg-[#308026] px-12 text-[16px] font-bold text-white shadow-xl shadow-[#308026]/20 transition-all hover:bg-black active:scale-95"
          >
            Back to Home
          </Link>
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="flex h-[56px] items-center justify-center rounded-full border-2 border-gray-100 px-10 text-[16px] font-bold text-[#242424] transition-all hover:bg-gray-50 active:scale-95"
            >
              Previous Page
            </button>
          )}
        </div>

        {/* Brand Footer Symbol */}
        <div className="mt-24 flex items-center gap-3 opacity-20">
          <div className="h-1.5 w-1.5 rounded-full bg-[#308026]" />
          <div className="h-2 w-2 rounded-full bg-[#308026]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[#308026]" />
        </div>
      </motion.div>
    </div>
  );
}
