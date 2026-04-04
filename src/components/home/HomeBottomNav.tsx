'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// Icon imports
import PackageIcon2 from '@/components/icons/PackageIcon2';
import CategoryIcon from '@/components/icons/CategoryIcon';
import ContactUsIcon from '@/components/icons/ContactUsIcon';
import AccountIcon from '@/components/icons/AccountIcon';

const NAV_ITEMS = [
    { label: 'Home', icon: PackageIcon2, href: '/' },
    { label: 'Products', icon: AccountIcon, href: '/search' },
    { label: 'Categories', icon: CategoryIcon, href: '/category' },
    { label: 'Contact', icon: ContactUsIcon, href: '/contact' },
    { label: 'Account', icon: AccountIcon, href: '/profile' },

];

const HomeBottomNav: React.FC = () => {
    const pathname = usePathname();
    const [isScrollVisible, setIsScrollVisible] = useState(true);

    const activeIndex = useMemo(() => {
        const index = NAV_ITEMS.findIndex(item =>
            item.href === '/category' ? pathname.startsWith('/category') : pathname === item.href
        );
        return index;
    }, [pathname]);

    const isExcludedPage = useMemo(() =>
        pathname === '/cart' ||
        pathname === '/checkout' ||
        pathname.startsWith('/product'),
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

    if (isExcludedPage) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pointer-events-none md:hidden">
            <motion.nav
                initial={false}
                animate={{
                    y: isScrollVisible ? 0 : 100,
                    opacity: isScrollVisible ? 1 : 0
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="pointer-events-auto relative flex h-[86px] w-[410px] items-center justify-between bg-white px-[12px] shadow-[0_-1px_4px_0_rgba(0,0,0,0.04)] will-change-transform"
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