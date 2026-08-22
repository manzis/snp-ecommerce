import React from 'react';

const SearchProductSkeleton = () => {
  return (
    <div className="group relative flex w-full flex-col gap-[4px] border-r border-b border-[#e8e8e8] bg-white lg:gap-0 animate-pulse">
      {/* IMAGE & BADGES CONTAINER */}
      <div className="relative w-full aspect-[200/200] flex flex-col justify-end lg:aspect-[250/240] overflow-hidden p-[20px] bg-[#f7f7f7]">
        {/* Rating Badge Skeleton */}
        <div className="absolute top-[11px] left-[11px] bg-gray-200 px-[8px] py-[6px] rounded-[6px] w-[35px] h-[22px] z-10"></div>
        {/* Save Badge Skeleton */}
        <div className="absolute right-[11px] top-[11px] z-[10] rounded-[6px] bg-gray-200 w-[60px] h-[22px]"></div>
        
        {/* Main Image Placeholder */}
        <div className="w-full h-full bg-gray-200 rounded-[8px]"></div>
      </div>

      {/* DETAILS SECTION */}
      <div className="flex flex-col gap-[8px] px-[16px] py-[8px] pb-[16px] lg:px-[24px] lg:py-[20px] lg:gap-[12px]">
        <div className="flex flex-col gap-[4px] lg:gap-[6px]">
          {/* Brand Name Skeleton */}
          <div className="h-[12px] lg:h-[14px] bg-gray-200 rounded w-1/3"></div>

          {/* Product Title Skeleton */}
          <div className="flex flex-col gap-[4px] lg:h-[40px]">
            <div className="h-[14px] lg:h-[18px] bg-gray-200 rounded w-[90%]"></div>
            <div className="h-[14px] lg:h-[18px] bg-gray-200 rounded w-[60%]"></div>
          </div>
        </div>

        {/* PRICE SECTION Skeleton */}
        <div className="flex items-center gap-[6px] lg:gap-[10px] mt-[4px]">
          {/* Original Price Skeleton */}
          <div className="h-[16px] lg:h-[20px] bg-gray-200 rounded w-[30%]"></div>
          {/* Discounted Price Skeleton */}
          <div className="h-[20px] lg:h-[24px] bg-gray-300 rounded w-[40%]"></div>
        </div>
      </div>
    </div>
  );
};

export default SearchProductSkeleton;
