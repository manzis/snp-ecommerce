'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/services/productService';
import TrashIcon from '@/components/icons/TrashIcon';
import Link from 'next/link';

interface ProductActionMenuProps {
    onUpdate: (updates: Partial<Product>) => void;
    onUpdatePrice: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    fullProduct: Product;
    onOpenChange?: (isOpen: boolean) => void;
}

const VisibilityIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const InventoryIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

export default function ProductActionMenu({
    onUpdate,
    onUpdatePrice,
    onDelete,
    onDuplicate,
    fullProduct,
    onOpenChange
}: ProductActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<'visibility' | 'availability' | null>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Click outside listener
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onOpenChange?.(false);
                setActiveSubmenu(null);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const nextState = !isOpen;
        setIsOpen(nextState);
        onOpenChange?.(nextState);
        setActiveSubmenu(null);
    };

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        action();
        setIsOpen(false);
        onOpenChange?.(false);
    };

    const isPublished = fullProduct?.is_published;
    const isDraft = fullProduct?.is_draft;
    const stockStatus = fullProduct?.stock_status;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                type="button"
                className={`flex w-[32px] h-[32px]  items-center justify-center shrink-0 rounded-[8px] transition-colors duration-[150ms] ease-in-out z-[12] cursor-pointer ${isOpen ? 'bg-[#242424] text-white' : 'bg-gray-50 text-[#71717a] hover:bg-gray-100'}`}
            >
                <div className="flex gap-[2px]">
                    <div className="w-[3px] h-[3px] rounded-full bg-current" />
                    <div className="w-[3px] h-[3px] rounded-full bg-current" />
                    <div className="w-[3px] h-[3px] rounded-full bg-current" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-[calc(100%+8px)] w-[180px] md:w-[190px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[110] py-1.5 px-1.5"
                    >
                        {/* Edit */}
                        <Link
                            href={`/admin/products/edit/${fullProduct.id}`}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a]">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit Details</span>
                        </Link>


                        {/* Conditional Visibility Toggle */}
                        <button
                            onClick={(e) => handleAction(e, () => onUpdate({
                                is_published: !isPublished || isDraft,
                                is_draft: false
                            }))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <VisibilityIcon className="w-4 h-4 text-[#71717a]" />
                            <span>{isPublished && !isDraft ? 'Hide from Store' : 'Publish Live'}</span>
                        </button>

                        {/* Availability Submenu */}
                        <div
                            className="relative"
                            onMouseEnter={() => setActiveSubmenu('availability')}
                            onMouseLeave={() => setActiveSubmenu(null)}
                        >
                            <button className="w-full flex items-center justify-between px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <InventoryIcon className="w-4 h-4 text-[#71717a]" />
                                    <span>Stock Status</span>
                                </div>
                                <ChevronRightIcon className="w-3 h-3 text-[#a1a1aa]" />
                            </button>
                            <AnimatePresence>
                                {activeSubmenu === 'availability' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="absolute md:left-[calc(100%--2px)] right-[calc(100%--4px)] md:right-auto top-0 w-[135px] md:w-[150px] bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-[120]"
                                    >
                                        {[
                                            { label: 'In Stock', value: 'in_stock' },
                                            { label: 'Out of Stock', value: 'out_of_stock' },
                                            { label: 'Pre-Order', value: 'pre_order' }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={(e) => handleAction(e, () => onUpdate({ stock_status: option.value as any }))}
                                                className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] text-[#242424] hover:bg-zinc-100 transition-colors"
                                            >
                                                <span>{option.label}</span>
                                                {stockStatus === option.value && <CheckIcon className="w-3 h-3 text-green-500" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Update Price */}
                        <button
                            onClick={(e) => handleAction(e, onUpdatePrice)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors border-t border-gray-50 mt-1 pt-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a]">
                                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <span>Update Pricing</span>
                        </button>

                        <div className="border-t border-gray-50 my-1"></div>

                        {/* Move to Draft */}
                        <button
                            onClick={(e) => handleAction(e, () => onUpdate({ is_draft: !isDraft, is_published: isDraft ? isPublished : false }))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <StatusIcon className="w-4 h-4 text-[#71717a]" />
                            <span>{isDraft ? 'Remove from Draft' : 'Move to Drafts'}</span>
                        </button>

                        {/* Duplicate */}
                        <button
                            onClick={(e) => handleAction(e, onDuplicate)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a]">
                                <rect width="13" height="13" x="9" y="9" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>Duplicate</span>
                        </button>

                        <div className="border-t border-gray-50 my-1"></div>

                        {/* Delete */}
                        <button
                            onClick={(e) => handleAction(e, onDelete)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#ef4444] hover:bg-red-50/80 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete Product</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Internal reusable icon fallback if needed
const StatusIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);
