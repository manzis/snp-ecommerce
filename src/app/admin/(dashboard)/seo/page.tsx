import React from 'react';
import SeoTabsLayout from '@/components/admin/seo/SeoTabsLayout';
import { getSeoGlobal } from '@/lib/seo/getSeoData';

export default async function SeoManagementPage() {
  const globalData = await getSeoGlobal();
  return (
    <div className="flex flex-col flex-1 h-full max-w-[1600px] w-full mx-auto font-rubik overflow-hidden">
      <div className="flex flex-col px-[12px] md:px-[24px] lg:px-[32px] pt-[20px] pb-[16px] shrink-0 border-b border-[#e5e5e5]">
        <div className="flex justify-between items-start gap-[16px]">
          <div className="flex flex-col justify-center items-start gap-[4px] shrink-0">
            <h1 className="text-[20px] md:text-[24px] font-medium leading-tight text-[#242424] tracking-tight">
              SEO Management
            </h1>
            <p className="text-[13px] md:text-[14px] font-medium leading-[20px] text-[#52525b]">
              Centralized hub for Store Search Engine Optimization, Structured Data, and Redirects.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative bg-[#fafa-fb]">
        <SeoTabsLayout initialGlobal={globalData} />
      </div>
    </div>
  );
}
