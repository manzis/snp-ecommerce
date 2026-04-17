'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';

export default function ReviewFilters() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
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
                                <h3 className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">Rating</h3>
                                <div className="flex flex-col gap-1">
                                    {['5 Stars', '4+ Stars', '3+ Stars', '2+ Stars', '1 Star'].map((rating) => (
                                        <button key={rating} className="text-left text-[14px] py-1.5 px-2 rounded-lg hover:bg-zinc-100 transition-colors text-[#242424]">
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div>
                                <h3 className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
                                        <button key={status} className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${status === 'All' ? 'bg-[#242424] text-white' : 'bg-gray-50 text-[#71717a] hover:bg-zinc-100'}`}>
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
                                <button className="px-3 py-2 text-[14px] font-medium text-[#71717a] hover:bg-zinc-100 hover:text-[#242424] rounded-lg transition-colors">
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
