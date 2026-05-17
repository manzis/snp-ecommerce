'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ViewportManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Whenever the route changes (or on mount), Next.js might reset the viewport.
    // Call the global function defined in our layout.tsx <Script> to re-apply our custom scaling.
    if (typeof window !== 'undefined' && (window as any).__setResponsiveViewport) {
      (window as any).__setResponsiveViewport();
    }
  }, [pathname]);

  useEffect(() => {
    // Only handle physical device orientation changes, NOT scrolling
    const handleOrientation = () => {
      if (typeof window !== 'undefined' && (window as any).__setResponsiveViewport) {
        (window as any).__setResponsiveViewport();
      }
    };
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  return null;
}
