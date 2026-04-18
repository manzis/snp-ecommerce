import React from 'react';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[40px]">
      <nav className="fixed top-0 z-50 flex h-[81px] w-full lg:px-[60px] mx-auto items-center gap-[4px] bg-white px-[24px] py-[16px] border-b border-[#f1f5f9] animate-pulse">
        <div className="h-[42px] w-[42px] bg-gray-100/80 rounded-[5px]" />
        <div className="h-[26px] w-[150px] bg-gray-100/80 rounded-[6px] ml-2" />
      </nav>

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px] px-0 lg:px-[24px]">
        {/* Search header skeleton */}
        <div className="flex w-full items-center gap-[12px] bg-white lg:px-0 pt-[16px] pb-[8px] px-[24px] lg:py-[24px] animate-pulse">
          <div className="flex-1 h-[48px] border-b border-[#f1f5f9] bg-gray-50 rounded-md" />
          <div className="h-[48px] w-[48px] bg-gray-50 rounded-[12px]" />
        </div>

        {/* Order Cards skeleton */}
        <div className="flex flex-col gap-[20px] lg:grid lg:grid-cols-2 lg:gap-[24px] px-[24px] lg:px-0 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-[16px] p-[16px] border border-[#f1f5f9] flex flex-col gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-[48px] h-[48px] bg-gray-100 rounded-[10px]" />
                <div className="flex flex-col gap-2">
                  <div className="h-[14px] w-[120px] bg-gray-100 rounded" />
                  <div className="h-[12px] w-[80px] bg-gray-50 rounded" />
                </div>
              </div>
              <hr className="border-[#f1f5f9]" />
              <div className="flex justify-between items-center">
                 <div className="h-[24px] w-[60px] bg-gray-50 rounded" />
                 <div className="h-[16px] w-[100px] bg-gray-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
