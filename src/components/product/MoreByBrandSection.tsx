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
    <div className="w-full px-[8px] py-[16px] lg:p-0">
      <div className="w-full bg-[#f8fcf8] py-[24px] px-[12px] md:py-[32px] md:px-[24px] rounded-[16px] border border-[#eef5ed] flex flex-col items-center">
        <div className="w-full max-w-[1440px] flex flex-col items-center gap-[24px]">
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
          <h2 className="text-[20px] lg:text-[24px] font-rajdhani font-bold text-[#242424] text-center">
            More by {brandName}
          </h2>
        </div>

        {/* PRODUCT GRID / HORIZONTAL SCROLL */}
        <div className="w-full overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-[12px] md:gap-[16px] lg:justify-center w-max lg:w-full px-[4px]">
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
            className="mt-[8px] flex items-center justify-center rounded-[100px] border-[1px] border-[#308026] text-[#308026] bg-transparent hover:bg-[#308026] hover:text-white transition-colors duration-[200ms] px-[24px] py-[10px]"
        >
            <span className="font-rajdhani text-[16px] font-semibold tracking-[0.2px]">
                Visit {brandName} Store
            </span>
        </Link>
      </div>
      </div>
    </div>
  );
};

export default MoreByBrandSection;
