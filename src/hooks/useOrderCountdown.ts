import { useState, useEffect, useMemo, useRef } from 'react';
import { useVolatileProductData } from './useVolatileProductData';

export interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface UseOrderCountdownReturn {
  isOrdersDisabled: boolean;
  ordersDisabledUntil: string | null;
  ordersDisabledReason: string;
  remainingTime: RemainingTime | null;
  countdownText: string | null;
  isUnlocked: boolean;
  serverTimeOffset: number;
  onAutoUnlock?: () => void;
}

function computeRemainingTime(targetIso: string | null, offset: number): {
  diff: number;
  remaining: RemainingTime;
  text: string;
} | null {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  if (isNaN(target)) return null;

  const now = Date.now() + offset;
  const diff = target - now;

  if (diff <= 0) {
    return {
      diff,
      remaining: { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 },
      text: '00h : 00m : 00s',
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const text = days > 0
    ? `${days}d ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`
    : `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  return {
    diff,
    remaining: { days, hours, minutes, seconds, totalSeconds },
    text,
  };
}

export function useOrderCountdown(
  productSlug: string,
  ssrOrdersDisabled: boolean = false,
  ssrOrdersDisabledUntil?: string | null,
  ssrOrdersDisabledReason?: string,
  onUnlockCallback?: () => void
): UseOrderCountdownReturn {
  const { volatileData } = useVolatileProductData(productSlug || '');

  // Live reconciled state from volatile data or SSR props
  const rawOrdersDisabled = volatileData?.storeSettings !== undefined
    ? volatileData.storeSettings.orders_disabled
    : ssrOrdersDisabled;

  const rawOrdersDisabledUntil = volatileData?.storeSettings !== undefined
    ? volatileData.storeSettings.orders_disabled_until
    : (ssrOrdersDisabledUntil ?? null);

  const ordersDisabledReason = volatileData?.storeSettings !== undefined
    ? volatileData.storeSettings.orders_disabled_reason
    : (ssrOrdersDisabledReason ?? '');

  const serverTimeOffset = useMemo(() => {
    return volatileData?.server_time ? volatileData.server_time - Date.now() : 0;
  }, [volatileData?.server_time]);

  // Synchronous initial evaluation to prevent any null UI flash
  const initialTimeData = useMemo(() => {
    if (!rawOrdersDisabled || !rawOrdersDisabledUntil) return null;
    return computeRemainingTime(rawOrdersDisabledUntil, serverTimeOffset);
  }, [rawOrdersDisabled, rawOrdersDisabledUntil, serverTimeOffset]);

  const isExpired = rawOrdersDisabledUntil ? (initialTimeData?.diff ?? 0) <= 0 : false;
  const effectiveOrdersDisabled = rawOrdersDisabled && !isExpired;

  const [remainingTime, setRemainingTime] = useState<RemainingTime | null>(
    effectiveOrdersDisabled ? (initialTimeData?.remaining ?? null) : null
  );
  const [countdownText, setCountdownText] = useState<string | null>(
    effectiveOrdersDisabled ? (initialTimeData?.text ?? null) : null
  );
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [liveDisabled, setLiveDisabled] = useState<boolean>(effectiveOrdersDisabled);

  const hasTickedRef = useRef(false);
  const onUnlockRef = useRef(onUnlockCallback);
  onUnlockRef.current = onUnlockCallback;

  // Sync state when DB / volatile values change
  useEffect(() => {
    if (!rawOrdersDisabled) {
      setLiveDisabled(false);
      setRemainingTime(null);
      setCountdownText(null);
      return;
    }

    if (!rawOrdersDisabledUntil) {
      // Indefinite pause
      setLiveDisabled(true);
      setRemainingTime(null);
      setCountdownText(null);
      setIsUnlocked(false);
      return;
    }

    const calc = computeRemainingTime(rawOrdersDisabledUntil, serverTimeOffset);
    if (!calc || calc.diff <= 0) {
      // Already expired
      setLiveDisabled(false);
      setRemainingTime(null);
      setCountdownText(null);
      return;
    }

    // Valid active countdown
    setLiveDisabled(true);
    setRemainingTime(calc.remaining);
    setCountdownText(calc.text);
    setIsUnlocked(false);
  }, [rawOrdersDisabled, rawOrdersDisabledUntil, serverTimeOffset]);

  // Live 1-second countdown ticker
  useEffect(() => {
    if (!liveDisabled || !rawOrdersDisabledUntil) {
      return;
    }

    const targetTime = new Date(rawOrdersDisabledUntil).getTime();
    if (isNaN(targetTime)) {
      setLiveDisabled(false);
      setRemainingTime(null);
      setCountdownText(null);
      return;
    }

    const tick = () => {
      const calc = computeRemainingTime(rawOrdersDisabledUntil, serverTimeOffset);
      if (!calc || calc.diff <= 0) {
        setLiveDisabled(false);
        setRemainingTime(null);
        setCountdownText(null);

        if (hasTickedRef.current) {
          hasTickedRef.current = false;
          setIsUnlocked(true);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ordersAutoUnlocked'));
          }

          if (onUnlockRef.current) {
            onUnlockRef.current();
          }

          // Auto-hide celebration banner after 5 seconds
          setTimeout(() => {
            setIsUnlocked(false);
          }, 5000);
        }
        return;
      }

      hasTickedRef.current = true;
      setRemainingTime(calc.remaining);
      setCountdownText(calc.text);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [liveDisabled, rawOrdersDisabledUntil, serverTimeOffset]);

  // Global listener for cross-component instant synchronization
  useEffect(() => {
    const handleUnlock = () => {
      setLiveDisabled(false);
      setRemainingTime(null);
      setCountdownText(null);
      setIsUnlocked(true);
      setTimeout(() => setIsUnlocked(false), 5000);
    };

    window.addEventListener('ordersAutoUnlocked', handleUnlock);
    return () => window.removeEventListener('ordersAutoUnlocked', handleUnlock);
  }, []);

  return {
    isOrdersDisabled: liveDisabled,
    ordersDisabledUntil: rawOrdersDisabledUntil,
    ordersDisabledReason,
    remainingTime,
    countdownText,
    isUnlocked,
    serverTimeOffset,
  };
}
