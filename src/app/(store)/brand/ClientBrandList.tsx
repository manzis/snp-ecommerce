'use client';

import React, { useState } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import BrandCard from '@/components/brands/BrandCard';
import ArrowDownIcon from '@/components/icons/CaretDownIcon';
import type { Brand as DBBrand } from '@/services/productService';
import { BRAND_THEMES } from '@/lib/BrandThemes';

interface ClientBrandListProps {
  brands: DBBrand[];
}

export default function ClientBrandList({ brands }: ClientBrandListProps) {
  const [visibleCount, setVisibleCount] = useState(4);

  const POPULAR_BRANDS = brands.filter(b => (b.rating || 0) >= 4.5).slice(0, 3);
  const ALL_BRANDS_DATA = brands;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, ALL_BRANDS_DATA.length));
  };

  const mapToUIBrand = (b: DBBrand) => {
    const slug = b.slug.toLowerCase();
    const theme = BRAND_THEMES[slug] || BRAND_THEMES[slug.replace(/-/g, '')] || BRAND_THEMES.default;

    return {
      uiBrand: {
        id: Number(b.id) || 0,
        slug: b.slug,
        name: b.name,
        logo: b.image_url || '/images/brands/brand-logo.png',
        rating: b.rating?.toString() || '4.5',
        reviews: '10K+', // Placeholder until stats table is added
        totalProducts: b.product_count || 0
      },
      colors: theme.cardColors
    };
  };

  return (
    <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px]">
      <DynamicPageNav title="Brands" subtitle={`${POPULAR_BRANDS.length + ALL_BRANDS_DATA.length} Brands`} />

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {/* POPULAR BRANDS */}
        <section className="flex flex-col gap-[24px] lg:mt-[24px] px-[24px] py-[24px] bg-[#f6faf6] border-b border-[#f1f5f9]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#242424]">
            Popular Brands
          </h2>
          <div className="no-scrollbar flex w-full gap-[12px] overflow-x-auto pb-[4px]">
            {POPULAR_BRANDS.map((brand) => {
              const { uiBrand, colors } = mapToUIBrand(brand);
              return <BrandCard key={brand.id} brand={uiBrand} colors={colors} layout="popular" />;
            })}
          </div>
        </section>

        {/* ALL BRANDS */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
          <h2 className="font-titillium text-[18px] font-semibold leading-[26px] tracking-[-0.4px] text-[#242424]">
            All Brands
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[12px] gap-y-[24px]">
            {ALL_BRANDS_DATA.slice(0, visibleCount).map((brand) => {
              const { uiBrand, colors } = mapToUIBrand(brand);
              return <BrandCard key={brand.id} brand={uiBrand} colors={colors} layout="grid" />;
            })}
          </div>

          {/* SHOW MORE BUTTON */}
          {visibleCount < ALL_BRANDS_DATA.length && (
            <div className="mt-[24px] flex w-full justify-center">
              <button
                onClick={handleShowMore}
                className="flex h-[36px] px-[16px] py-[8px] items-center justify-center gap-[6px] rounded-[6px] border border-[#eaebf0] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-all outline-none"
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
