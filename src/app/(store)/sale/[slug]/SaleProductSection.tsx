'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/search/SearchProductCard';

interface SaleProductSectionProps {
  products: any[];
  sale: any | null;
}

export default function SaleProductSection({ products, sale }: SaleProductSectionProps) {
  const [sortOrder, setSortOrder] = useState<string>('default');

  // Helper to calculate the final price after sale discount
  const getFinalPrice = (product: any) => {
      const basePrice = Number(product.discounted_price);
      if (!sale) return basePrice;
      
      if (sale.discount_type === 'PERCENTAGE') {
          return basePrice * (1 - sale.discount_value / 100);
      }
      return Math.max(0, basePrice - sale.discount_value);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case 'price-low-high':
        return getFinalPrice(a) - getFinalPrice(b);
      case 'price-high-low':
        return getFinalPrice(b) - getFinalPrice(a);
      case 'name-a-z':
        return (a.title || a.name).localeCompare(b.title || b.name);
      case 'name-z-a':
        return (b.title || b.name).localeCompare(a.title || a.name);
      default:
        return 0; // Maintain default order from DB
    }
  });

  return (
    <div className="w-full bg-white min-h-[500px]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-[24px] py-[24px] border-t border-[#f1f5f9]">
        <h2 className="font-rajdhani text-[24px] font-bold text-[#242424] tracking-tight">
          Sale Items ({products.length})
        </h2>
        
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-500 font-medium">Sort by:</label>
          <select
            id="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-[#242424] font-medium"
          >
            <option value="default">Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[100px] text-center">
          <div className="w-[80px] h-[80px] bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <h3 className="font-rajdhani text-[24px] font-bold text-[#242424]">No products found</h3>
          <p className="text-gray-500 mt-2">There are currently no products available in this sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#f1f5f9] bg-white overflow-hidden">
          {sortedProducts.map((p) => {
            return (
              <ProductCard
                key={p.id}
                product={p}
                activeSale={sale ? {
                  name: sale.name,
                  discount_type: sale.discount_type,
                  discount_value: sale.discount_value,
                  ends_at: sale.ends_at
                } : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
