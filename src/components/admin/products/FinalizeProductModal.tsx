'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@/components/icons/CloseIcon';
import ProductStatusManager from './ProductStatusManager';

interface FinalizeProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinalize: () => void;
    formData: any;
    setFormData: (data: any) => void;
    isSaving: boolean;
    mode?: 'create' | 'edit';
}

export default function FinalizeProductModal({
    isOpen,
    onClose,
    onFinalize,
    formData,
    setFormData,
    isSaving,
    mode = 'create'
}: FinalizeProductModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998]"
                    />

                    {/* Bottom Sheet Modal */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[9999] flex flex-col max-h-[75%] md:max-h-[70%] border-t border-gray-100"
                    >
                        {/* Drag Handle UI */}
                        <div className="flex justify-center py-4">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Modal Header */}
                        <div className="px-8 pb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-[20px] font-medium text-[#242424] tracking-tight">
                                    {mode === 'edit' ? 'Review & Update' : 'Finalize Product'}
                                </h2>
                                <p className="text-[13px] text-[#71717a] mt-0.5 font-regular">Review visibility and inventory before publishing.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <CloseIcon className="w-5 h-5 text-[#242424]" />
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                            <div className="max-w-2xl mx-auto">
                                <ProductStatusManager
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            </div>
                        </div>

                        {/* Fixed Footer with Actions */}
                        <div className="p-8 pb-10 border-t border-gray-50 bg-white flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 text-[13px] font-medium text-[#71717a] bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onFinalize}
                                disabled={isSaving}
                                className="flex-[2] py-4 bg-[#242424] text-white rounded-2xl text-[13px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    mode === 'edit' ? "Save Changes" : "Confirm & Create Product"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
