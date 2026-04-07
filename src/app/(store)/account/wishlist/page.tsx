'use client';

import React from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';

const WishlistPage = () => {
    return (
        <div className="min-h-screen bg-[#f7faf6] pt-[81px]">
            <DynamicPageNav title="My Wishlist" />
            <main className="mx-auto w-full max-w-[1280px] p-[24px]">
                <div className="rounded-[24px] bg-white p-[48px] text-center shadow-sm">
                    <p className="font-titillium text-[18px] text-[#242424]">Demo Page: Your wishlist items will appear here.</p>
                </div>
            </main>
        </div>
    );
};

export default WishlistPage;
