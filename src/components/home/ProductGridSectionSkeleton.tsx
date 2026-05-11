import React from 'react';
import ProductCardSkeleton from '@/components/home/ProductCardSkeleton';

interface ProductGridSectionSkeletonProps {
    bgColor?: string;
}

/**
 * Skeleton loader that mirrors the ProductGridSection layout.
 * Shows a section title placeholder + a row of ProductCardSkeletons.
 */
const ProductGridSectionSkeleton: React.FC<ProductGridSectionSkeletonProps> = ({ bgColor = 'bg-white' }) => {
    return (
        <section className={`mx-auto w-full max-w-[1440px] py-[32px] lg:px-[48px] lg:py-[48px] md:py-[64px] ${bgColor}`}>
            {/* HEADER SKELETON */}
            <div className="mb-[24px] flex items-center justify-between px-[24px] md:mb-[40px] md:px-0 animate-pulse">
                <div className="h-[28px] w-[160px] rounded-lg bg-gray-200 md:h-[36px] md:w-[220px]" />
                <div className="h-[18px] w-[70px] rounded bg-gray-200" />
            </div>

            {/* PRODUCT CARDS SKELETON — matches scroll/grid layout */}
            <div className="no-scrollbar flex w-full gap-[10px] overflow-x-auto px-[24px] pb-[10px] md:grid md:grid-cols-3 md:gap-[24px] md:px-0 lg:grid-cols-4 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </section>
    );
};

export default ProductGridSectionSkeleton;
