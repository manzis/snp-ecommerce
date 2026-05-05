'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.main
      // Ensure this key is purely the pathname
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center' }}
      className="flex-grow flex flex-col w-full relative flex-1"
    >
      {/* Root children must be passed here */}
      {children}
    </motion.main>
  );
}
