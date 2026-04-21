'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminNotFoundClient() {
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* Admin Minimalist 404 Icon */}
        <div className="relative mb-10 h-48 w-48">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <motion.rect
              x="40"
              y="40"
              width="120"
              height="120"
              rx="20"
              fill="none"
              stroke="#242424"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5 }}
            />
            <motion.path
              d="M70 70 L130 130 M130 70 L70 130"
              stroke="#242424"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[80px] font-bold text-black/5">404</span>
          </div>
        </div>

        <h1 className="font-inter text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          System Resource Not Found
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-gray-500">
          The administrative route or resource you are attempting to access is currently
          unavailable or <span className="font-semibold text-black">under construction</span>.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin"
            className="flex h-[48px] items-center justify-center rounded-xl bg-black px-8 text-[14px] font-semibold text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex h-[48px] items-center justify-center rounded-xl border border-gray-200 bg-white px-8 text-[14px] font-semibold text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
          >
            Go Back
          </button>
        </div>

        <div className="mt-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-300">
            Internal Route Exception : 404
          </p>
        </div>
      </motion.div>
  );
}
