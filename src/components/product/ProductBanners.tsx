'use client';

import React from 'react';
import Image from 'next/image';

interface ProductBannersProps {
  banners: (string | undefined)[];
  aspect?: 'square' | 'landscape';
}

const ProductBanners: React.FC<ProductBannersProps> = ({ banners }) => {
  const activeBanners = banners.filter(Boolean) as string[];
  
  if (activeBanners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden flex flex-col gap-[24px]">
      {banners.map((src, idx) => {
        if (!src) return null;
        
        // Index 0, 1 are rectangular (landscape), Index 2, 3 are square
        const isSquare = idx >= 2;
        
        return (
          <div 
            key={idx} 
            className={`relative w-full ${isSquare ? 'aspect-square' : 'h-[200px] md:h-[350px] lg:h-[500px]'}`}
          >
            <Image 
              src={src} 
              alt={`Product Banner ${idx + 1}`} 
              fill 
              className="object-cover"
              sizes="100vw"
            />
          </div>
        );
      })}
    </section>
  );
};

export default ProductBanners;
