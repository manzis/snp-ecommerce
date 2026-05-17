'use client';

import { useEffect } from 'react';
import { recordProductViewAction } from '@/app/actions/analyticsActions';
import { useSessionId } from '@/hooks/useSessionId';

export default function ProductViewTracker({ productId }: { productId: string }) {
  const sessionId = useSessionId();

  useEffect(() => {
    if (!sessionId) return;

    // Delay recording by 1.5 seconds (User Engagement Delay)
    // This prevents browser network queue clogging and lag during fast scrolling/clicking
    const timer = setTimeout(() => {
      recordProductViewAction(productId, sessionId).catch(err => 
        console.error('Failed to record product view:', err)
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [productId, sessionId]);

  return null;
}
