'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface OtherCategoryCardProps {
  title: string;
  count: number;
  image: string;
  slug: string;
}

const OtherCategoryCard: React.FC<OtherCategoryCardProps> = ({ title, count, image, slug }) => {
  return (
    <Link 
      href={`/category/${slug}`}
      className="group relative flex h-[217px] w-full items-center self-stretch overflow-hidden rounded-[12px] border border-[#f1f5f9] bg-white transition-all duration-300 active:scale-[0.98]"
    >
      {/* Vertical Rotated Label */}
      <div 
        className="absolute left-0 top-0 bottom-0 z-20 flex w-[56px] items-center rounded-[12px] justify-center border-r border-[#242424] bg-gradient-to-b from-white to-[#f0f0f0]"
      >
        <span className="whitespace-nowrap font-titillium text-[14px] font-bold tracking-[0.56px] text-[#242424] uppercase rotate-[-90deg]">
          {title}
        </span>
      </div>

      {/* Image Area */}
      <div className="relative ml-[56px] h-full flex-1">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product Count Badge */}
      <div className="absolute right-[12px] top-[9px] flex h-[28px] w-[80px] items-center justify-center rounded-[4px] bg-white  z-10">
        <span className="font-titillium text-[10px] font-semibold tracking-[0.4px] text-[#242424]">
          {count} Products
        </span>
      </div>
    </Link>
  );
};

export default OtherCategoryCard;