'use client';

import React from 'react';
import Link from 'next/link';
import MenuIcon from '@/components/icons/MenuIcon';
import HeartIcon from '@/components/icons/SearchIcon';
import CartIcon from '@/components/icons/CartIcon';
import SearchIcon from '@/components/icons/SearchIcon';

interface FloatingNavProps {
    bannerText?: string;
    showBanner?: boolean;
}

const FloatingNav: React.FC<FloatingNavProps> = ({
    bannerText = "Free Delivery for Orders above 5000",
    showBanner = true
}) => {
    return (
        <nav className="fixed top-[12px] left-1/2 z-[100] w-full -translate-x-1/2 px-[13px] md:top-[24px]">
            <div className="main-container mx-auto flex w-full max-w-[384px] flex-col items-start overflow-hidden rounded-[16px] border border-[#f1f5f9] bg-white p-[6px]  md:max-w-[1100px] lg:max-w-[1280px] md:p-[10px]">

                {/* TOP INTERACTIVE ROW */}
                <div className="flex h-[60px] w-full items-center justify-between px-[14px] md:h-[72px] md:px-[24px]">
                    {/* Menu */}
                    <button
                        className="flex items-center justify-center transition-transform active:scale-90"
                        aria-label="Menu"
                    >
                        <div className="h-[20px] w-[20px] md:h-[24px] md:w-[24px]">
                            <MenuIcon className="h-full w-full text-[#242424]" />
                        </div>
                    </button>

                    {/* RIGHT ACTION GROUP */}
                    <div className="flex items-center gap-[24px] md:gap-[32px]">
                        {/* Track Order CTA */}
                        <Link
                            href="/track-order"
                            className="flex h-[28px] items-center justify-center rounded-[6px] bg-[#000000] p-[2px_6px] transition-all hover:bg-[#1a1a1a] active:scale-95 md:h-[36px] md:px-[20px]"
                        >
                            <span className="font-titillium text-[12px] font-semibold tracking-[0.2px] text-white uppercase md:text-[13px] leading-[18px]">
                                Track Order
                            </span>
                        </Link>

                        {/* Search Link */}
                        <Link
                            href="/search"
                            className="flex items-center justify-center transition-transform active:scale-90"
                            aria-label="Wishlist"
                        >
                            <div className="h-[24px] w-[24px] md:h-[28px] md:w-[28px]">
                                <SearchIcon className="h-full w-full text-[#242424]" />
                            </div>
                        </Link>

                        {/* Cart Link */}
                        <Link
                            href="/cart"
                            className="flex items-center justify-center transition-transform active:scale-90"
                            aria-label="Cart"
                        >
                            <div className="h-[22px] w-[22px] md:h-[28px] md:w-[28px]">
                                <CartIcon className="h-full w-full text-[#242424]" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* CONDITIONALLY RENDERED PROMO BANNER */}
                {showBanner && (
                    <div className="flex w-full items-center justify-center rounded-[10px] bg-[#d6ff9c] py-[8px] md:py-[10px]">
                        <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#252525] md:text-[15px] md:font-medium">
                            {bannerText}
                        </span>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default FloatingNav;