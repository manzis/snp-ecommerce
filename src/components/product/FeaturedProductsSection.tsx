import React from 'react';
import Link from 'next/link';
import { fetchRelatedProducts } from '@/services/productService.server';
import FeaturedProductCard from './FeatureProductCard';

interface FeaturedProductsSectionProps {
  productId: string;
  categoryId?: string | null;
  limit?: number;
}

export default async function FeaturedProductsSection({ 
  productId, 
  categoryId, 
  limit = 10 
}: FeaturedProductsSectionProps) {
  
  const relatedProducts = await fetchRelatedProducts(productId, categoryId, limit);

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="main-container relative mx-auto flex w-full max-w-[700px] flex-col items-start gap-[24px] lg:mx-0 lg:max-w-none border-t border-b border-[#F1F5F9] py-[24px]">
      
      {/* HEADER ROW */}
      <div className="flex w-full items-center justify-between px-[24px]">
        <h2 className="font-rajdhani text-[22px] lg:text-[28px] font-bold tracking-[-0.4px] text-[#242424]">
          You might also like
        </h2>
        <Link 
          href="/products" 
          className="font-rajdhani text-[14px] font-bold leading-[16px] text-[#5e9756] underline underline-offset-2 hover:text-[#3F9633] transition-colors"
        >
          View all
        </Link>
      </div>

      {/* HORIZONTAL SCROLLABLE CONTAINER */}
      <div className="w-full overflow-x-auto no-scrollbar px-[24px]">
        <div className="flex flex-row gap-[24px] pb-4 w-max">
          {relatedProducts.map((product) => {
            // Determine the display price (use discounted if strictly less, else original)
            const currentPriceNum = Number(product.discounted_price || product.original_price);
            const originalPriceNum = Number(product.original_price);
            
            const currentPriceStr = `Rs. ${currentPriceNum.toLocaleString('en-IN')}`;
            const originalPriceStr = currentPriceNum < originalPriceNum 
              ? `Rs. ${originalPriceNum.toLocaleString('en-IN')}` 
              : undefined;

            // Determine discount percentage if any
            let discountText: string | undefined;
            if (product.discount_percentage && Number(product.discount_percentage) > 0) {
              discountText = `save ${product.discount_percentage}%`;
            } else if (currentPriceNum < originalPriceNum) {
              const diff = originalPriceNum - currentPriceNum;
              const per = Math.round((diff / originalPriceNum) * 100);
              discountText = `save ${per}%`;
            }

            // Fallback image handling
            const primaryImage = product.images && product.images.length > 0 
                ? product.images[0] 
                : '/images/product-placeholder.png'; // Make sure visual fallback exists

            return (
              <FeaturedProductCard
                key={product.id}
                id={product.id}
                brand={product.brands?.name || "Unknown Brand"}
                title={product.title || product.name}
                currentPrice={currentPriceStr}
                originalPrice={originalPriceStr}
                discountText={discountText}
                imageUrl={primaryImage}
                productUrl={`/product/${product.slug}`}
                stockStatus={product.stock_status}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
