'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const delta = 1; // Strictly limit page buttons shown at once to 1 neighbor

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                            currentPage === i
                                ? 'bg-[#242424] text-white shadow-sm'
                                : 'bg-white text-[#71717a] border border-gray-100 hover:border-[#242424] hover:text-[#242424]'
                        }`}
                    >
                        {i}
                    </button>
                );
            } else if (
                (i === currentPage - delta - 1) ||
                (i === currentPage + delta + 1)
            ) {
                pages.push(
                    <span key={i} className="px-1 text-[14px] text-gray-400 select-none">...</span>
                );
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 mb-4 font-rubik tracking-tight max-w-full px-2">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 h-9 sm:h-10 rounded-xl border border-gray-100 text-[#71717a] font-medium text-[14px] hover:border-[#242424] hover:text-[#242424] transition-all disabled:opacity-40 disabled:pointer-events-none bg-white shrink-0"
                aria-label="Previous Page"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                </svg>
                <span>Prev</span>
            </button>

            <div className="flex items-center gap-1 sm:gap-2 max-w-full py-1">
                {renderPageNumbers()}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 h-9 sm:h-10 rounded-xl border border-gray-100 text-[#71717a] font-medium text-[14px] hover:border-[#242424] hover:text-[#242424] transition-all disabled:opacity-40 disabled:pointer-events-none bg-white shrink-0"
                aria-label="Next Page"
            >
                <span>Next</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                </svg>
            </button>
        </div>
    );
}
