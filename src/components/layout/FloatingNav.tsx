'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MenuIcon from '@/components/icons/MenuIcon';
import HeartIcon from '@/components/icons/SearchIcon';
import CartIcon from '@/components/icons/CartIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

// Lazy-load Sidebar — it's hidden by default, only shown on menu click
const Sidebar = dynamic(() => import('@/components/layout/Sidebar'), { ssr: false });

interface FloatingNavProps {
    bannerText?: string;
    showBanner?: boolean;
    alwaysScrolled?: boolean;
}

const FloatingNav: React.FC<FloatingNavProps> = ({
    bannerText = "Free Delivery for Orders above 5000",
    showBanner = true,
    alwaysScrolled = false
}) => {
    const { cartCount } = useCart();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(alwaysScrolled);
    const router = useRouter();

    useEffect(() => {
        if (alwaysScrolled) {
            setIsScrolled(true);
            return;
        }
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // run once on mount

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [alwaysScrolled]);

    return (
        <>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />
            
            <nav className="fixed top-[12px] left-1/2 z-[100] w-full -translate-x-1/2 px-[13px] md:top-[24px] lg:top-0 lg:left-0 lg:translate-x-0 lg:w-full lg:max-w-none lg:px-0 transform-gpu transition-[transform] duration-300 ease-out will-change-transform">
                <div 
                    className={`mx-auto flex w-full max-w-[384px] flex-col items-center overflow-hidden rounded-[16px] border p-[6px] md:max-w-[1100px] md:p-[10px] lg:max-w-none lg:w-full lg:rounded-none lg:p-0 transform-gpu transition-[background-color,border-color] duration-200 ease-out will-change-[background-color,border-color] ${
                        isScrolled 
                            ? 'border-[#f1f5f9] bg-white lg:border-none lg:border-b lg:border-[#f1f5f9]' 
                            : 'border-transparent bg-transparent lg:border-none'
                    }`}
                >

                    {/* TOP INTERACTIVE ROW */}
                    <div className="flex h-[60px] w-full items-center justify-between px-[14px] md:h-[72px] md:px-[24px] lg:h-[76px] lg:max-w-[1200px] lg:mx-auto lg:px-[24px]">
                        {/* Menu */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center justify-center transition-transform active:scale-90"
                            aria-label="Menu"
                        >
                            <div className="h-[20px] w-[20px] md:h-[24px] md:w-[24px] lg:h-[20px] lg:w-[20px]">
                                <MenuIcon className={`h-full w-full transition-colors duration-300 will-change-[color] ${isScrolled ? 'text-[#242424]' : 'text-[#ffffff]'}`} />
                            </div>
                        </button>

                        {/* RIGHT ACTION GROUP */}
                        <div className="flex items-center gap-[24px] md:gap-[32px]">
                            {/* Track Order CTA */}
                            <Link
                                href="/track-order"
                                className={`flex h-[28px] items-center justify-center rounded-[6px] p-[2px_6px] transition-[background-color,transform] duration-300 ease-in-out active:scale-95 md:h-[36px] md:px-[20px] lg:h-[32px] lg:px-[16px] ${
                                    isScrolled 
                                        ? 'bg-[#000000] hover:bg-[#1a1a1a]' 
                                        : 'bg-white hover:bg-[#f8fafc]'
                                }`}
                            >
                                <span className={`font-titillium text-[12px] font-semibold tracking-[0.2px] uppercase md:text-[13px] leading-[18px] transition-colors duration-300 will-change-[color] ${
                                    isScrolled 
                                        ? 'text-white' 
                                        : 'text-[#242424]'
                                }`}>
                                    Track Order
                                </span>
                            </Link>

                            {/* Search Link */}
                            <Link
                                href="/search"
                                className="flex items-center justify-center transition-transform active:scale-90"
                                aria-label="Search"
                            >
                                <div className="h-[24px] w-[24px] md:h-[28px] md:w-[28px] lg:h-[24px] lg:w-[24px] mb-[2px]">
                                    <SearchIcon className={`h-full w-full transition-colors duration-300 will-change-[color] ${isScrolled ? 'text-[#242424]' : 'text-[#ffffff]'}`} />
                                </div>
                            </Link>

                            {/* Cart Link */}
                            <a
                                href="/cart"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (window.innerWidth >= 1024) {
                                        useCartStore.getState().setCartOpen(true);
                                    } else {
                                        router.push('/cart');
                                    }
                                }}
                                className="relative flex items-center justify-center transition-transform active:scale-90"
                                aria-label="Cart"
                            >
                                <div className="relative h-[22px] w-[22px] md:h-[28px] md:w-[28px] lg:h-[22px] lg:w-[22px]">
                                    <CartIcon className={`h-full w-full transition-colors duration-300 will-change-[color] ${isScrolled ? 'text-[#242424]' : 'text-[#ffffff]'}`} />
                                    {cartCount > 0 && (
                                        <div className={`absolute -right-[12px] -top-[12px] flex h-[18px] min-w-[18px] items-center justify-center rounded-[6px] border-[1.5px] px-[5px] py-[2px] md:-right-[14px] md:-top-[14px] md:h-[22px] md:min-w-[22px] transition-[background-color,border-color] duration-300 ease-in-out will-change-[background-color,border-color] ${
                                            isScrolled 
                                                ? 'border-white bg-[#242424]' 
                                                : 'border-[#242424] bg-white'
                                        }`}>
                                            <span className={`font-titillium text-[10px] font-normal leading-none md:text-[13px] transition-colors duration-300 will-change-[color] ${
                                                isScrolled 
                                                    ? 'text-white' 
                                                    : 'text-[#242424]'
                                            }`}>
                                                {cartCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* CONDITIONALLY RENDERED PROMO BANNER */}
                    {showBanner && (
                        <div className={`flex w-full items-center justify-center py-[8px] md:py-[10px] transition-[background-color,border-radius] duration-300 ease-in-out will-change-[background-color] ${
                            isScrolled 
                                ? 'rounded-[10px] bg-[#d6ff9c] lg:rounded-none lg:w-full lg:max-w-none' 
                                : 'bg-transparent'
                        }`}>
                            <span className={`font-titillium text-[14px] font-[400] leading-[18px] md:text-[15px] md:font-medium transition-colors duration-300 will-change-[color] ${
                                isScrolled 
                                    ? 'text-[#252525]' 
                                    : 'text-white'
                            }`}>
                                {bannerText}
                            </span>
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default FloatingNav;
