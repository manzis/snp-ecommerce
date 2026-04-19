'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Runtime Error:', error);
  }, [error]);

  const isTimeout = 
    error.message?.toLowerCase().includes('timeout') || 
    error.message?.toLowerCase().includes('fetch failed') ||
    (error as any).code === 'UND_ERR_CONNECT_TIMEOUT';

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center px-6 bg-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full text-center flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-6">
          {isTimeout ? (
            <WifiOff className="w-10 h-10 text-[#318126]" />
          ) : (
            <AlertCircle className="w-10 h-10 text-red-500" />
          )}
        </div>

        <h1 className="font-titillium text-2xl font-bold text-[#1E293B] mb-3">
          {isTimeout ? 'Connection Timeout' : 'Oops! Something went wrong'}
        </h1>
        
        <p className="font-titillium text-[#64748B] mb-8 leading-relaxed">
          {isTimeout 
            ? "We couldn't reach our servers. Please check your internet connection and try again."
            : "An unexpected error occurred. Our team has been notified."}
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 w-full max-w-[200px] h-[52px] bg-[#318126] text-white font-titillium font-semibold rounded-full shadow-lg shadow-[#318126]/20 transition-all hover:bg-[#286a1f]"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </motion.button>
        
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 text-sm font-titillium text-[#94A3B8] hover:text-[#318126] transition-colors"
        >
          Force Reload Page
        </button>
      </motion.div>

      {/* Subtle background detail */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#318126] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#318126] rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
