import React from 'react';

export default function CategoryLoading() {
  return (
    <div className="min-h-screen mx-auto w-full bg-white mt-[80px] pb-[60px]">
      <nav className="fixed top-0 z-50 flex h-[81px] w-full lg:px-[60px] mx-auto items-center gap-[4px] bg-white px-[24px] py-[16px] border-b border-[#f1f5f9] animate-pulse">
        <div className="h-[42px] w-[42px] bg-gray-100/80 rounded-[5px]" />
        <div className="h-[26px] w-[150px] bg-gray-100/80 rounded-[6px] ml-2" />
        <div className="h-[20px] w-[60px] bg-gray-50 rounded-[4px] ml-auto" />
      </nav>

      <main className="mx-auto w-full max-w-[1280px] px-[24px] pt-[24px]">
        <div className="h-[32px] w-[180px] bg-gray-100 animate-pulse rounded-md mb-8" />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[16px] gap-y-[32px]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-square w-full bg-gray-100 rounded-[20px]" />
              <div className="h-[20px] w-[70%] bg-gray-50 rounded-md mt-2" />
              <div className="h-[14px] w-[40%] bg-gray-50 rounded-md" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
