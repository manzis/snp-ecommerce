'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Lock } from 'lucide-react';

const NetbankingPaymentDetails: React.FC = () => {
    const [search, setSearch] = useState('');

    const demoBanks = [
        "Siddhartha Bank", "Nabil Bank", "NIC Asia Bank", 
        "Global IME", "Nepal Investment Mega", "Everest Bank"
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 p-4 rounded-xl border border-[#eaebf0] bg-gray-50/50 relative overflow-hidden"
        >
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                    <Building2 className="w-5 h-5 text-[#94a3b8]" />
                </div>
                <p className="font-rajdhani text-[13px] font-semibold text-[#64748b]">
                    Network Maintenance
                </p>
                <p className="font-rajdhani text-[11px] text-[#94a3b8] mt-1">
                    Direct bank integrations are currently being optimized.
                </p>
            </div>

            <div className="flex flex-col gap-3 opacity-20 pointer-events-none">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input 
                        type="text"
                        placeholder="Search for your bank..."
                        value={search}
                        readOnly
                        className="w-full h-[48px] bg-white rounded-lg border border-[#e2e8f0] pl-10 pr-4 font-rajdhani text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                    {demoBanks.map((bank, i) => (
                        <div 
                            key={i}
                            className="h-[44px] bg-white border border-[#e2e8f0] rounded-lg flex items-center px-3 gap-2"
                        >
                            <div className="w-6 h-6 rounded bg-[#f1f5f9] flex items-center justify-center text-[10px] font-bold text-[#cbd5e1]">
                                {bank.charAt(0)}
                            </div>
                            <span className="text-[11px] font-medium text-[#64748b] truncate">{bank}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default NetbankingPaymentDetails;
