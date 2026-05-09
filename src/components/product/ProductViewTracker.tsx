'use client';

import { useEffect } from 'react';
import { recordProductViewAction } from '@/app/actions/analyticsActions';
import { useSessionId } from '@/hooks/useSessionId';

export default function ProductViewTracker({ productId }: { productId: string }) {
  const sessionId = useSessionId();

  useEffect(() => {
    if (sessionId) {
      recordProductViewAction(productId, sessionId).catch(err => 
        console.error('Failed to record product view:', err)
      );
    }
  }, [productId, sessionId]);

  return null;
}
