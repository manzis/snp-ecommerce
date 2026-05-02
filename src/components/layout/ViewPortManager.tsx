'use client';

import { useEffect, useCallback } from 'react';

export default function ViewportManager() {
  const applyScaling = useCallback(() => {
    const targetWidth = 410;
    const deviceWidth = window.screen.width;

    if (deviceWidth >= targetWidth) return;

    const scale = deviceWidth / targetWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');

    if (viewportMeta) {
      const content = `width=${targetWidth}, initial-scale=${scale}, minimum-scale=${scale}, max-scale=${scale}, user-scalable=no`;
      // Only update if orientation actually changed
      if (viewportMeta.getAttribute('content') !== content) {
        viewportMeta.setAttribute('content', content);
      }
    }
  }, []);

  useEffect(() => {
    // Only handle physical device changes, NOT navigation
    window.addEventListener('resize', applyScaling);
    window.addEventListener('orientationchange', applyScaling);

    return () => {
      window.removeEventListener('resize', applyScaling);
      window.removeEventListener('orientationchange', applyScaling);
    };
  }, [applyScaling]);

  return null;
}
