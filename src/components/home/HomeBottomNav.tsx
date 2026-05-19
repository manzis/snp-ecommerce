'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Icon imports
import PackageIcon2 from '@/components/icons/PackageIcon2';
import CategoryIcon from '@/components/icons/CategoryIcon';
import ContactUsIcon from '@/components/icons/ContactUsIcon';
import AccountIcon from '@/components/icons/AccountIcon';
import ProductIcon from '@/components/icons/ProductIcon';
import { useCart } from '@/context/CartContext';
import { useUIStore } from '@/store/uiStore';

const NAV_ITEMS = [
    { label: 'Home', icon: PackageIcon2, href: '/' },
    { label: 'Products', icon: ProductIcon, href: '/products' },
    { label: 'Categories', icon: CategoryIcon, href: '/category' },
    { label: 'Contact', icon: ContactUsIcon, href: '/contact' },
    { label: 'Account', icon: AccountIcon, href: '/account' },

];

const HomeBottomNav: React.FC = () => {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const hideBottomNav = useUIStore(state => state.hideBottomNav);
    const [isScrollVisible, setIsScrollVisible] = useState(pathname !== '/');
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
        pathname.startsWith('/product/') ||
        pathname === '/track-order' ||
        pathname.startsWith('/track-order/'),
        [pathname]);

    useEffect(() => {
        if (isExcludedPage) return;
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const isAtBottom = (currentScrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 120);

                    if (isAtBottom) {
                        setIsScrollVisible(false);
                    } else if (pathname === '/' && currentScrollY < 20) {
                        setIsScrollVisible(false);
                    } else {
                        setIsScrollVisible(true);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Zero-reflow initial state check on page transition/mount
        const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        if (pathname === '/' && currentScrollY < 20) {
            setIsScrollVisible(false);
        } else {
            setIsScrollVisible(true);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isExcludedPage, pathname]);

    if (isExcludedPage || hideBottomNav) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none md:hidden">
            {/* Cart Checkout Indicator - Mobile Only */}
            <>
                {isIndicatorVisible && (
                    <div
                        className="pointer-events-auto mb-[12px] transition-all duration-300 ease-out will-change-transform animate-page-enter"
                        style={{
                            transform: `translateY(${isScrollVisible ? 0 : 100}px) translateZ(0)`,
                            opacity: isScrollVisible ? 1 : 0
                        }}
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
                    </div>
                )}
            </>

            <nav
                className="pointer-events-auto relative flex w-[410px] items-center justify-between bg-white px-[12px] shadow-[0_-1px_4px_0_rgba(0,0,0,0.04)] transition-all duration-300 ease-out will-change-transform"
                style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom) + 7px)',
                    paddingTop: '5px',
                    transform: `translateY(${isScrollVisible ? 0 : 120}px) translateZ(0)`,
                    WebkitTransform: `translateY(${isScrollVisible ? 0 : 120}px) translateZ(0)`,
                    opacity: isScrollVisible ? 1 : 0
                }}
            >
                {/* INDICATOR LAYER */}
                <div className="absolute inset-x-0 top-0 bottom-0 px-[12px] pointer-events-none z-[1]">
                    <div className="relative w-full h-full">
                        {activeIndex !== -1 && (
                            <div
                                key="nav-sliding-indicator"
                                className="absolute top-0 h-full w-[20%] transition-transform duration-300 ease-out will-change-transform"
                                style={{
                                    transform: `translateX(${activeIndex * 100}%) translateZ(0)`,
                                    WebkitTransform: `translateX(${activeIndex * 100}%) translateZ(0)`
                                }}
                            >
                                <div className="absolute top-0 left-1/2 h-[4px] w-[32px] -translate-x-1/2 rounded-b-[12px] bg-[#3f9633] z-[3]" />
                                <div
                                    className="absolute top-[8px] left-1/2 h-[38px] w-[60px] -translate-x-1/2 rounded-[12px]"
                                    style={{ background: 'linear-gradient(180deg, #EAFFCD 0%, rgba(255,255,255,0) 100%)' }}
                                />
                            </div>
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
                            className="relative flex h-full flex-1 basis-0 flex-col items-center justify-center gap-[4px] py-[8px] outline-none z-10 group"
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
            </nav>
        </div>
    );
};

export default HomeBottomNav;
