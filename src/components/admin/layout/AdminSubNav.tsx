'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ListIcon from '@/components/icons/ListIcon';
import GridIcon from '@/components/icons/GridIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import { RefreshCcw } from 'lucide-react';

interface AdminSubNavProps {
    onSearch: (query: string) => void;
    searchPlaceholder?: string;
    showViewMode?: boolean;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    filterDropdown?: React.ReactNode;
    searchOnLeft?: boolean;
    onRefresh?: () => void;
    refreshLoading?: boolean;
}

export default function AdminSubNav({
    onSearch,
    searchPlaceholder = "Search...",
    showViewMode = false,
    viewMode = 'grid',
    onViewModeChange,
    filterDropdown,
    searchOnLeft = false,
    onRefresh,
    refreshLoading = false
}: AdminSubNavProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        // Debounce the actual search callback by 300ms
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearch(query);
        }, 300);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const RefreshButton = onRefresh && (
        <button 
            onClick={onRefresh}
            disabled={refreshLoading}
            className="flex items-center gap-2 px-[12px] h-[38px] bg-transparent border border-gray-200 rounded-[10px] text-[#71717a] hover:bg-gray-100 hover:border-gray-300 hover:text-[#242424] transition-all duration-200 disabled:opacity-50"
        >
            <RefreshCcw className={`w-3.5 h-3.5 ${refreshLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[13px] font-medium">Refresh</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 px-4 bg-white border-b border-gray-100 font-rubik tracking-tight sticky top-0 z-[100]">
            {/* Left Side: View Mode Toggles or Search Bar */}
            <div className="flex items-center gap-4 flex-1 w-full">
                {showViewMode && onViewModeChange && (
                    <div className="flex items-center justify-between w-full md:w-auto md:gap-4">
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
                        {/* Mobile Refresh (if grid list present) */}
                        <div className="md:hidden">
                            {RefreshButton}
                        </div>
                    </div>
                )}

                {searchOnLeft && (
                    <>
                        <div className="relative flex-1 max-w-md group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within:text-[#242424] transition-colors">
                                <SearchIcon className="w-[16px] h-[16px]" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder={searchPlaceholder}
                                className="w-full bg-gray-50 md:bg-gray-100 border-transparent rounded-[10px] py-[8px] pl-10 pr-4 text-[14px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        {/* Mobile Refresh (inline with search when no filter dropdown exists) */}
                        {!filterDropdown && onRefresh && (
                            <div className="md:hidden shrink-0">
                                {RefreshButton}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Right Side: Search (if not on left) & Filter */}
            <div className={`flex items-center gap-3 w-full md:w-auto ${(!showViewMode && !searchOnLeft) ? 'justify-between' : 'justify-end'} ${searchOnLeft && !filterDropdown ? 'hidden md:flex' : ''}`}>
                {!searchOnLeft && (
                    <div className="relative flex-1 md:w-64 max-w-sm group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] group-focus-within:text-[#242424] transition-colors">
                            <SearchIcon className="w-[16px] h-[16px]" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={searchPlaceholder}
                            className="w-full bg-gray-50 md:bg-gray-100 border-transparent rounded-[10px] py-[8px] pl-10 pr-4 text-[14px] focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {/* Desktop Refresh or Mobile Refresh (if NO grid list) */}
                    <div className={`${!showViewMode ? '' : 'hidden md:block'}`}>
                        {RefreshButton}
                    </div>
                    {/* Custom Filter Slot */}
                    {filterDropdown}
                </div>
            </div>
        </div>
    );
}
