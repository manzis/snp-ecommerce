'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Icon imports
import PackageIcon2 from '@/components/icons/PackageIcon2';
import CategoryIcon from '@/components/icons/CategoryIcon';
import ContactUsIcon from '@/components/icons/ContactUsIcon';
import AccountIcon from '@/components/icons/AccountIcon';
import { useCart } from '@/context/CartContext';
import { useUIStore } from '@/store/uiStore';

const NAV_ITEMS = [
    { label: 'Home', icon: PackageIcon2, href: '/' },
    { label: 'Products', icon: AccountIcon, href: '/products' },
    { label: 'Categories', icon: CategoryIcon, href: '/category' },
    { label: 'Contact', icon: ContactUsIcon, href: '/contact' },
    { label: 'Account', icon: AccountIcon, href: '/account' },

];

const HomeBottomNav: React.FC = () => {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const hideBottomNav = useUIStore(state => state.hideBottomNav);
    const [isScrollVisible, setIsScrollVisible] = useState(true);
    const [showIndicator, setShowIndicator] = useState(true);

    useEffect(() => {
        setShowIndicator(true);
        const timer = setTimeout(() => {
            setShowIndicator(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [pathname]);

    const isIndicatorVisible = useMemo(() => {
        if (cartCount === 0) return false;
        const isExcludedPath = pathname.startsWith('/account') || pathname === '/login';
        if (isExcludedPath) return false;
        return showIndicator;
    }, [cartCount, pathname, showIndicator]);

    const activeIndex = useMemo(() => {
        const index = NAV_ITEMS.findIndex(item => {
            if (item.href === '/') return pathname === '/';
            return pathname.startsWith(item.href);
        });
        return index;
    }, [pathname]);

    const isExcludedPage = useMemo(() =>
        pathname === '/cart' ||
        pathname === '/checkout' ||
        pathname === '/product' ||
        pathname.startsWith('/product/'),
        [pathname]);

    useEffect(() => {
        if (isExcludedPage) return;
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const isAtBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 120);
                    setIsScrollVisible(!isAtBottom);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isExcludedPage]);

    if (isExcludedPage || hideBottomNav) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none md:hidden">
            {/* Cart Checkout Indicator - Mobile Only */}
            <AnimatePresence>
                {isIndicatorVisible && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{
                            y: isScrollVisible ? 0 : 100,
                            opacity: isScrollVisible ? 1 : 0
                        }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="pointer-events-auto mb-[12px]"
                    >
                        <div
                            className="rounded-[13px] p-[1px]"
                            style={{ background: 'linear-gradient(90deg, #E5D200 0%, #F2EFD8 100%)' }}
                        >
                            <Link
                                href="/cart"
                                className="flex h-[40px] w-[362px] items-center justify-between rounded-[12px] px-[12px] py-[8px] "
                                style={{ background: 'linear-gradient(95.13deg, #ffe900 0%, #ffffff 100%)' }}
                            >
                                {/* Right side: Cart Icon and Items Waiting text */}
                                <div className="flex items-center gap-[8px] relative">
                                    <div
                                        className="w-[20px] h-[20px] shrink-0 bg-cover bg-center bg-no-repeat relative z-[1]"
                                        style={{ backgroundImage: 'url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-04-05/rB9TyiwxLp.png)' }}
                                    />
                                    <div className="flex items-center gap-[12px] relative z-[2]">
                                        <div className="font-titillium text-[16px] leading-[18px] text-[#242424] relative z-[3] whitespace-nowrap">
                                            <span className="font-normal">Items in your cart waiting </span>
                                            <span className="font-semibold">({cartCount})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Left side: Checkout and arrow */}
                                <div className="flex items-center gap-[6px] relative z-[4]">
                                    <span className="font-titillium text-[16px] font-semibold leading-[18px] text-[#308026] relative z-[6]">Checkout</span>
                                    <div
                                        className="w-[14px] h-[14px] shrink-0 bg-cover bg-center bg-no-repeat relative z-[7]"
                                        style={{ backgroundImage: 'url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2026-04-05/93yC2vW1Ya.png)' }}
                                    />
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.nav
                initial={false}
                animate={{
                    y: isScrollVisible ? 0 : 100,
                    opacity: isScrollVisible ? 1 : 0
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="pointer-events-auto relative flex h-[86px] w-[410px] items-center justify-between bg-white  px-[12px] shadow-[0_-1px_4px_0_rgba(0,0,0,0.04)] will-change-transform"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    WebkitTransform: 'translateZ(0)'
                }}
            >
                {/* INDICATOR LAYER */}
                <div className="absolute inset-x-0 top-0 bottom-0 px-[12px] pointer-events-none z-[1]">
                    <div className="relative w-full h-full">
                        {activeIndex !== -1 && (
                            <motion.div
                                // FIXED: Added unique key for the conditional block
                                key="nav-sliding-indicator"
                                className="absolute top-0 h-full w-[20%]"
                                initial={false}
                                animate={{ x: `${activeIndex * 100}%` }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            >
                                <div className="absolute top-0 left-1/2 h-[4px] w-[32px] -translate-x-1/2 rounded-b-[12px] bg-[#3f9633] z-[3]" />
                                <div
                                    className="absolute top-[12px] left-1/2 h-[38px] w-[60px] -translate-x-1/2 rounded-[12px]"
                                    style={{ background: 'linear-gradient(180deg, #EAFFCD 0%, rgba(255,255,255,0) 100%)' }}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* INTERACTIVE LAYER */}
                {NAV_ITEMS.map((item) => {
                    const isActive = activeIndex !== -1 && NAV_ITEMS[activeIndex].label === item.label;
                    const Icon = item.icon;

                    return (
                        <Link
                            // FIXED: Prefixed key to avoid collisions with other UI lists
                            key={`bottom-nav-${item.label}`}
                            href={item.href}
                            prefetch={true}
                            onClick={(e) => {
                                if (isActive) {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className="relative flex h-full flex-1 basis-0 flex-col items-center justify-center gap-[8px] py-[12px] outline-none z-10 group"
                        >
                            <div className={`relative h-[24px] w-[24px] flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-active:scale-95'}`}>
                                <Icon className={`h-full w-full ${isActive ? 'text-[#242424]' : 'text-[#626262]'}`} />
                            </div>
                            <span className={`relative font-titillium text-[12px] font-semibold leading-[18px] transition-colors duration-300 ${isActive ? 'text-[#242424]' : 'text-[#626262]'
                                }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default HomeBottomNav;