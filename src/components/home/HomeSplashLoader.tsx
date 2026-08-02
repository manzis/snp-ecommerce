'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomeSplashLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const lastVisit = localStorage.getItem('lastSplashTime');
    const now = Date.now();
    
    // 30 minutes in milliseconds (Simulates a "warm" cache/database period)
    const WARM_UP_TIME = 30 * 60 * 1000;
    let timer: NodeJS.Timeout;
    
    if (lastVisit && (now - parseInt(lastVisit) < WARM_UP_TIME)) {
      // Visited recently, assets and DB are likely warm/cached. Skip the loader.
      localStorage.setItem('lastSplashTime', now.toString());
      setShowAnimation(false);
      setIsLoading(false);
    } else {
      // True cold start (First visit or haven't visited in 30 mins)
      // Lock scroll while loader is visible
      document.body.style.overflow = 'hidden';
      
      // Hide loader after a short delay to ensure assets are ready
      timer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = '';
        // Set localStorage ONLY after loader finishes so React Strict Mode doesn't abort it
        localStorage.setItem('lastSplashTime', Date.now().toString());
      }, 1200);
    }

    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  // If they've already seen it, return nothing so it doesn't even render or animate out
  if (!showAnimation) return null;

  return (
    <>
      {/* 
        This inline script executes immediately before React hydrates. 
        It checks localStorage synchronously and hides the loader via CSS if it's a warm visit. 
        This completely prevents the 1-frame HTML flash on reload. 
      */}
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var lastVisit = localStorage.getItem('lastSplashTime');
              var now = Date.now();
              if (lastVisit && (now - parseInt(lastVisit) < 30 * 60 * 1000)) {
                var style = document.createElement('style');
                style.innerHTML = '#snp-splash-screen { display: none !important; }';
                document.head.appendChild(style);
              }
            } catch(e) {}
          `
        }}
      />
      <AnimatePresence>
        {isLoading && (
          <motion.div
            id="snp-splash-screen"
            key="splash"
            aria-hidden="true"
            initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ 
              opacity: 0, 
              scale: 1.05, 
              filter: 'blur(12px)',
              transition: { duration: 1.2, ease: "easeInOut" } 
            }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#081908] pointer-events-auto overflow-hidden"
          >
          {/* Abstract Background Illustration (Hand-drawn Doodles) */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Playful Squiggly Doodle Pattern (Hardware Accelerated CSS Background) */}
            <div 
              className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-[0.06] rotate-[5deg] pointer-events-none" 
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cg stroke='%23ffffff' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' fill='none'%3E%3Cpath d='M -20,80 Q 40,20 80,100 T 180,80 T 220,120'/%3E%3Crect x='130' y='120' width='28' height='60' rx='14' transform='rotate(30 144 150)'/%3E%3Cline x1='130' y1='150' x2='158' y2='150' transform='rotate(30 144 150)'/%3E%3Ccircle cx='40' cy='160' r='20'/%3E%3Cpath d='M 35,160 h 10 M 40,155 v 10' stroke-width='4'/%3E%3Crect x='70' y='10' width='50' height='24' rx='12' transform='rotate(-15 95 22)'/%3E%3Cline x1='95' y1='10' x2='95' y2='34' transform='rotate(-15 95 22)'/%3E%3Ccircle cx='180' cy='40' r='4' fill='%23ffffff' stroke='none'/%3E%3Ccircle cx='10' cy='30' r='4' fill='%23ffffff' stroke='none'/%3E%3Cpath d='M 180,180 C 160,220 220,220 200,190'/%3E%3C/g%3E%3C/svg%3E")`, 
                backgroundSize: '260px 260px',
                willChange: 'transform'
              }} 
            />
            {/* Radial Mask to fade out edges */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,#081908_90%)]"></div>
          </div>
          {/* Loader Content (Fades out and expands slightly like smoke) */}
          <motion.div
            key="content"
            initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ 
              opacity: 0, 
              scale: 1.15, 
              filter: 'blur(8px)', 
              transition: { duration: 0.9, ease: "easeOut" } 
            }}
            className="flex flex-col items-center justify-center gap-4 z-10"
          >
            <div className="relative flex items-center justify-center w-14 h-14">
              <div className="absolute inset-0 border-4 border-[#308026]/30 border-t-[#95FF00] rounded-full animate-spin"></div>
              <img src="/images/logo.png" alt="Supplyment Nepal" className="w-[44px] h-[44px] object-cover rounded-full drop-shadow-md z-10 relative" />
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center mt-4"
            >
              <div className="text-[#95FF00] font-rajdhani text-[20px] font-bold tracking-normal uppercase">
                Supplyment Nepal
              </div>
              <div className="text-[#ffffff]/60 font-rajdhani text-[11px] font-medium tracking-normal uppercase mt-1">
                Powered By Bright Nepcare Pvt Ltd.
              </div>
            </motion.div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
