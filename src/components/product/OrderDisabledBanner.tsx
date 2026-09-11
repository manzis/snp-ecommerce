'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';

interface OrderDisabledBannerProps {
  ordersDisabled: boolean;
  ordersDisabledUntil?: string | null;
  ordersDisabledReason?: string;
  onUnlock?: () => void;
}

export default function OrderDisabledBanner({
  ordersDisabled,
  ordersDisabledUntil,
  ordersDisabledReason,
  onUnlock,
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

  if (!ordersDisabled && !isUnlocked) return null;
  if (dismissed) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed bottom-[145px] lg:bottom-20 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
      <AnimatePresence mode="wait">
        {isUnlocked ? (
          /* UNLOCKED STATE */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-emerald-600 text-white px-5 py-3 shadow-2xl flex items-center gap-3.5 w-full max-w-lg mx-auto pointer-events-auto border border-emerald-500 rounded-none"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-100 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-rajdhani font-bold text-lg uppercase tracking-tight leading-tight">
                Orders are now open!
              </span>
              <span className="text-emerald-100 text-xs mt-0.5">
                You can now place your order.
              </span>
            </div>
          </motion.div>
        ) : (
          /* ORDER DISABLED STATE (SHARP CORNERS, TIMER BADGE IN TOP RIGHT HALF OUTSIDE/INSIDE, INCREASED VISIBILITY) */
          <motion.div
            key="disabled"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`relative bg-red-600 text-white px-4 sm:px-5 shadow-2xl w-full max-w-[480px] sm:max-w-[520px] mx-auto pointer-events-auto border border-red-500 rounded-none ${
              remainingTime ? 'pt-5 sm:pt-5.5 pb-5 sm:pb-5.5' : 'py-3.5 sm:py-4'
            }`}
          >
            {/* Timer Badge: Top Right, Vertically Half Outside and Inside */}
            {remainingTime && (
              <div className="absolute top-0 right-4 sm:right-5 -translate-y-1/2 z-10 flex items-center gap-0.5 sm:gap-1 bg-zinc-950 text-white px-3 sm:px-3.5 py-1 sm:py-1.5 border border-white/30 rounded-none shadow-2xl shrink-0">
                {remainingTime.days > 0 && (
                  <>
                    <div className="flex flex-col items-center min-w-[22px] sm:min-w-[26px]">
                      <span className="font-rajdhani font-bold text-[15px] sm:text-[18px] text-white leading-none">
                        {pad(remainingTime.days)}
                      </span>
                      <span className="text-[7.5px] sm:text-[8.5px] text-red-200 uppercase font-bold tracking-wider">
                        Days
                      </span>
                    </div>
                    <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] text-red-300 leading-none mb-1">:</span>
                  </>
                )}

                <div className="flex flex-col items-center min-w-[22px] sm:min-w-[26px]">
                  <span className="font-rajdhani font-bold text-[15px] sm:text-[18px] text-white leading-none">
                    {pad(remainingTime.hours)}
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] text-red-200 uppercase font-bold tracking-wider">
                    Hours
                  </span>
                </div>

                <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] text-red-300 leading-none mb-1 animate-pulse">:</span>

                <div className="flex flex-col items-center min-w-[22px] sm:min-w-[26px]">
                  <span className="font-rajdhani font-bold text-[15px] sm:text-[18px] text-white leading-none">
                    {pad(remainingTime.minutes)}
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] text-red-200 uppercase font-bold tracking-wider">
                    Mins
                  </span>
                </div>

                <span className="font-rajdhani font-bold text-[13px] sm:text-[15px] text-red-300 leading-none mb-1 animate-pulse">:</span>

                <div className="flex flex-col items-center min-w-[22px] sm:min-w-[26px]">
                  <span className="font-rajdhani font-bold text-[15px] sm:text-[18px] text-white leading-none tabular-nums">
                    {pad(remainingTime.seconds)}
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] text-red-300 uppercase font-bold tracking-wider">
                    Secs
                  </span>
                </div>
              </div>
            )}

            {/* Main Content inside the rectangle - Left Aligned */}
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 w-full text-left">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-red-200 shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="font-rajdhani font-bold text-[16.5px] sm:text-[19px] uppercase tracking-tight leading-tight whitespace-nowrap">
                  Orders are currently disabled!
                </span>
                <span className="text-red-100 text-[12px] sm:text-[13.5px] truncate mt-0.5">
                  {ordersDisabledReason || 'Please try again later.'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
