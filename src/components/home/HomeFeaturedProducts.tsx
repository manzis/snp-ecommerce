import React from 'react';
import Link from 'next/link';
import FeaturedProductCard from '@/components/product/FeatureProductCard';

interface HomeFeaturedProductsProps {
  products: any[];
  limit?: number;
}

export default function HomeFeaturedProducts({ products, limit = 10 }: HomeFeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Purely server-side shuffling to avoid hydration mismatch if this is run as an RSC.
  // If it runs on client, we could use useEffect, but 'page.tsx' is an RSC.
  const featuredProducts = [...products]
    .sort(() => 0.5 - Math.random())
    .slice(0, limit);

  return (
    <section className="mx-auto w-full max-w-[1440px] py-[32px] lg:px-[48px] lg:py-[48px] md:py-[64px] bg-white transition-colors duration-300">
      {/* HEADER ROW */}
      <div className="mb-[24px] flex items-center justify-between px-[24px] md:mb-[40px] md:px-0">
        <h2 className="font-rajdhani text-[20px] font-bold text-[#242424] md:text-[32px]">
          Featured Products
        </h2>
        <Link
          href="/products"
          className="font-rajdhani text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]"
        >
          View All
        </Link>
      </div>

      {/* HORIZONTAL SCROLLABLE CONTAINER */}
      <div className="w-full overflow-x-auto no-scrollbar px-[24px] md:px-0">
        <div className="flex flex-row gap-[16px] md:gap-[24px] pb-4 w-max">
          {featuredProducts.map((product) => {
            const currentPriceNum = Number(product.discounted_price || product.original_price);
            const originalPriceNum = Number(product.original_price);

            const currentPriceStr = `Rs. ${currentPriceNum.toLocaleString('en-IN')}`;
            const originalPriceStr = currentPriceNum < originalPriceNum
              ? `Rs. ${originalPriceNum.toLocaleString('en-IN')}`
              : undefined;

            let discountText: string | undefined;
            if (product.discount_percentage && Number(product.discount_percentage) > 0) {
              discountText = `save ${product.discount_percentage}%`;
            } else if (currentPriceNum < originalPriceNum) {
              const diff = originalPriceNum - currentPriceNum;
              const per = Math.round((diff / originalPriceNum) * 100);
              // Adding negative check safeguard
              if (per > 0) discountText = `save ${per}%`;
            }

            const primaryImage = product.images && product.images.length > 0
              ? product.images[0]
              : '/images/product-placeholder.png';

            return (
              <FeaturedProductCard
                key={`featured-${product.id || product.slug}`}
                id={product.id}
                brand={product.brands?.name || "Premium Brand"}
                title={product.title || product.name}
                currentPrice={currentPriceStr}
                originalPrice={originalPriceStr}
                discountText={discountText}
                imageUrl={primaryImage}
                productUrl={`/product/${product.slug}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
