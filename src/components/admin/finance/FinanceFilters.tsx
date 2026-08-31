'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';

interface FinanceFiltersProps {
    datePreset: string;
    onDatePresetChange: (preset: string) => void;
    orderStatus: string;
    onOrderStatusChange: (val: string) => void;
    paymentStatus: string;
    onPaymentStatusChange: (val: string) => void;
    onReset: () => void;
}

export default function FinanceFilters({
    datePreset,
    onDatePresetChange,
    orderStatus,
    onOrderStatusChange,
    paymentStatus,
    onPaymentStatusChange,
    onReset
}: FinanceFiltersProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const datePresets = [
        { id: '7d', name: 'Last 7 Days' },
        { id: '30d', name: 'Last 30 Days' },
        { id: '90d', name: 'Last 3 Months' },
        { id: '1y', name: 'Last Year' },
        { id: 'all_time', name: 'All Time' },
        { id: 'custom', name: 'Custom Range' }
    ];

    const orderStatuses = [
        { id: 'all', name: 'All' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'shipped', name: 'Shipped' },
        { id: 'delivered', name: 'Delivered' }
    ];

    const paymentStatuses = [
        { id: 'all', name: 'All' },
        { id: 'paid', name: 'Paid' },
        { id: 'pending', name: 'Pending' },
        { id: 'failed', name: 'Failed' }
    ];

    const hasActiveFilters = datePreset !== '30d' || orderStatus !== 'all' || paymentStatus !== 'all';

    return (
        <div className="relative">
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border transition-all duration-200 font-medium text-[14px] ${isFilterOpen ? 'border-[#242424] bg-white text-[#242424]' : 'border-gray-200 text-[#71717a] hover:border-[#242424] hover:text-[#242424]'}`}
            >
                <FilterIcon className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
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
                            className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12),0_0_1px_0_rgba(0,0,0,0.1)] z-[130] p-4 flex flex-col gap-4 font-rubik"
                        >
                            {/* Time Period Filter */}
                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">Time Period</h3>
                                <div className="grid grid-cols-2 gap-1">
                                    {datePresets.map((preset) => (
                                        <button 
                                            key={preset.id} 
                                            onClick={() => onDatePresetChange(preset.id)}
                                            className={`text-left text-[12px] py-1.5 px-2.5 rounded-lg transition-colors font-medium ${datePreset === preset.id ? 'bg-[#242424] text-white' : 'text-[#242424] hover:bg-zinc-100'}`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Order Status Filter */}
                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">Order Status</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {orderStatuses.map((s) => (
                                        <button 
                                            key={s.id} 
                                            onClick={() => onOrderStatusChange(s.id)}
                                            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${orderStatus === s.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-[#71717a] hover:bg-zinc-100 hover:text-[#242424]'}`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Payment Status Filter */}
                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-2">Payment Status</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {paymentStatuses.map((s) => (
                                        <button 
                                            key={s.id} 
                                            onClick={() => onPaymentStatusChange(s.id)}
                                            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${paymentStatus === s.id ? 'bg-[#242424] text-white shadow-sm' : 'bg-gray-50 text-[#71717a] hover:bg-zinc-100 hover:text-[#242424]'}`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 bg-[#242424] text-white text-[13px] font-bold py-2.5 rounded-xl active:scale-[0.98] transition-all hover:bg-black"
                                >
                                    Apply
                                </button>
                                <button 
                                    onClick={() => {
                                        onReset();
                                        setIsFilterOpen(false);
                                    }}
                                    className="px-4 py-2 text-[13px] font-bold text-[#71717a] hover:bg-zinc-100 rounded-lg transition-colors"
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
