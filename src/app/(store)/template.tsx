'use client';

import { usePathname } from 'next/navigation';

/**
 * Lightweight page transition template.
 * Uses CSS-only animation instead of framer-motion to avoid
 * loading ~40KB of JS into the critical rendering path.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main
      key={pathname}
      className="flex-grow flex flex-col w-full relative flex-1 animate-page-enter"
    >
      {children}
    </main>
  );
}
