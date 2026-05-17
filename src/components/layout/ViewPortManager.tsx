'use client';

import { useEffect, useCallback } from 'react';

export default function ViewportManager() {
  const applyScaling = useCallback(() => {
    const targetWidth = 410;
    const deviceWidth = window.innerWidth || document.documentElement.clientWidth || window.screen.width || targetWidth;

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
