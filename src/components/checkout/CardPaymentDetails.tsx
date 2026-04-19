'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';

const CardPaymentDetails: React.FC = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 p-4 rounded-xl border border-[#eaebf0] bg-gray-50/50 mt-2 relative overflow-hidden"
        >
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5 text-[#94a3b8]" />
                </div>
                <p className="font-titillium text-[13px] font-semibold text-[#64748b]">
                    Standard Security Protocol
                </p>
                <p className="font-titillium text-[11px] text-[#94a3b8] mt-1">
                    Card payments are being upgraded for enhanced security.
                </p>
            </div>

            <div className="flex flex-col gap-3 opacity-20 pointer-events-none">
                <div className="flex flex-col gap-1.5">
                    <label className="font-titillium text-[12px] font-medium text-[#64748b] ml-1">Card Number</label>
                    <div className="h-[48px] bg-white rounded-lg border border-[#e2e8f0] flex items-center px-3 justify-between">
                        <span className="text-[#94a3b8] font-mono tracking-widest text-sm">•••• •••• •••• ••••</span>
                        <CreditCard className="w-5 h-5 text-[#cbd5e1]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="font-titillium text-[12px] font-medium text-[#64748b] ml-1">Expiry Date</label>
                        <div className="h-[48px] bg-white rounded-lg border border-[#e2e8f0] flex items-center px-3">
                            <span className="text-[#94a3b8] text-sm">MM / YY</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="font-titillium text-[12px] font-medium text-[#64748b] ml-1">CVC</label>
                        <div className="h-[48px] bg-white rounded-lg border border-[#e2e8f0] flex items-center px-3">
                            <span className="text-[#94a3b8] text-sm">•••</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CardPaymentDetails;
