'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ListIcon from '@/components/icons/ListIcon';
import GridIcon from '@/components/icons/GridIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';

interface ProductsHeaderNavProps {
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onSearch: (query: string) => void;
}

export default function ProductsHeaderNav({
    viewMode,
    onViewModeChange,
    onSearch
}: ProductsHeaderNavProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 px-4 bg-white border-b border-gray-100 font-rubik tracking-tight sticky top-0 z-[100]">
            {/* Left Side: View Mode Toggles */}
            <div className="flex items-center gap-1 bg-gray-50 md:bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-[#242424]' : 'text-[#71717a] hover:text-[#242424]'}`}
                >
                    <ListIcon className="w-4 h-4" />
                    <span className="text-[13px] font-medium">List</span>
                </button>
                <button
                    onClick={() => onViewModeChange('grid')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#242424]' : 'text-[#71717a] hover:text-[#242424]'}`}
                >
                    <GridIcon className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Grid</span>
                </button>
            </div>

            {/* Right Side: Search & Filter */}
            <div className="flex items-center gap-3 flex-1 md:max-w-md md:justify-end">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within:text-[#242424] transition-colors">
                        <SearchIcon className="w-[16px] h-[16px]" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search products..."
                        className="w-full bg-gray-50 md:bg-gray-100 border-transparent rounded-[10px] py-[8px] pl-10 pr-4 text-[14px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Filter Button */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-[8px] py-[8px] rounded-[10px] border transition-all duration-200 font-medium text-[14px] ${isFilterOpen ? 'border-[#242424] bg-white text-[#242424]' : 'border-gray-200 text-[#71717a] hover:border-[#242424] hover:text-[#242424]'}`}
                    >
                        <FilterIcon className="w-4 h-4" />
                        <span>Filter</span>
                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-[50]" onClick={() => setIsFilterOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[60] p-4 flex flex-col gap-4"
                                >
                                    <div>
                                        <h3 className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">Sort By</h3>
                                        <div className="flex flex-col gap-1">
                                            {['Newest First', 'Oldest First', 'Price: High to Low', 'Price: Low to High'].map((sort) => (
                                                <button key={sort} className="text-left text-[14px] py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors text-[#242424]">
                                                    {sort}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100" />

                                    <div>
                                        <h3 className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">Status</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {['All', 'Active', 'Draft', 'Low Stock', 'Out of Stock'].map((status) => (
                                                <button key={status} className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${status === 'All' ? 'bg-[#242424] text-white' : 'bg-gray-50 text-[#71717a] hover:bg-gray-100'}`}>
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="flex-1 bg-[#242424] text-white text-[14px] font-medium py-2 rounded-xl active:scale-[0.98] transition-all"
                                        >
                                            Apply Filters
                                        </button>
                                        <button className="px-3 py-2 text-[14px] font-medium text-[#71717a] hover:text-[#242424] transition-colors">
                                            Reset
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
