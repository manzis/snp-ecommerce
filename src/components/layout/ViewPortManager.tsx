'use client';

import { useEffect, useCallback } from 'react';

export default function ViewportManager() {
  const applyScaling = useCallback(() => {
    const targetWidth = 410;
    // Use window.screen.width for a stable calculation that doesn't change when scrolling in Instagram browser
    const deviceWidth = window.screen.width || targetWidth;

    if (deviceWidth >= targetWidth) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        if (viewportMeta.getAttribute('content') !== content) {
          viewportMeta.setAttribute('content', content);
        }
      }
      return;
    }

    const scale = deviceWidth / targetWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');

    if (viewportMeta) {
      const content = `width=${targetWidth}, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=no, viewport-fit=cover`;
      // Only update if content actually changed
      if (viewportMeta.getAttribute('content') !== content) {
        viewportMeta.setAttribute('content', content);
      }
    }
  }, []);

  useEffect(() => {
    // ONLY handle orientation changes.
    // REMOVED 'resize' listener because scrolling in Instagram/mobile browsers hides the URL bar, 
    // repeatedly triggering resize events, recalculating layout, and causing extreme CPU lag!
    window.addEventListener('orientationchange', applyScaling);

    return () => {
      window.removeEventListener('orientationchange', applyScaling);
    };
  }, [applyScaling]);

  return null;
}
