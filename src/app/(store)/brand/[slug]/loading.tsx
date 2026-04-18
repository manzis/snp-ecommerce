import React from 'react';

export default function BrandDetailLoading() {
  return (
    <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px]">
      {/* Navbar Skeleton */}
      <nav className="fixed top-0 z-50 flex h-[81px] w-full lg:px-[60px] mx-auto items-center gap-[4px] bg-white px-[24px] py-[16px] border-b border-[#f1f5f9] animate-pulse">
        <div className="h-[42px] w-[42px] bg-gray-100/80 rounded-[5px]" />
        <div className="h-[26px] w-[150px] bg-gray-100/80 rounded-[6px] ml-2" />
        <div className="h-[20px] w-[60px] bg-gray-50 rounded-[4px] ml-auto" />
      </nav>

      <div className="flex flex-col w-full lg:items-center">
        {/* Banner Skeleton */}
        <header className="relative w-full h-[140px] lg:h-[300px] shrink-0 bg-gray-100 animate-pulse" />

        <main className="w-full lg:max-w-[1280px] lg:mt-[24px]">
          {/* Header Info Skeleton */}
          <section className="flex flex-col items-start gap-[12px] px-[24px] py-[24px] lg:flex-row lg:items-center lg:gap-[32px] w-full bg-white animate-pulse border-b border-[#f1f5f9]">
            <div className="flex-none w-[80px] h-[80px] lg:w-[120px] lg:h-[120px] bg-gray-100 rounded-md" />
            <div className="flex flex-col gap-[8px] flex-1 min-w-0">
              <div className="h-[28px] w-[200px] bg-gray-100 rounded-md" />
              <div className="h-[20px] w-full max-w-[600px] bg-gray-50 rounded-md mt-2" />
              <div className="h-[20px] w-[80%] max-w-[400px] bg-gray-50 rounded-md" />
            </div>
          </section>

          {/* Stats Skeleton */}
          <section className="flex w-full border-b border-[#f1f5f9] bg-white animate-pulse">
            <div className="flex-1 flex flex-col items-start lg:items-center justify-center gap-[10px] px-[24px] py-[24px] border-r border-[#f1f5f9]">
              <div className="h-[14px] w-[60px] bg-gray-100 rounded-[4px]" />
              <div className="h-[24px] w-[40px] bg-gray-200 rounded-[4px]" />
            </div>
            <div className="flex-1 flex flex-col items-start lg:items-center justify-center gap-[10px] px-[24px] py-[24px] border-r border-[#f1f5f9]">
              <div className="h-[14px] w-[70px] bg-gray-100 rounded-[4px]" />
              <div className="h-[24px] w-[60px] bg-gray-200 rounded-[4px]" />
            </div>
            <div className="flex-1 flex flex-col items-start lg:items-center justify-center gap-[10px] px-[24px] py-[24px]">
              <div className="h-[14px] w-[80px] bg-gray-100 rounded-[4px]" />
              <div className="h-[24px] w-[50px] bg-gray-200 rounded-[4px]" />
            </div>
          </section>

          <div className="flex items-center gap-[10px] border-[#f1f5f9] px-[24px] py-[24px] bg-white animate-pulse">
            <div className="h-[24px] w-[200px] bg-gray-100 rounded-[4px]" />
          </div>

          {/* Product Grid Skeleton */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#f1f5f9] bg-white overflow-hidden animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col w-full h-[320px] border-b border-r border-[#f1f5f9] p-[12px] gap-[12px]">
                <div className="w-full h-[180px] bg-gray-50 rounded-[8px]" />
                <div className="h-[14px] w-[40%] bg-gray-100 rounded-[4px]" />
                <div className="h-[20px] w-[80%] bg-gray-200 rounded-[4px]" />
                <div className="h-[24px] w-[60px] bg-gray-100 rounded-[4px] mt-auto" />
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
