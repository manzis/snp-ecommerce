'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
        const delta = 2; // Number of pages to show before and after current page

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
                        className={`w-10 h-10 rounded-xl text-[14px] font-medium transition-all duration-200 ${currentPage === i ? 'bg-[#242424] text-white shadow-sm' : 'bg-white text-[#71717a] border border-gray-100 hover:border-[#242424] hover:text-[#242424]'}`}
                    >
                        {i}
                    </button>
                );
            } else if (
                (i === currentPage - delta - 1) ||
                (i === currentPage + delta + 1)
            ) {
                pages.push(
                    <span key={i} className="px-2 text-gray-400">...</span>
                );
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4 font-rubik tracking-tight">
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 text-[#71717a] font-medium text-[14px] hover:border-[#242424] hover:text-[#242424] transition-all disabled:opacity-50 disabled:pointer-events-none bg-white"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                </svg>
                <span>Prev</span>
            </button>

            <div className="flex items-center gap-2">
                {renderPageNumbers()}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 text-[#71717a] font-medium text-[14px] hover:border-[#242424] hover:text-[#242424] transition-all disabled:opacity-50 disabled:pointer-events-none bg-white"
            >
                <span>Next</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                </svg>
            </button>
        </div>
    );
}
