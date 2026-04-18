import React from 'react';

export default function CategoryDetailLoading() {
  return (
    <div className="min-h-screen mx-auto w-full max-w-[1440px] bg-white mt-[80px] pb-[60px]">
      {/* Navbar Skeleton */}
      <nav className="fixed top-0 z-50 flex h-[81px] w-full lg:px-[60px] mx-auto items-center gap-[4px] bg-white px-[24px] py-[16px] border-b border-[#f1f5f9] animate-pulse">
        <div className="h-[42px] w-[42px] bg-gray-100/80 rounded-[5px]" />
        <div className="h-[26px] w-[200px] bg-gray-100/80 rounded-[6px] ml-2" />
        <div className="h-[20px] w-[60px] bg-gray-50 rounded-[4px] ml-auto" />
      </nav>

      <main className="mx-auto w-full max-w-[410px] lg:px-[48px] lg:max-w-[1440px]">
        {/* Hero Section Skeleton */}
        <section className="px-[24px] py-[40px] bg-gray-50 animate-pulse rounded-b-[20px]">
          <div className="h-[32px] w-[240px] bg-gray-200 rounded-md mb-4" />
          <div className="h-[20px] w-full max-w-[600px] bg-gray-100 rounded-md mb-2" />
          <div className="h-[20px] w-[80%] max-w-[400px] bg-gray-100 rounded-md" />
        </section>

        {/* Benefits Bar Skeleton */}
        <div className="border-b border-[#f1f5f9] bg-white animate-pulse">
           <div className="h-[72px] w-full flex items-center px-[24px]">
              <div className="h-[20px] w-[180px] bg-gray-50 rounded-md" />
              <div className="h-[32px] w-[32px] bg-gray-50 rounded-md ml-auto" />
           </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="sticky top-[81px] z-20 bg-white border-b border-[#f1f5f9] animate-pulse">
          <div className="px-[24px] py-[16px] flex items-center">
            <div className="h-[24px] w-[120px] bg-gray-100 rounded-md" />
          </div>
          <div className="px-[24px] py-[12px] flex gap-4 overflow-hidden">
            <div className="h-[36px] w-[100px] bg-gray-50 rounded-full" />
            <div className="h-[36px] w-[100px] bg-gray-50 rounded-full" />
            <div className="h-[36px] w-[100px] bg-gray-50 rounded-full" />
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <section className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full border-l border-[#e8e8e8] animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col w-full h-[340px] border-b border-r border-[#f1f5f9] p-[12px] gap-[12px]">
              <div className="w-full h-[200px] bg-gray-50 rounded-[12px]" />
              <div className="h-[14px] w-[50%] bg-gray-100 rounded-[4px]" />
              <div className="h-[20px] w-[90%] bg-gray-200 rounded-[4px]" />
              <div className="h-[24px] w-[80px] bg-gray-100 rounded-[4px] mt-auto" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
