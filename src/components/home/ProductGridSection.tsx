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
            return 'bg-[#F2F9F1]';
        }
        if (titleLower.includes('popular')) {
            return 'bg-[#F1F7F9]';
        }
        if (titleLower.includes('new arrival')) {
            return 'bg-white';
        }

        return 'bg-white';
    };

    const bgColorClass = getBgColor(title);
    const visibleProducts = showAll ? products : products.slice(0, INITIAL_LIMIT);
    const hasMore = products.length > INITIAL_LIMIT;

    return (
        <section className={`mx-auto w-full max-w-[1440px] py-[32px]  lg:px-[48px] lg:py-[48px] md:py-[64px] transition-colors duration-300 ${bgColorClass}`}>
            {/* HEADER */}
            <div className="mb-[24px] flex items-center justify-between px-[24px] md:mb-[40px] md:px-0">
                <h2 className="font-titillium text-[20px] font-semibold tracking-[-0.8px] text-[#242424] md:text-[32px]">
                    {title}
                </h2>
                <Link 
                    href="/products" 
                    className="font-titillium text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]"
                    aria-label={`View all ${title}`}
                >
                    View All
                </Link>
            </div>

            {/* HORIZONTAL SCROLL ON MOBILE / GRID ON DESKTOP */}
            <div className="no-scrollbar flex w-full gap-[10px] overflow-x-auto px-[24px] pb-[10px] md:grid md:grid-cols-3 md:gap-[24px] md:px-0 lg:grid-cols-4 xl:grid-cols-5">
                {visibleProducts.map((product) => (
                    <ProductCard key={product.slug} {...product} />
                ))}
            </div>

            {/* SHOW MORE BUTTON */}
            {hasMore && !showAll && (
                <div className="flex justify-center mt-[16px] md:mt-[24px]">
                    <button
                        onClick={() => setShowAll(true)}
                        className="font-titillium text-[14px] font-semibold text-[#308026] bg-[#f2f9f1] hover:bg-[#e5f3e3] px-[24px] py-[10px] rounded-full transition-all active:scale-95"
                    >
                        Show all {products.length} products
                    </button>
                </div>
            )}
        </section>
    );
};

export default ProductGridSection;

