'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon';

interface AdminSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    description?: string | React.ReactNode;
    children: React.ReactNode;
    footerActions?: React.ReactNode;
    headerActions?: React.ReactNode;
    maxWidth?: string;
}

export default function AdminSheet({
    isOpen,
    onClose,
    title,
    description,
    children,
    footerActions,
    headerActions,
    maxWidth
}: AdminSheetProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    const sheetContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Sheet Container */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className={`relative w-full ${maxWidth || 'max-w-[500px]'} h-full bg-white shadow-2xl flex flex-col font-rubik`}
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
                            <div className="space-y-1">
                                <div className="text-[18px] font-medium text-[#242424] tracking-tight">{title}</div>
                                {description && (
                                    <p className="text-[12px] text-[#71717a] font-regular">{description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {headerActions}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#71717a] hover:text-[#242424]"
                                >
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                            {children}
                        </div>

                        {/* Fixed Footer */}
                        {footerActions && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0 z-20 flex gap-3">
                                {footerActions}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(sheetContent, document.body);
}
