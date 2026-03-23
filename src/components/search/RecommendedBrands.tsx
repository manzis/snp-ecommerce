'use client';

import React from 'react';
import Image from 'next/image';

interface Brand {
  id: number;
  image: string;
  name: string;
}

const BRANDS: Brand[] = [
  { id: 1, name: 'Brand 1', image: '/images/brand-logo-1.png' }, // Replace with your local paths
  { id: 2, name: 'Brand 2', image: '/images/brand-logo-2.png' },
  { id: 3, name: 'Brand 3', image: '/images/brand-logo-3.png' },
];

const RecommendedBrands: React.FC = () => {
  return (
    <section className="flex flex-col gap-[20px] self-stretch border-t border-[#f1f5f9] bg-white py-[24px] px-[24px]">
      <h3 className="font-titillium text-[16px] font-semibold leading-[20px] text-[#242424]">
        Recommended Brands
      </h3>
      <div className="no-scrollbar flex w-full gap-[16px] overflow-x-auto pb-[4px]">
        {BRANDS.map((brand) => (
          <div key={brand.id} className="flex h-[119px] w-[113px] shrink-0 flex-col gap-[5px]">
            <div className="relative flex flex-1 overflow-hidden rounded-[12px] border border-[#f1f5f9]">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                className="object-cover"
                sizes="113px"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedBrands;