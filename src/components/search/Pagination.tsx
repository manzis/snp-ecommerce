'use client';

import React from 'react';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon1';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon1';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Logic to calculate dynamic page range (Force [1] if totalPages is 0 or 1)
  const getPageRange = () => {
    const range: (number | string)[] = [];
    const actualTotal = Math.max(1, totalPages); 
    const delta = 1; 

    if (actualTotal <= 5) {
      for (let i = 1; i <= actualTotal; i++) range.push(i);
    } else {
      range.push(1);
      if (currentPage > delta + 2) range.push('...');

      const start = Math.max(2, currentPage - delta);
      const end = Math.min(actualTotal - 1, currentPage + delta);

      for (let i = start; i <= end; i++) range.push(i);

      if (currentPage < actualTotal - delta - 1) range.push('...');
      range.push(actualTotal);
    }
    return range;
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
    try {
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  };

  const pages = getPageRange();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === Math.max(1, totalPages);

  return (
    <nav 
      aria-label="Pagination" 
      className="flex w-full py-[16px] sm:py-[24px] justify-center items-center bg-white px-[8px] sm:px-[12px]"
    >
      <div className="flex w-fit max-w-full items-center rounded-[4px] border border-[#eaebf0] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] overflow-hidden">
        
        {/* Prev Button - Disabled if page is 1 */}
        <button 
          onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
          disabled={isFirstPage}
          className="flex h-[40px] px-[12px] sm:px-[16px] items-center gap-[6px] border-r border-[#eaebf0] hover:bg-[#fafafa] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 outline-none"
          aria-label="Previous Page"
        >
          <div className="w-[16px] h-[16px]">
            <ArrowLeftIcon className="w-full h-full text-[#68727d]" />
          </div>
          <span className="font-inter text-[14px] font-medium leading-[20px] text-[#68727d]">
            Prev
          </span>
        </button>

        {/* Dynamic Page Numbers */}
        <div className="flex items-center">
          {pages.map((page, idx) => (
            <button
              key={idx}
              disabled={page === '...' || (typeof page === 'number' && totalPages <= 1)}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              className={`flex w-[36px] sm:w-[40px] h-[40px] items-center justify-center border-r border-[#eaebf0] font-inter text-[14px] font-medium transition-colors outline-none
                ${currentPage === page 
                  ? 'text-[#3f9633] bg-[#f9fdf9]' 
                  : 'text-[#68727d] hover:bg-[#fafafa]'
                } ${page === '...' ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button - Disabled if page is last or only 1 page exists */}
        <button 
          onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
          disabled={isLastPage}
          className="flex h-[40px] px-[16px] items-center gap-[6px] hover:bg-[#fafafa] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 outline-none"
          aria-label="Next Page"
        >
          <span className="font-inter text-[14px] font-medium leading-[20px] text-[#68727d]">
            Next
          </span>
          <div className="w-[16px] h-[16px]">
            <ArrowRightIcon className="w-full h-full text-[#68727d]" />
          </div>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
