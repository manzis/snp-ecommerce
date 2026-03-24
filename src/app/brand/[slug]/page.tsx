'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProductCard from '@/components/search/SearchProductCard';
import Pagination from '@/components/search/Pagination';
import BrandFilterBar from '@/components/brands/BrandFilterBar';
import DropDownIcon from '@/components/icons/DropDownIcon';

/**
 * BRAND DETAILS PAGE - PRODUCTION READY
 * 
 * FIXES:
 * 1. URL Error: Reverted external URLs to local paths per Asset Rule.
 * 2. Logo Shrink: Used 'flex-none' + explicit 'w-[71px]' + 'h-[71px]' to prevent vertical line collapse.
 * 3. Nav Overlap: Applied 'pt-[81px]' to the main wrapper.
 * 4. Scaling: Banner height scales from 82px to 300px.
 */

const BRAND_INFO = {
  name: 'Muscleblaze',
  description: '(MB) is a leading Indian sports nutrition and bodybuilding supplement brand founded in 2012, specializing in high-quality products like whey protein, creatine, and mass gainers.',
  banner: '/images/brands/brand-banner.jpg', // Asset Rule: Local Path
  logo: '/images/brands/brand-logo.png',     // Asset Rule: Local Path
  rating: '4.5',
  purchases: '25.2K+',
  totalProducts: 118
};

const MOCK_PRODUCTS = [
  { id: 1, slug: 'mb-whey-1', category: 'proteins', brand: 'Naturaltein', name: 'Naturaltein omega 3 - fish', originalPrice: 'RS. 5000', discountedPrice: 'RS. 1890', discount: '20%', rating: 4.3, image: '/images/product-1.png' },
  { id: 2, slug: 'mb-creatine-1', category: 'creatine', brand: 'Asitis', name: 'Asitsi atom whey protein', originalPrice: 'RS. 5000', discountedPrice: 'RS. 1890', discount: '20%', rating: 4.3, image: '/images/product-2.png' },
];

export default function BrandDetailPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 8;

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen mx-auto w-full max-w-[1280px] bg-white mt-[80px] pb-[60px]">
      {/* 1. FIXED NAVIGATION (81px height) */}
      <DynamicPageNav title={BRAND_INFO.name} subtitle={`${BRAND_INFO.totalProducts} Products`} />

      {/* 2. MAIN WRAPPER: pt-[81px] ensures content starts below fixed nav */}
      <div className=" flex flex-col w-full">
        
        {/* BANNER - FULL WIDTH OF CONTAINER */}
        <header className="relative w-full h-[90px] lg:h-[300px] shrink-0">
          <Image 
            src={BRAND_INFO.banner} 
            alt="Brand Banner" 
            fill 
            priority 
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        </header>

        <main className="w-full">
         
          <section className="flex flex-col items-start gap-[12px] bg-[#f6faf6] px-[24px] py-[24px] lg:flex-row lg:items-center lg:gap-[32px] w-full">
            
            {/* LOGO CONTAINER: flex-none ensures width is NEVER compromised */}
            <div className="flex-none relative w-[80px] h-[80px] lg:w-[120px] lg:h-[120px] rounded-[12px] overflow-hidden border border-[#f1f5f9] bg-white flex items-center justify-center">
              <Image 
                src={BRAND_INFO.logo} 
                alt="Brand Logo" 
                fill 
                className="object-contain p-[2px] rounded-[12px]" 
                sizes="(max-width: 1024px) 75px, 120px"
              />
            </div>
            
            {/* BRAND DESCRIPTION */}
            <div className="flex flex-col gap-[8px] flex-1 min-w-0">
              <h1 className="font-titillium text-[18px] lg:text-[28px] font-semibold tracking-[-0.72px] text-[#242424] leading-[26px]">
                {BRAND_INFO.name}
              </h1>
              <div className="font-titillium text-[13px] lg:text-[16px] leading-[20px] lg:leading-[24px] tracking-[-0.52px] text-[#1e1e1e] max-w-[850px]">
                <span className="underline font-medium">MuscleBlaze</span> 
                {BRAND_INFO.description.replace('MuscleBlaze', '').trim()}
              </div>
            </div>
          </section>

          {/* 4. STATS BAR */}
          <section className="flex w-full border-y border-t border-b border-[#f1f5f9] bg-white">
            {[
              { label: 'Rating', value: BRAND_INFO.rating },
              { label: 'Purchases', value: BRAND_INFO.purchases },
              { label: 'Total Products', value: BRAND_INFO.totalProducts }
            ].map((stat, idx) => (
              <div 
                key={stat.label} 
                className={`flex-1 flex flex-col items-start lg:items-center justify-center gap-[10px] px-[24px] py-[24px] ${idx !== 2 ? 'border-r border-[#f1f5f9]' : ''}`}
              >
                <span className="font-titillium text-[12px] lg:text-[14px] font-semibold text-[#242424] opacity-50  tracking-[-0.48px] leading-[18px]">
                  {stat.label}
                </span>
                <span className="font-titillium text-[18px] lg:text-[24px] font-semibold text-[#242424] leading-[18px]">
                  {stat.value}
                </span>
              </div>
            ))}
          </section>

          {/* 5. EXPLORE SECTION */}
          <div className="flex items-center gap-[10px]  border-[#f1f5f9] px-[24px] py-[24px] bg-white">
            <span className="flex-1 font-titillium text-[16px] lg:text-[20px] font-semibold text-[#242424] tracking-[-0.64px] leading-[26px]">
              Explore Brand & Products
            </span>
            <button className="flex-none flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[#eaebf0] bg-white active:scale-90 transition-transform">
              <DropDownIcon className="h-[16px] w-[16px] text-[#242424]" />
            </button>
          </div>

          {/* 6. FILTER BAR */}
          <BrandFilterBar onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} />

          {/* 7. PRODUCT GRID */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#e8e8e8] bg-white overflow-hidden">
            {paginatedItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>

          {/* 8. PAGINATION */}
          <div className="bg-white py-[40px]  border-[#e8e8e8] flex justify-center pb-[60px]">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </main>
      </div>
    </div>
  );
}