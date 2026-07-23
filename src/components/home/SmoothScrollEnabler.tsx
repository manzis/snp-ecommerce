'use client';

import { useEffect } from 'react';

export default function SmoothScrollEnabler() {
  useEffect(() => {
    // Enable smooth scrolling when the homepage is mounted
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Disable smooth scrolling when navigating away (e.g., to a product page)
    // so that new pages load instantly at the top without animating.
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return null;
}
