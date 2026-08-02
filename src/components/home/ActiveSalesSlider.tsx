'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ActiveSalesSliderProps {
    sales: any[];
}

export default function ActiveSalesSlider({ sales }: ActiveSalesSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const width = e.currentTarget.clientWidth;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    };

    const scrollToSlide = (idx: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: idx * scrollRef.current.clientWidth,
                behavior: 'smooth'
            });
            setCurrentIndex(idx);
        }
    };

    // Auto-slide every 5 seconds if there's more than one sale and not hovered
    useEffect(() => {
        if (sales.length <= 1 || isHovered) return;
        const timer = setInterval(() => {
            if (scrollRef.current) {
                const width = scrollRef.current.clientWidth;
                const nextIndex = (currentIndex + 1) % sales.length;
                scrollRef.current.scrollTo({
                    left: nextIndex * width,
                    behavior: 'smooth'
                });
                // State will be updated by handleScroll, but we can set it here too if we want
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [sales.length, currentIndex, isHovered]);

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
        <section 
            className="relative w-full flex flex-col items-center py-10 md:py-16 overflow-hidden bg-gradient-to-b from-white via-white to-[#F2F9F1]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
        >
            <div className="relative w-full block">
                {/* Top Ticket Jagged Edge */}
                <svg className="absolute -top-[2px] left-0 z-30 text-white pointer-events-none w-full h-[8px]">
                    <defs>
                        <pattern id="ticket-zigzag" width="12" height="20" patternUnits="userSpaceOnUse">
                            <rect width="12" height="1" fill="currentColor" />
                            <path d="M 0,1 C 0,7 8,7 8,1 Z" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ticket-zigzag)" />
                </svg>

                {/* Fixed Top Left: Offers & Sales Badge */}
                <div className="absolute top-[40px] md:top-[60px] left-[24px] md:left-[60px] flex items-center pointer-events-none z-20">
                    <div className="inline-flex h-[32px] items-center justify-center bg-red-600/90 backdrop-blur-md px-[16px] shadow-lg shadow-red-900/20 border border-red-500/50">
                        <span className="font-rajdhani text-[13px] font-bold tracking-normal uppercase text-white">Offers and Sales</span>
                    </div>
                </div>

                {/* Native Scroll Slider Container */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex w-full h-[550px] lg:h-[720px] overflow-x-auto overflow-y-hidden snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                >
                    {sales.map((sale) => (
                        <Link 
                            key={sale.id}
                            href={`/sale/${sale.slug}`} 
                            className="relative flex-[0_0_100%] h-full snap-start snap-always group cursor-pointer overflow-hidden block"
                            draggable={false}
                        >
                            <div className="absolute inset-0 z-0">
                                {sale.banner_image ? (
                                    <Image
                                        src={sale.banner_image}
                                        alt={sale.name}
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
                                <div className="absolute inset-x-0 bottom-0 h-2/3 md:h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
                            </div>

                            {/* Content Overlay Specific to this Sale */}
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {/* Top Right: Max Discount Badge */}
                                {sale.max_discount_percentage > 0 && (
                                    <div className="absolute top-[40px] md:top-[60px] right-[24px] md:right-[60px] flex items-center pointer-events-none z-20">
                                        <div className="inline-flex h-[32px] items-center justify-center drop-shadow-2xl">
                                            <span className="font-rajdhani text-[16px] md:text-[20px] font-bold tracking-wider uppercase text-white leading-none">
                                                Up to {sale.max_discount_percentage}% OFF
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {/* Bottom Left: Sale Name & Timer */}
                                <div className="absolute bottom-[85px] md:bottom-[110px] left-[24px] md:left-[60px] flex flex-col items-start pointer-events-auto">
                                    <div className="flex flex-col items-start gap-1 md:gap-2">
                                        <h2 className="font-rajdhani text-[24px] md:text-[36px] lg:text-[48px] font-bold leading-[1] text-white drop-shadow-2xl uppercase tracking-normal">
                                            {sale.name}
                                        </h2>
                                        
                                        {/* Timer */}
                                        {currentSale.id === sale.id && (
                                            <div className="flex items-center gap-1.5 md:gap-2 text-[13px] md:text-base font-medium text-white/90 drop-shadow-md">
                                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                                                <span>
                                                    {timeLeft ? `Ends in ${timeLeft}` : 'Ending Soon!'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Right: Browse Button */}
                                <div className="absolute bottom-[85px] md:bottom-[110px] right-[24px] md:right-[60px] z-20 pointer-events-auto">
                                    <div className="bg-white text-black px-4 py-2 md:px-5 md:py-2.5 font-rajdhani font-bold text-[14px] md:text-[16px] uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-xl shadow-black/20">
                                        Browse
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Slider Indicators */}
                {sales.length > 1 && (
                    <div className="absolute bottom-[50px] md:bottom-[70px] left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                        {sales.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.preventDefault(); scrollToSlide(idx); }}
                                className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-red-500' : 'w-2 bg-white/50 hover:bg-white'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Bottom Wave (New Arrivals Style) */}
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="absolute -bottom-[2px] left-0 w-full h-[30px] md:h-[45px] lg:h-[60px] z-30 text-[#F2F9F1] pointer-events-none -scale-x-100">
                    <path fill="currentColor" d="M0,40 C320,-20 500,100 850,70 C1150,40 1300,-10 1440,30 L1440,100 L0,100 Z" />
                </svg>
            </div>
        </section>
    );
}
