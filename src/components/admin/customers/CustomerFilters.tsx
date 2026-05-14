'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';

interface CustomerFiltersProps {
    status: string;
    onStatusChange: (status: any) => void;
    onSortChange: (sort: string) => void;
    sortBy: string;
}

export default function CustomerFilters({ status, onStatusChange, onSortChange, sortBy }: CustomerFiltersProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const statuses = [
        { label: 'All Customers', value: 'all' },
        { label: 'VIP Members', value: 'vip' },
        { label: 'Active Shoppers', value: 'active' },
        { label: 'Recently Joined', value: 'new' }
    ];

    const sortPatterns = [
        { label: 'Highest LTV', value: 'ltv' },
        { label: 'Most Frequent', value: 'frequent' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Alphabetical', value: 'alpha' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-[12px] py-[8px] rounded-[10px] border transition-all duration-200 font-medium text-[13px] ${isFilterOpen ? 'border-gray-300 bg-gray-100 text-[#242424]' : 'border-gray-200 bg-transparent text-[#71717a] hover:bg-gray-100 hover:border-gray-300 hover:text-[#242424]'}`}
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
                            className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[60] p-4 flex flex-col gap-4 font-rubik"
                        >
                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-[0.15em] mb-3 px-1">Sort Patterns</h3>
                                <div className="flex flex-col gap-1">
                                    {sortPatterns.map((s) => (
                                        <button 
                                            key={s.value} 
                                            onClick={() => {
                                                onSortChange(s.value);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`text-left text-[13px] py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                                                sortBy === s.value 
                                                ? 'bg-[#242424] text-white' 
                                                : 'hover:bg-zinc-50 text-[#71717a] hover:text-[#242424] font-medium'
                                            }`}
                                        >
                                            <span>{s.label}</span>
                                            {sortBy === s.value && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mx-1" />

                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-[0.15em] mb-3 px-1">Customer Tier</h3>
                                <div className="flex flex-col gap-1">
                                    {statuses.map((s) => (
                                        <button 
                                            key={s.value} 
                                            onClick={() => {
                                                onStatusChange(s.value);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`text-left text-[13px] py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                                                status === s.value 
                                                ? 'bg-[#242424] text-white' 
                                                : 'hover:bg-zinc-50 text-[#71717a] hover:text-[#242424] font-medium'
                                            }`}
                                        >
                                            <span>{s.label}</span>
                                            {status === s.value && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 bg-[#242424] text-white text-[13px] font-bold py-2.5 rounded-xl active:scale-[0.98] transition-all shadow-sm"
                                >
                                    Apply Filters
                                </button>
                                <button 
                                    onClick={() => {
                                        onStatusChange('all');
                                        setIsFilterOpen(false);
                                    }}
                                    className="px-4 py-2.5 text-[13px] font-bold text-[#71717a] hover:bg-zinc-50 hover:text-[#242424] rounded-xl transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
