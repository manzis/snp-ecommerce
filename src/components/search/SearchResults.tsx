'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './SearchProductCard';
import SearchProductSkeleton from './SearchProductSkeleton';

export default function SearchResults({ products }: { products: any[] }) {
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const ITEMS_PER_LOAD = 10;
  const hasMore = displayCount < products.length;

  const currentProducts = products.slice(0, displayCount);

  // Reset display count when new search results are provided
  useEffect(() => {
    setDisplayCount(10);
  }, [products]);

  const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setIsLoadingMore(true);
        // Simulate network delay for smooth skeleton rendering
        setTimeout(() => {
          setDisplayCount(prev => prev + ITEMS_PER_LOAD);
          setIsLoadingMore(false);
        }, 600);
      }
    }, {
      rootMargin: '200px', // Trigger load slightly before user reaches the exact bottom
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, hasMore]);

  return (
    <div className="flex flex-col w-full bg-white pb-[40px]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#e8e8e8]">
        {currentProducts.map((product, index) => {
          if (currentProducts.length === index + 1) {
            // Attach the ref to the last product to trigger the infinite scroll
            return (
              <div ref={lastProductElementRef} key={product.id} className="h-full w-full">
                <ProductCard product={product} />
              </div>
            );
          } else {
            return <ProductCard key={product.id} product={product} />;
          }
        })}

        {/* Render Skeletons while loading more */}
        {isLoadingMore && (
          Array.from({ length: Math.min(ITEMS_PER_LOAD, products.length - displayCount) }).map((_, i) => (
            <SearchProductSkeleton key={`skeleton-${i}`} />
          ))
        )}
      </div>
    </div>
  );
}
