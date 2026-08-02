'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ActiveSalesSliderProps {
    sales: any[];
}

export default function ActiveSalesSlider({ sales }: ActiveSalesSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 5 seconds if there's more than one sale
    useEffect(() => {
        if (sales.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sales.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [sales.length]);

    if (!sales || sales.length === 0) return null;

    const currentSale = sales[currentIndex];
    
    // Live countdown timer state
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!currentSale?.ends_at) return;
        const endsAt = new Date(currentSale.ends_at).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endsAt - now;

            if (distance < 0) {
                setTimeLeft('Ended');
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0 || days > 0) parts.push(`${hours}h`);
            parts.push(`${minutes}m`);
            parts.push(`${seconds}s`);

            setTimeLeft(parts.join(' '));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [currentSale]);

    return (
        <section className="relative w-full flex flex-col items-center py-10 md:py-16 overflow-hidden bg-gradient-to-b from-white via-white to-[#F2F9F1]">
            <div className="relative w-full block">
                {/* Slider Container - Clickable */}
                <Link href={`/sale/${currentSale.slug}`} className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center group cursor-pointer overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSale.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-0"
                    >
                        {currentSale.banner_image ? (
                            <Image
                                src={currentSale.banner_image}
                                alt={currentSale.name}
                                fill
                                className="object-cover transition-transform duration-[10000ms] group-hover:scale-110"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gray-900" />
                        )}
                        {/* Top Gradient Overlay (for Offers badge) */}
                        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-red-950/90 to-transparent" />
                        
                        {/* Bottom Gradient Overlay (for text and button) */}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 md:h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Top Left: Offers & Sales Badge */}
                    <div className="absolute top-[40px] md:top-[60px] left-[24px] md:left-[60px] flex flex-col items-start pointer-events-auto">
                        <div className="inline-flex items-center justify-center bg-red-600/90 backdrop-blur-md px-[16px] py-[6px] shadow-lg shadow-red-900/20 border border-red-500/50">
                            <span className="font-rajdhani text-[13px] font-bold tracking-normal uppercase text-white">Offers and Sales</span>
                        </div>
                    </div>

                    {/* Bottom Left: Sale Name & Timer */}
                    <div className="absolute bottom-[70px] md:bottom-[90px] left-[24px] md:left-[60px] flex flex-col items-start pointer-events-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`title-group-${currentSale.id}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex flex-col items-start gap-1 md:gap-2"
                            >
                                <h2 className="font-rajdhani text-[24px] md:text-[36px] lg:text-[48px] font-bold leading-[1] text-white drop-shadow-2xl uppercase tracking-normal">
                                    {currentSale.name}
                                </h2>
                                
                                {/* Timer */}
                                <div className="flex items-center gap-1.5 md:gap-2 text-[13px] md:text-base font-medium text-white/90 drop-shadow-md">
                                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                    <span>
                                        {timeLeft ? `Ends in ${timeLeft}` : 'Ending Soon!'}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Right: Browse Button */}
                    <div className="absolute bottom-[70px] md:bottom-[90px] right-[24px] md:right-[60px] z-20 pointer-events-auto">
                        <div className="bg-white text-black px-4 py-2 md:px-5 md:py-2.5 font-rajdhani font-bold text-[14px] md:text-[16px] uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-xl shadow-black/20">
                            Browse
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                    </div>
                </div>

                {/* Slider Indicators */}
                {sales.length > 1 && (
                    <div className="absolute bottom-[60px] md:bottom-[80px] left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                        {sales.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                                className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-red-500' : 'w-2 bg-white/50 hover:bg-white'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </Link>

            {/* Bottom Wave (New Arrivals Style) */}
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="absolute -bottom-[2px] left-0 w-full h-[30px] md:h-[45px] lg:h-[60px] z-30 text-[#F2F9F1] pointer-events-none -scale-x-100">
                <path fill="currentColor" d="M0,40 C320,-20 500,100 850,70 C1150,40 1300,-10 1440,30 L1440,100 L0,100 Z" />
            </svg>
            </div>
        </section>
    );
}
