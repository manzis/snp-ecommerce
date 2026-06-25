'use client';

import React, { useState } from 'react';
import ProductCard from './SearchProductCard';
import Pagination from './Pagination';

export default function SearchResults({ products }: { products: any[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

return (
  <div className="flex flex-col w-full bg-white">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#e8e8e8]">
      {currentProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>

    {/* ALWAYS RENDER: Removed totalPages > 1 condition */}
    <div className="w-full flex justify-center mt-[12px]">
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  </div>
);
}
