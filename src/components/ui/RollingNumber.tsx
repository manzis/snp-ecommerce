'use client';

import { motion, AnimatePresence } from 'framer-motion';

const RollingNumber = ({ value }: { value: string }) => {
  const digits = value.split('');

  return (
    <div className="flex overflow-hidden h-[24px]">
      {digits.map((digit, i) => (
        <div key={i} className="relative w-[0.6em] flex justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                mass: 0.5,
              }}
              className="inline-block"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default RollingNumber;
