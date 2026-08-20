'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/home/ProductCard';

interface ProductGridSectionProps {
    title: string;
    products: any[];
}

// Show limited cards initially to reduce HTTP requests
// Mobile: 4 visible in scroll, Desktop: 5 in grid
const INITIAL_LIMIT = 5;

const ProductGridSection: React.FC<ProductGridSectionProps> = ({ title, products }) => {
    const [showAll, setShowAll] = useState(false);

    const getBgColor = (sectionTitle: string) => {
        const titleLower = sectionTitle.toLowerCase();

        if (titleLower.includes('best seller')) {
            return 'bg-white';
        }
        if (titleLower.includes('popular')) {
            return 'bg-[#F1F7F9]';
        }
        if (titleLower.includes('new arrival')) {
            return 'bg-[#F2F9F1]';
        }

        return 'bg-white';
    };

    const bgColorClass = getBgColor(title);
    const visibleProducts = showAll ? products : products.slice(0, INITIAL_LIMIT);
    const hasMore = products.length > INITIAL_LIMIT;

    const titleLower = title.toLowerCase();
    const isNewArrival = titleLower.includes('new arrival');
    const isPopular = titleLower.includes('popular');
    
    // Enable waves for both sections
    const hasTopWave = false;
    const hasBottomWave = isNewArrival || isPopular;
    const waveColorClass = isNewArrival ? 'text-[#F2F9F1]' : (isPopular ? 'text-[#F1F7F9]' : '');
    
    const paddingClass = isNewArrival 
        ? 'pt-[40px] pb-[32px] lg:px-[48px] lg:pt-[48px] lg:pb-[48px] md:pt-[56px] md:pb-[64px]'
        : 'pt-[48px] pb-[32px] lg:px-[48px] lg:pt-[64px] lg:pb-[48px] md:pt-[80px] md:pb-[64px]';

    return (
        <section className={`mx-auto w-full flex flex-col items-center ${(hasTopWave || hasBottomWave) ? 'mb-4' : ''} ${hasTopWave ? 'mt-4' : ''}`}>
            {hasTopWave && (
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={`w-full h-[45px] md:h-[60px] lg:h-[80px] block ${waveColorClass} pointer-events-none`}>
                    <path fill="currentColor" d="M0,50 C240,20 480,80 720,50 C960,20 1200,80 1440,50 L1440,100 L0,100 Z" />
                </svg>
            )}

            <div className={`w-full ${bgColorClass} ${paddingClass} transition-colors duration-300`}>
                {/* HEADER */}
                <div className="mb-[24px] max-w-[1440px] mx-auto flex items-center justify-between px-[24px] md:mb-[40px] md:px-0">
                    <h2 className="font-rajdhani text-[20px] font-bold text-[#242424] md:text-[32px]">
                        {title}
                    </h2>
                    <Link
                        href="/products"
                        className="font-rajdhani text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]"
                        aria-label={`View all ${title}`}
                    >
                        View All
                    </Link>
                </div>

                {/* HORIZONTAL SCROLL ON MOBILE / GRID ON DESKTOP */}
                <div className="no-scrollbar flex max-w-[1440px] mx-auto w-full gap-[10px] overflow-x-auto px-[24px] pb-[10px] md:grid md:grid-cols-3 md:gap-[24px] md:px-0 lg:grid-cols-4 xl:grid-cols-5">
                    {visibleProducts.map((product) => (
                        <ProductCard key={product.slug} {...product} />
                    ))}
                </div>

                {/* SHOW MORE BUTTON */}
                {hasMore && !showAll && (
                    <div className="flex justify-center mt-[16px] md:mt-[24px]">
                        <button
                            onClick={() => setShowAll(true)}
                            className="font-rajdhani text-[13px] font-semibold text-[#308026] bg-transparent border border-[#308026] hover:bg-[#308026] hover:text-white active:bg-[#308026] active:text-white px-[20px] py-[8px] rounded-full transition-all active:scale-95"
                        >
                            Show all {products.length} products
                        </button>
                    </div>
                )}
            </div>

            {hasBottomWave && (
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={`w-full h-[45px] md:h-[60px] lg:h-[80px] block ${waveColorClass} pointer-events-none -scale-x-100`}>
                    <path fill="currentColor" d="M0,40 C320,-20 500,100 850,70 C1150,40 1300,-10 1440,30 L1440,0 L0,0 Z" />
                </svg>
            )}
        </section>
    );
};

export default ProductGridSection;

