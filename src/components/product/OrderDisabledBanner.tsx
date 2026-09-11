'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, MessageCircle, X, Clock } from 'lucide-react';

interface OrderDisabledBannerProps {
  ordersDisabled: boolean;
  ordersDisabledUntil?: string | null;
  ordersDisabledReason?: string;
  onUnlock?: () => void;
  defaultOpen?: boolean;
}

export default function OrderDisabledBanner({
  ordersDisabled,
  ordersDisabledUntil,
  ordersDisabledReason,
  onUnlock,
  defaultOpen = true,
}: OrderDisabledBannerProps) {
  const [remainingTime, setRemainingTime] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Automatically open customer support message popup on initial page load
  useEffect(() => {
    if (!ordersDisabled || isUnlocked || !defaultOpen) return;

    const timer = setTimeout(() => {
      setIsPopupOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [ordersDisabled, isUnlocked, defaultOpen]);

  useEffect(() => {
    if (!ordersDisabled) {
      setRemainingTime(null);
      return;
    }

    if (!ordersDisabledUntil) {
      setRemainingTime(null);
      return;
    }

    const targetTimestamp = new Date(ordersDisabledUntil).getTime();
    if (isNaN(targetTimestamp)) {
      setRemainingTime(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setRemainingTime({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        setIsUnlocked(true);
        setIsPopupOpen(false);
        if (onUnlock) onUnlock();
        // Auto-dismiss after 5 seconds of showing the celebration
        setTimeout(() => setDismissed(true), 5000);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setRemainingTime({ days, hours, minutes, seconds, totalSeconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [ordersDisabled, ordersDisabledUntil, onUnlock]);

  // Handle outside click / touch to dismiss popup
  useEffect(() => {
    if (!isPopupOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#order-disabled-widget')) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPopupOpen]);

  if (!ordersDisabled && !isUnlocked) return null;
  if (dismissed) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div id="order-disabled-widget" className="fixed bottom-[130px] lg:bottom-6 right-4 sm:right-6 z-50 pointer-events-none flex flex-col items-end gap-2.5">
      {/* CUSTOMER SERVICE MESSAGE POPUP */}
      <AnimatePresence>
        {isPopupOpen && !isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="w-[290px] sm:w-[330px] bg-white text-zinc-900 shadow-2xl p-3.5 sm:p-4 pointer-events-auto rounded-[16px] origin-bottom-right select-none"
          >
            {/* Header: Customer Support / Agent */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950 text-white shadow-xs">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-rajdhani font-bold text-[14px] text-zinc-900 leading-none">
                      Customer Support
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                      Notice
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 leading-none">
                    Store status update
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopupOpen(false);
                }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                aria-label="Close notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Message Bubble */}
            <div className="mt-3 flex flex-col gap-2.5">
              <div className="bg-zinc-50 rounded-[12px] rounded-tl-[4px] p-3 text-zinc-800 text-[12.5px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[13px] text-red-600 mb-1 font-rajdhani uppercase tracking-wide">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  The orders are currently disabled
                </div>
                <p className="text-zinc-600 text-[12px] leading-normal">
                  {ordersDisabledReason || 'We are temporarily pausing new orders. You can continue browsing our catalog, comparing products, and saving favorites until checkout reopens.'}
                </p>
              </div>

              {/* Live Timer Status Row */}
              {remainingTime && (
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 text-white rounded-[10px] text-[11.5px]">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-white" />
                    Unlocking in:
                  </span>
                  <span className="font-rajdhani font-bold text-xs tracking-wider text-white font-mono tabular-nums">
                    {remainingTime.days > 0 ? `${remainingTime.days}d ` : ''}
                    {pad(remainingTime.hours)}:{pad(remainingTime.minutes)}:{pad(remainingTime.seconds)}
                  </span>
                </div>
              )}

              <p className="text-[10.5px] text-zinc-400 text-center">
                Orders will automatically unlock when the timer completes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TIMER / LOCK BADGE */}
      <AnimatePresence mode="wait">
        {isUnlocked ? (
          /* UNLOCKED STATE */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-emerald-600 text-white px-3.5 sm:px-4 py-2 shadow-2xl flex items-center gap-2 pointer-events-auto border border-emerald-500 rounded-none select-none"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100 shrink-0" />
            <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] uppercase tracking-tight whitespace-nowrap">
              Orders are now open!
            </span>
          </motion.div>
        ) : (
          /* ORDER DISABLED STATE: INTERACTIVE RIGHT-SIDE FLOATING TIMER BADGE */
          <motion.div
            key="disabled"
            onClick={() => setIsPopupOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsPopupOpen((prev) => !prev);
              }
            }}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-zinc-950 text-white pl-1.5 sm:pl-2 pr-3 sm:pr-3.5 py-1.5 sm:py-2 border border-white/25 rounded-none shadow-2xl flex items-center gap-2 sm:gap-2.5 pointer-events-auto select-none cursor-pointer hover:border-white/50 active:scale-[0.98] transition-all"
            title="Click for details"
          >
            {/* Lock Icon in left side with red background */}
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-600 text-white shrink-0">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </div>

            {/* Timer or Status on the right */}
            {remainingTime ? (
              <div className="flex items-center gap-0.5 sm:gap-1">
                {remainingTime.days > 0 && (
                  <>
                    <div className="flex flex-col items-center min-w-[20px] sm:min-w-[24px]">
                      <span className="font-rajdhani font-bold text-[14px] sm:text-[17px] text-white leading-none">
                        {pad(remainingTime.days)}
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] text-zinc-400 uppercase font-bold tracking-wider">
                        Days
                      </span>
                    </div>
                    <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] text-zinc-500 leading-none mb-1">:</span>
                  </>
                )}

                <div className="flex flex-col items-center min-w-[20px] sm:min-w-[24px]">
                  <span className="font-rajdhani font-bold text-[14px] sm:text-[17px] text-white leading-none">
                    {pad(remainingTime.hours)}
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] text-zinc-400 uppercase font-bold tracking-wider">
                    Hours
                  </span>
                </div>

                <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] text-zinc-500 leading-none mb-1 animate-pulse">:</span>

                <div className="flex flex-col items-center min-w-[20px] sm:min-w-[24px]">
                  <span className="font-rajdhani font-bold text-[14px] sm:text-[17px] text-white leading-none">
                    {pad(remainingTime.minutes)}
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] text-zinc-400 uppercase font-bold tracking-wider">
                    Mins
                  </span>
                </div>

                <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] text-zinc-500 leading-none mb-1 animate-pulse">:</span>

                <div className="flex flex-col items-center min-w-[20px] sm:min-w-[24px]">
                  <span className="font-rajdhani font-bold text-[14px] sm:text-[17px] text-white leading-none tabular-nums">
                    {pad(remainingTime.seconds)}
                  </span>
                  <span className="text-[7.5px] sm:text-[8px] text-red-400 uppercase font-bold tracking-wider">
                    Secs
                  </span>
                </div>
              </div>
            ) : (
              <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] uppercase tracking-wider text-zinc-200 whitespace-nowrap">
                Orders Disabled
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
