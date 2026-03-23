'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname} // Only animate when the ACTUAL page changes, not filters
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.25, // Fast for premium feel
        ease: [0.25, 0.1, 0.25, 1], // Standard quintic ease
      }}
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}