'use client';

import React, { useState } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import BrandCard, { Brand } from '@/components/brands/BrandCard';
import ArrowDownIcon from '@/components/icons/CaretDownIcon'; // For the button

const POPULAR_BRANDS: Brand[] = [
  { id: 1, name: 'MUSCLEBLAZE', logo: '/images/brands/muscleblaze.png', rating: '4.3', reviews: '24.5K+', totalProducts: 129 },
  { id: 2, name: 'ASITIS NUTRITION', logo: '/images/brands/asitis.png', rating: '4.3', reviews: '18.2K+', totalProducts: 84 },
  { id: 3, name: 'OPTIMUM NUTRITION', logo: '/images/brands/on.png', rating: '4.8', reviews: '30K+', totalProducts: 210 },
];

const ALL_BRANDS_DATA: Brand[] = [
  { id: 4, name: 'OPTIMUM NUTRITION', logo: '/images/brands/on.png', rating: '4.8', totalProducts: 210 },
  { id: 5, name: 'CARBAMIDE FORTE', logo: '/images/brands/cf.png', rating: '4.2', totalProducts: 156 },
  { id: 6, name: 'DYMATIZE', logo: '/images/brands/dym.png', rating: '4.7', totalProducts: 92 },
  { id: 7, name: 'GNC', logo: '/images/brands/gnc.png', rating: '4.4', totalProducts: 320 },
  { id: 8, name: 'MYPROTEIN', logo: '/images/brands/myp.png', rating: '4.6', totalProducts: 412 },
  { id: 9, name: 'RULE 1', logo: '/images/brands/r1.png', rating: '4.5', totalProducts: 78 },
];

export default function BrandsPage() {
  const [visibleCount, setVisibleCount] = useState(4);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, ALL_BRANDS_DATA.length));
  };

  return (
    <div className="min-h-screen mx-auto w-full max-w-[1280px] bg-white mt-[80px] pb-[60px]">
      <DynamicPageNav title="Brands" subtitle={`${POPULAR_BRANDS.length + ALL_BRANDS_DATA.length} Brands`} />

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {/* POPULAR BRANDS: Horizontal Scroll */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#242424]">
            Popular Brands
          </h2>
          <div className="no-scrollbar flex w-full gap-[12px] overflow-x-auto pb-[4px]">
            {POPULAR_BRANDS.map((brand) => (
              <BrandCard key={brand.id} brand={brand} layout="popular" />
            ))}
          </div>
        </section>

        {/* ALL BRANDS: Equal Width Grid */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px] border-t border-[#f1f5f9]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#242424]">
            All Brands
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[12px] gap-y-[24px]">
            {ALL_BRANDS_DATA.slice(0, visibleCount).map((brand) => (
              <BrandCard key={brand.id} brand={brand} layout="grid" />
            ))}
          </div>

          {/* PIXEL PERFECT SHOW MORE BUTTON */}
          {visibleCount < ALL_BRANDS_DATA.length && (
            <div className="mt-[24px] flex w-full justify-center">
              <button
                onClick={handleShowMore}
                className="flex  h-[36px] px-[12px] py-[8px] items-center justify-center gap-[6px] rounded-[6px] border border-[#eaebf0] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-all outline-none"
              >
                <span className="font-inter text-[14px] font-semibold leading-[20px] tracking-[0.1px] text-[#252525]">
                  Show More
                </span>
                <div className="h-[16px] w-[16px] flex items-center justify-center">
                  <ArrowDownIcon className="h-full w-full text-[#252525]" />
                </div>
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}