'use client';

import React, { useState, useDeferredValue, useRef } from 'react';
import ProductCard from '@/components/search/SearchProductCard';
import BackButton from '@/components/ui/BackButton';
import SearchIcon from '@/components/icons/SearchIcon';

interface BrandProductSectionProps {
  products: any[];
}

export default function BrandProductSection({ products }: BrandProductSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isExpanded = isFocused || searchQuery.length > 0;
  
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredProducts = products.filter((product) => {
    const query = deferredSearchQuery.toLowerCase();
    const titleMatch = product.title?.toLowerCase().includes(query) || product.name?.toLowerCase().includes(query);
    return titleMatch;
  });

  return (
    <>
      <div className={`flex flex-row items-center justify-between border-[#f1f5f9] px-[24px] py-[24px] bg-white w-full h-[90px] transition-all duration-300 ${isExpanded ? 'gap-0' : 'gap-[16px]'}`}>
        {/* Title: Hidden when search is expanded */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <span className="font-rajdhani text-[16px] lg:text-[20px] font-semibold text-[#242424] tracking-[-0.64px] leading-[26px] whitespace-nowrap">
            Explore Brand & Products
          </span>
        </div>
        
        <div className={`flex justify-end transition-all duration-300 ease-in-out ${isExpanded ? 'w-full flex-1' : 'w-[150px] lg:w-[220px]'}`}>
          <div className="relative w-full flex items-center group">
            <SearchIcon className={`absolute left-0 w-5 h-5 transition-colors ${isExpanded ? 'text-black' : 'text-gray-400'}`} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full h-[40px] pl-7 ${isExpanded ? 'pr-8' : 'pr-2'} bg-transparent border-b border-gray-300 text-[15px] font-rajdhani text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors rounded-none`}
            />
            {isExpanded && (
              <button 
                type="button"
                onMouseDown={(e) => {
                  // Prevent default so the input doesn't blur before the click fires
                  e.preventDefault(); 
                }}
                onClick={() => {
                  setSearchQuery('');
                  setIsFocused(false);
                  inputRef.current?.blur();
                }}
                className="absolute right-0 p-1 text-gray-400 hover:text-black transition-colors"
                aria-label="Close search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center px-[24px] py-[16px] border-t border-[#f1f5f9] bg-white w-full">
        <span className="font-rajdhani text-[14px] lg:text-[15px] font-semibold text-[#71717a] tracking-tight">
          {searchQuery 
            ? `Search Results: ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} found` 
            : `Showing all ${products.length} product${products.length === 1 ? '' : 's'}`}
        </span>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#f1f5f9] bg-white overflow-hidden">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-[100px] px-[24px] text-center bg-white ">
          <div className="w-[64px] h-[64px] bg-[#f9fafb] rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <p className="font-rajdhani text-[18px] font-semibold text-[#242424] mb-2">No Products Found</p>
          <p className="font-rajdhani text-[14px] text-[#71717a] mb-8">
            {searchQuery ? "Try adjusting your search query." : "Go back and check other brands or categories."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-8 py-3 bg-[#242424] text-white rounded-full text-[14px] font-medium hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Clear Search
            </button>
          ) : (
            <BackButton
              className="px-8 py-3 bg-[#242424] text-white rounded-full text-[14px] font-medium hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Go Back
            </BackButton>
          )}
        </div>
      )}
    </>
  );
}
