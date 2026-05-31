"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon';
import CheckIcon from '@/components/icons/TickIcon2';

export type AdminToastType = 'success' | 'error' | 'info';

interface AdminToastProps {
    message: string;
    type: AdminToastType;
    onClose: () => void;
}

export const AdminToast = ({ message, type, onClose }: AdminToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000); // 4 seconds duration
        return () => clearTimeout(timer);
    }, [onClose]);

    // Choose base styles, preserving black bg/white text per specs.
    // We add a subtle tint depending on the type for slightly better UX, but keep the strict B/W core.
    const borderTint = type === 'success' ? 'border-white/20' : type === 'error' ? 'border-red-500/40' : 'border-white/20';
    const iconColor = type === 'success' ? 'text-white' : type === 'error' ? 'text-red-400' : 'text-white';

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
            <AnimatePresence>
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -30, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                        pointer-events-auto flex items-center justify-between gap-4 
                        pl-4 pr-2 py-3 min-w-[300px] max-w-[450px]
                        bg-[#0a0a0a] border ${borderTint} rounded-xl
                        shadow-[0_8px_35px_rgb(0,0,0,0.2)]
                        font-rubik
                    `}
                >
                    <div className="flex items-center gap-3">
                        {type === 'success' ? (
                            <CheckIcon className={`w-4 h-4 ${iconColor}`} />
                        ) : type === 'error' ? (
                            <div className={`w-5 h-5 rounded-full border border-red-500/50 flex items-center justify-center`}>
                                <span className="text-[12px] font-bold text-red-500 leading-none">!</span>
                            </div>
                        ) : (
                            <div className="w-2 h-2 bg-white rounded-full ml-1" />
                        )}
                        <p className="text-white text-[14px] font-medium leading-tight m-0 p-0">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors p-1"
                        aria-label="Close"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
