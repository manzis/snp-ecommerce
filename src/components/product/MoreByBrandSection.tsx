import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SmallProductCard from './SmallProductCard';
import { Product } from '@/services/productService';

interface MoreByBrandSectionProps {
  products: Product[];
  brandName: string;
  brandSlug: string;
  brandLogo?: string | null;
}

const MoreByBrandSection: React.FC<MoreByBrandSectionProps> = ({
  products,
  brandName,
  brandSlug,
  brandLogo,
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] mt-4 mb-4 flex flex-col">
      {/* Top Wave */}
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[45px] md:h-[60px] lg:h-[80px] block text-[#f2faf2]">
        <path fill="currentColor" d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z" />
      </svg>

      <div className="w-full bg-[#f2faf2] pt-[40px] pb-[16px] md:pt-[60px] md:pb-[24px] px-[16px] flex flex-col items-center">
        <div className="w-full max-w-[1440px] flex flex-col items-center gap-[24px] md:gap-[32px]">
          {/* HEADER */}
          <div className="flex flex-col items-center gap-[8px]">
            {brandLogo && (
              <div className="relative h-[40px] w-[120px]">
                <Image 
                  src={brandLogo} 
                  alt={`${brandName} Logo`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <h2 className="text-[22px] lg:text-[28px] font-rajdhani font-bold text-[#242424] text-center">
              More by {brandName}
            </h2>
          </div>

          {/* PRODUCT GRID / HORIZONTAL SCROLL */}
          <div className="w-full overflow-x-auto no-scrollbar pb-4">
              <div className="flex gap-[12px] md:gap-[16px] justify-start lg:justify-center w-max lg:w-full px-[4px]">
              {products.map((product) => (
                  <SmallProductCard
                  key={`more-brand-${product.id}`}
                  brand={product.brands?.name || brandName}
                  title={product.title || product.name}
                  originalPrice={product.original_price}
                  discountedPrice={product.discounted_price}
                  rating={product.rating?.toString() || "0"}
                  image={product.images?.[0] || '/images/protein.webp'}
                  slug={product.slug}
                  stockStatus={product.stock_status}
                  />
              ))}
              </div>
          </div>

          {/* CTA BUTTON */}
          <Link 
              href={`/brand/${brandSlug}`}
              className="mt-[4px] flex items-center justify-center rounded-[100px] border-[1.5px] border-[#308026] text-[#308026] bg-transparent hover:bg-[#308026] hover:text-white transition-colors duration-[300ms] px-[32px] py-[12px] mb-[16px]"
          >
              <span className="font-rajdhani text-[15px] font-bold tracking-[0.5px]">
                  Visit {brandName} Store
              </span>
          </Link>
        </div>
      </div>

      {/* Bottom Wave */}
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[45px] md:h-[60px] lg:h-[80px] block text-[#f2faf2]">
        <path fill="currentColor" d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,0 L0,0 Z" />
      </svg>
    </div>
  );
};

export default MoreByBrandSection;
