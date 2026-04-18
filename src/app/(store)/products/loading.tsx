import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Skeletons for DynamicPageNav */}
      <nav className="fixed top-0 z-50 flex h-[81px] w-full lg:px-[60px] mx-auto items-center gap-[4px] bg-white px-[24px] py-[16px] border-b border-[#f1f5f9] animate-pulse">
        <div className="h-[42px] w-[42px] bg-gray-100/80 rounded-[5px]" />
        <div className="h-[26px] w-[150px] bg-gray-100/80 rounded-[6px] ml-2" />
        <div className="h-[20px] w-[60px] bg-gray-50 rounded-[4px] ml-auto" />
      </nav>

      <div className="pt-[80px]">
        {/* Search Header Skeleton */}
        <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] pt-[24px]">
          <div className="w-full h-[48px] bg-gray-100 animate-pulse rounded-[12px] md:h-[56px]" />
        </div>

        {/* Filter Accoridons Skeletons */}
        <div className="w-full border-b border-[#f1f5f9] mt-6">
          <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] flex items-center justify-between py-[12px] animate-pulse">
            <div className="w-[120px] h-[20px] bg-gray-100 rounded-[4px]" />
            <div className="w-[32px] h-[32px] bg-gray-100 rounded-[6px]" />
          </div>
        </div>
        <div className="w-full border-b border-[#f1f5f9]">
          <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] flex items-center justify-between py-[12px] animate-pulse">
            <div className="w-[140px] h-[20px] bg-gray-100 rounded-[4px]" />
            <div className="w-[32px] h-[32px] bg-gray-100 rounded-[6px]" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <main className="mx-auto flex w-full max-w-[1440px] flex-col px-[16px] pb-[100px] pt-[32px] lg:px-[60px]">
          <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:gap-[20px]">
            {/* Generate 8 dummy skeleton cards */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col w-full overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white animate-pulse">
                {/* Image Box */}
                <div className="aspect-[4/5] w-full bg-gray-100/80" />
                
                {/* Content Box */}
                <div className="flex flex-col p-[12px] gap-[8px]">
                  <div className="h-[12px] w-[50%] bg-gray-100/50 rounded-[4px]" />
                  <div className="h-[20px] w-[90%] bg-gray-100/70 rounded-[6px]" />
                  <div className="mt-2 h-[24px] w-[80px] bg-gray-100 rounded-[6px]" />
                  <div className="h-[36px] w-full bg-gray-50 rounded-[8px] mt-2" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
