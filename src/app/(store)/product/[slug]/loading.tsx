import React from 'react';

export default function ProductLoading() {
  return (
    <article className="relative min-h-screen bg-white">
      {/* FIXED HEADER SECTION SKELETON */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md w-full border-b border-[#F5F5F5] shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        <div className="mx-auto w-full max-w-[1440px] px-[24px]">
          <div className="h-[60px] w-full animate-pulse bg-gray-100/50 rounded-b-md" />
          <div className="h-[20px] w-[200px] mt-2 mb-2 animate-pulse bg-gray-100 rounded-md" />
        </div>
      </header>

      {/* MAIN CONTENT AREA SKELETON */}
      <main className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[140px] pb-[32px] px-0">
        <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">

          {/* LEFT COLUMN: IMAGE CAROUSEL SKELETON */}
          <div className="w-full max-w-[700px] lg:max-w-[1000] lg:w-[58%] px-[24px] lg:px-[0] flex flex-col gap-y-[32px] animate-pulse">
            <div className="w-full aspect-[4/5] lg:aspect-square bg-gray-100 rounded-[16px]" />
            <div className="flex gap-[12px] mt-[12px] overflow-hidden">
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
              <div className="w-[80px] h-[80px] bg-gray-100 rounded-[12px] shrink-0" />
            </div>
            
            <div className="hidden lg:block w-full h-[120px] bg-gray-50 rounded-[16px] mt-8" />
          </div>

          {/* RIGHT COLUMN: DETAILS SKELETON */}
          <div className="w-full max-w-[700px] lg:max-w-none lg:w-[38%] flex flex-col px-[24px] lg:px-[0] animate-pulse">
            {/* Header / Titles */}
            <div className="w-[80px] h-[20px] bg-gray-100 rounded-[4px] mb-4" />
            <div className="w-[90%] h-[32px] bg-gray-200 rounded-[6px] mb-4" />
            <div className="w-[60%] h-[32px] bg-gray-200 rounded-[6px] mb-8" />

            {/* Prices */}
            <div className="w-[140px] h-[40px] bg-gray-100 rounded-[8px] mb-12" />

            {/* Selector Options */}
            <div className="w-full h-[60px] bg-gray-50 rounded-[12px] mb-6" />
            <div className="w-full h-[60px] bg-gray-50 rounded-[12px] mb-8" />
            
            {/* CTA Buttons */}
            <div className="w-full h-[56px] bg-gray-100 rounded-[12px] mb-4" />
            <div className="w-full h-[56px] bg-black/5 rounded-[12px] mb-12" />

            {/* Service Highlights */}
            <div className="w-full h-[180px] bg-gray-50 rounded-[16px] mb-8" />
          </div>
        </div>
      </main>

      {/* MOBILE CTA SKELETON */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-gray-100 lg:hidden px-4 py-3 z-50 flex items-center justify-between animate-pulse">
        <div className="w-[40%] h-[24px] bg-gray-100 rounded-[6px]" />
        <div className="w-[50%] h-[48px] bg-gray-200 rounded-[12px]" />
      </div>
    </article>
  );
}
