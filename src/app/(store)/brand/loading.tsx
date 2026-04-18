import React from 'react';

export default function BrandsLoading() {
  return (
    <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px]">
      <nav className="fixed top-0 z-50 flex h-[81px] w-full lg:px-[60px] mx-auto items-center gap-[4px] bg-white px-[24px] py-[16px] border-b border-[#f1f5f9] animate-pulse">
        <div className="h-[42px] w-[42px] bg-gray-100/80 rounded-[5px]" />
        <div className="h-[26px] w-[150px] bg-gray-100/80 rounded-[6px] ml-2" />
        <div className="h-[20px] w-[60px] bg-gray-50 rounded-[4px] ml-auto" />
      </nav>

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {/* POPULAR BRANDS SKELETON */}
        <section className="flex flex-col gap-[24px] lg:mt-[24px] px-[24px] py-[24px] bg-[#f6faf6] border-b border-[#f1f5f9] animate-pulse">
          <div className="h-[26px] w-[140px] bg-gray-200 rounded-[4px]" />
          <div className="flex w-full gap-[12px] overflow-hidden pb-[4px]">
            <div className="h-[135px] min-w-[280px] w-[280px] bg-gray-200/50 rounded-[12px] border border-gray-100" />
            <div className="h-[135px] min-w-[280px] w-[280px] bg-gray-200/50 rounded-[12px] border border-gray-100" />
            <div className="h-[135px] min-w-[280px] w-[280px] bg-gray-200/50 rounded-[12px] border border-gray-100 lg:block hidden" />
          </div>
        </section>

        {/* ALL BRANDS SKELETON */}
        <section className="flex flex-col gap-[24px] px-[24px] py-[24px]">
          <div className="h-[26px] w-[100px] bg-gray-100 rounded-[4px] mb-4" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-[12px] gap-y-[24px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[160px] w-full bg-gray-50 rounded-[12px] animate-pulse" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
