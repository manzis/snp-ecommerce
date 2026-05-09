'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footerActions?: React.ReactNode;
    headerRight?: React.ReactNode;
    maxHeight?: string;
    maxWidth?: string;
}

export default function AdminModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footerActions,
    headerRight,
    maxHeight = 'max-h-[75dvh] lg:max-h-[50dvh]',
    maxWidth = 'max-w-2xl'
}: AdminModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100001] flex items-end md:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={`relative w-full ${maxWidth} bg-white shadow-2xl flex flex-col ${maxHeight} rounded-t-[24px] md:rounded-[12px]`}
                    >
                        {/* Floating Close Button (Outside/Floating Above) */}
                        <button
                            onClick={onClose}
                            className="absolute bottom-[calc(100%+10px)] right-4 md:right-0 p-2.5 bg-white text-[#242424] rounded-[12px] border border-gray-200 shadow-xl shadow-black/5 transition-all hover:bg-gray-50 active:scale-95 group z-50"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        {/* Mobile Drag Handle */}
                        <div className="flex justify-center p-3 sticky top-0 bg-white z-20 rounded-t-[24px] md:hidden">
                            <div className="w-12 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-8 pb-4 pt-4 md:pt-6 border-b border-gray-100 flex justify-between items-start font-rubik sticky top-0 z-20 bg-white rounded-t-[24px] md:rounded-t-[12px]">
                            <div className="flex flex-col">
                                <h3 className="text-[18px] font-medium text-[#242424] tracking-tight">{title}</h3>
                                {description && (
                                    <p className="text-[12px] text-[#71717a] font-regular mt-0.5">{description}</p>
                                )}
                            </div>
                            {headerRight && (
                                <div className="ml-4 pt-1">
                                    {headerRight}
                                </div>
                            )}
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 font-rubik custom-scrollbar">
                            {children}
                        </div>

                        {/* Footer */}
                        {footerActions && (
                            <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center gap-4 font-rubik sticky bottom-0 z-20 md:rounded-b-[12px]">
                                {footerActions}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
