'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';

interface AnalyticsFiltersProps {
    datePreset: string;
    onDatePresetChange: (preset: string) => void;
    onReset: () => void;
}

export default function AnalyticsFilters({
    datePreset,
    onDatePresetChange,
    onReset
}: AnalyticsFiltersProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const datePresets = [
        { id: 'today', name: 'Today' },
        { id: '7d', name: 'Last 7 Days' },
        { id: '30d', name: 'Last 30 Days' },
        { id: '90d', name: 'Last 3 Months' },
        { id: 'custom', name: 'Custom Range' }
    ];

    const currentPresetName = datePresets.find(p => p.id === datePreset)?.name || 'Filters';

    return (
        <div className="relative">
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-[12px] py-[8px] rounded-[10px] border transition-all duration-200 font-medium text-[13px] ${isFilterOpen ? 'border-gray-300 bg-gray-100 text-[#242424]' : 'border-gray-200 bg-transparent text-[#71717a] hover:bg-gray-100 hover:border-gray-300 hover:text-[#242424]'}`}
            >
                <FilterIcon className="w-3.5 h-3.5" />
                <span>{currentPresetName}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <div className="fixed inset-0 z-[120] bg-black/0" onClick={() => setIsFilterOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[130] p-4 flex flex-col gap-4 font-rubik"
                        >
                            <div>
                                <h3 className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">Analysis Period</h3>
                                <div className="flex flex-col gap-1">
                                    {datePresets.map((preset) => (
                                        <button 
                                            key={preset.id} 
                                            onClick={() => {
                                                onDatePresetChange(preset.id);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`text-left text-[13px] py-2 px-3 rounded-xl transition-colors font-medium ${datePreset === preset.id ? 'bg-[#242424] text-white' : 'text-[#242424] hover:bg-zinc-50'}`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                                <button 
                                    onClick={() => {
                                        onReset();
                                        setIsFilterOpen(false);
                                    }}
                                    className="flex-1 py-2 text-[12px] font-bold text-[#71717a] hover:bg-zinc-50 rounded-xl transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
