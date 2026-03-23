'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ViewportManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applyScaling = useCallback(() => {
    const targetWidth = 410;
    const deviceWidth = window.screen.width;
    const scale = deviceWidth / targetWidth;
    
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }

    if (deviceWidth < targetWidth) {
      viewportMeta.setAttribute(
        'content',
        `width=${targetWidth}, initial-scale=${scale}, minimum-scale=${scale}, max-scale=${scale}, user-scalable=no`
      );
    } else {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1');
    }

    // THE REFLOW HACK: Forces browser to re-render the scale immediately
    document.documentElement.style.opacity = '0.99';
    requestAnimationFrame(() => {
      document.documentElement.style.opacity = '1';
      document.documentElement.classList.add('viewport-ready');
      document.documentElement.classList.remove('initial-loading');
    });
  }, []);

  useEffect(() => {
    applyScaling();

    // HANDLE SAME-PAGE NAVIGATION:
    // This catches clicks on footer/nav links that point to the current URL
    const handleSamePageLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href === window.location.href) {
        // Delay slightly to wait for Next.js scroll-to-top behavior
        setTimeout(applyScaling, 50);
      }
    };

    window.addEventListener('click', handleSamePageLinks);
    window.addEventListener('resize', applyScaling);
    
    return () => {
      window.removeEventListener('click', handleSamePageLinks);
      window.removeEventListener('resize', applyScaling);
    };
  }, [pathname, searchParams, applyScaling]); // Re-run on any URL change

  return null;
}