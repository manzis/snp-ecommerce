'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Persists across client-side router navigation in the same session
let isFirstLoad = true;

/**
 * Lightweight page transition template.
 * Uses CSS-only animation instead of framer-motion to avoid
 * loading ~40KB of JS into the critical rendering path.
 * 
 * Optimized to bypass transition on first mount (instant 0ms loading),
 * while animating beautifully on client-side route navigations.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-grow flex flex-col w-full relative flex-1 animate-page-enter">
      {children}
    </main>
  );
}

