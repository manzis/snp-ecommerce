'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';

interface OrderFiltersProps {
    status: string;
    setStatus: (status: string) => void;
    paymentStatus: string;
    setPaymentStatus: (status: string) => void;
    hideCancelled: boolean;
    setHideCancelled: (val: boolean) => void;
}

export default function OrderFilters({ 
    status: activeStatus, 
    setStatus, 
    paymentStatus: activePaymentStatus = 'all', 
    setPaymentStatus, 
    hideCancelled, 
    setHideCancelled 
}: OrderFiltersProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const statuses = [
        'all', 'pending', 'confirmed', 'processing', 'shipped', 
        'delivered', 'cancelled', 'returned'
    ];

    const paymentStatuses = [
        { id: 'all', label: 'All' },
        { id: 'unpaid', label: 'Unpaid' },
        { id: 'pending', label: 'Pending' },
        { id: 'paid', label: 'Paid' },
        { id: 'partially_paid', label: 'Part. Paid' },
        { id: 'failed', label: 'Failed' },
    ];

    const hasActiveFilters = activeStatus !== 'all' || activePaymentStatus !== 'all' || hideCancelled;

    return (
        <div className="relative">
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-[10px] py-[8px] rounded-[10px] border transition-all duration-200 font-medium text-[14px] ${isFilterOpen ? 'border-gray-300 bg-gray-100 text-[#242424]' : 'border-gray-200 bg-transparent text-[#71717a] hover:bg-gray-100 hover:border-gray-300 hover:text-[#242424]'}`}
            >
                <FilterIcon className="w-4 h-4" />
                <span>Filter</span>
                {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#242424]" />
                )}
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
                            className="absolute right-0 top-[calc(100%+8px)] w-72 bg-white border border-gray-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(0,0,0,0.08)] z-[60] p-4 flex flex-col gap-4 font-rubik"
                        >
                            {/* Order Status Section */}
                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-2.5">Order Status</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {statuses.map((s) => (
                                        <button 
                                            key={s} 
                                            onClick={() => setStatus(s)}
                                            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${activeStatus === s ? 'bg-[#242424] text-white' : 'bg-gray-50 text-[#71717a] hover:bg-zinc-100 hover:text-[#242424]'}`}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Payment Status Section */}
                            <div>
                                <h3 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-2.5">Payment Status</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {paymentStatuses.map((s) => (
                                        <button 
                                            key={s.id} 
                                            onClick={() => setPaymentStatus(s.id)}
                                            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${activePaymentStatus === s.id ? 'bg-[#242424] text-white shadow-sm' : 'bg-gray-50 text-[#71717a] hover:bg-zinc-100 hover:text-[#242424]'}`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* Hide Cancelled Section */}
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-[#242424]">Hide Cancelled</span>
                                <button
                                    onClick={() => setHideCancelled(!hideCancelled)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${hideCancelled ? 'bg-[#242424]' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${hideCancelled ? 'translate-x-4' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 bg-[#242424] text-white text-[13px] font-medium py-2.5 rounded-xl active:scale-[0.98] transition-all hover:bg-black shadow-lg shadow-black/5"
                                >
                                    Apply Changes
                                </button>
                                <button 
                                    onClick={() => { 
                                        setStatus('all'); 
                                        setPaymentStatus('all'); 
                                        setHideCancelled(false); 
                                        setIsFilterOpen(false); 
                                    }}
                                    className="px-3 py-2.5 text-[13px] font-medium text-[#71717a] hover:bg-zinc-50 hover:text-[#242424] rounded-xl transition-colors"
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
