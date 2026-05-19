import React from 'react';
import ProductNav from '@/components/product/ProductNav';

/**
 * Shared premium loading skeleton for the Product Details page.
 * Renders the actual interactive ProductNav instantly at the top.
 * Deduplicates code between loading.tsx and the page.tsx Suspense boundary
 * to guarantee zero layout shifts when data finishes loading.
 */
export default function ProductPageSkeleton() {
  return (
    <article className="relative min-h-screen bg-white">
      {/* FIXED HEADER SECTION */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#F5F5F5] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        <div className="pointer-events-auto relative w-full max-w-[410px] md:max-w-7xl mx-auto">
          <ProductNav />
          <div className="px-0">
            <div className="flex w-full lg:px-[60px] mx-auto min-w-0 px-[24px] pb-[16px] pt-[6px] items-center shrink-0 flex-wrap bg-white md:bg-transparent">
              <div className="h-[14px] w-[180px] animate-pulse bg-gray-100 rounded-[4px]" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[140px] pb-[32px] px-0">
        <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">

          {/* LEFT COLUMN: IMAGERY SKELETON */}
          <div className="w-full max-w-[700px] lg:max-w-[1000] lg:w-[58%] px-[24px] lg:px-[0] flex flex-col gap-y-[32px] animate-pulse">
            {/* Main Product Image Container */}
            <div className="w-full aspect-[4/5] lg:aspect-square bg-gray-100 rounded-[16px]" />
            {/* Image Thumbnails */}
            <div className="flex gap-[12px] mt-[12px] overflow-hidden">
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
            </div>
            
            {/* Desktop Highlights Skeleton */}
            <div className="hidden lg:block w-full h-[140px] bg-gray-50 rounded-[16px] mt-4" />
            {/* Desktop Details Skeleton */}
            <div className="hidden lg:block w-full h-[220px] bg-gray-50 rounded-[16px] mt-4" />
          </div>

          {/* RIGHT COLUMN: DETAILS SKELETON */}
          <div className="w-full max-w-[700px] lg:max-w-none lg:w-[38%] flex flex-col px-[24px] lg:px-[0] animate-pulse">
            {/* Brand/Logo Row */}
            <div className="flex items-center gap-[4px] mb-4">
              <div className="w-[18px] h-[18px] bg-gray-100 rounded-[3px]" />
              <div className="w-[80px] h-[16px] bg-gray-100 rounded-[4px]" />
            </div>

            {/* Title */}
            <div className="w-[90%] h-[30px] bg-gray-200 rounded-[6px] mb-3" />
            <div className="w-[60%] h-[30px] bg-gray-200 rounded-[6px] mb-6" />

            {/* Pricing */}
            <div className="flex items-center gap-[10px] mb-8">
              <div className="w-[63px] h-[22px] bg-[#94ff00]/40 rounded-[6px]" />
              <div className="w-[80px] h-[28px] bg-gray-100 rounded-[6px]" />
              <div className="w-[100px] h-[28px] bg-[linear-gradient(87.93deg,#318126_10.71%,#33D81D_124.28%)] opacity-20 rounded-[6px]" />
            </div>

            {/* Selector Options */}
            <div className="flex flex-col gap-y-4 mb-6">
              <div className="w-full h-[64px] bg-gray-50 rounded-[12px]" />
              <div className="w-full h-[64px] bg-gray-50 rounded-[12px]" />
            </div>

            {/* Desktop Only CTA Skeleton */}
            <div className="hidden lg:flex w-full flex-row gap-[16px] mb-8">
              <div className="flex-1 h-[60px] bg-gray-50 rounded-[12px]" />
              <div className="flex-1 h-[60px] bg-gray-100 rounded-[12px]" />
            </div>

            {/* Offers/Bundle Skeleton */}
            <div className="flex flex-col gap-y-4 mb-8">
              <div className="w-full h-[90px] bg-gray-50 rounded-[16px]" />
              <div className="w-full h-[150px] bg-gray-50 rounded-[16px]" />
            </div>
            
            {/* Delivery/Service Highlights */}
            <div className="w-full h-[180px] bg-gray-50 rounded-[16px] mb-8" />
          </div>

        </div>
      </main>

      {/* MOBILE CTA SKELETON */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none lg:hidden animate-pulse">
        <footer
          className="relative flex w-full max-w-[410px] items-center justify-between px-[16px] gap-[12px] bg-[#ffffff] shadow-[0_-2px_5px_0_rgba(0,0,0,0.03)] border-t border-[#f1f5f9]"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 9px)',
            paddingTop: '11px',
          }}
        >
          <div className="flex h-[56px] basis-0 flex-grow shrink-0 bg-gray-100 rounded-[10px]" />
          <div className="flex h-[56px] basis-0 flex-grow shrink-0 bg-gray-200 rounded-[10px]" />
        </footer>
      </div>
    </article>
  );
}
