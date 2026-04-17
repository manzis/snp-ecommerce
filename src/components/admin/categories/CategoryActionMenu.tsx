'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/services/productService';
import TrashIcon from '@/components/icons/TrashIcon';
import HorizontalDotsIcon from '@/components/icons/DotsHorizontalIcon';

interface CategoryActionMenuProps {
    category: Category;
    onEdit?: (category: Category) => void;
    onDelete?: (id: string) => void;
    onOpenChange?: (isOpen: boolean) => void;
}

const EditIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

export default function CategoryActionMenu({
    category,
    onEdit,
    onDelete,
    onOpenChange
}: CategoryActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Click outside listener
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onOpenChange?.(false);
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
    };

    const handleAction = (e: React.MouseEvent, action?: () => void) => {
        e.stopPropagation();
        e.preventDefault();
        action?.();
        setIsOpen(false);
        onOpenChange?.(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                type="button"
                className={`flex w-[32px] h-[32px] items-center justify-center shrink-0 rounded-[8px] transition-colors duration-[150ms] ease-in-out z-[12] cursor-pointer ${isOpen ? 'bg-[#242424] text-white' : 'bg-[#f4f4f5] text-[#242424] hover:bg-[#e4e4e7]'}`}
                aria-label="Category actions"
            >
                <HorizontalDotsIcon className="w-[18px] h-[18px]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-[calc(100%+8px)] w-[160px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[110] py-1.5 px-1.5"
                    >
                        {/* Edit */}
                        <button
                            onClick={(e) => handleAction(e, () => onEdit?.(category))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <EditIcon className="w-4 h-4 text-[#71717a]" />
                            <span>Edit details</span>
                        </button>

                        <div className="border-t border-gray-50 my-1"></div>

                        {/* Delete */}
                        <button
                            onClick={(e) => handleAction(e, () => onDelete?.(category.id))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] rounded-[6px] text-[#ef4444] hover:bg-red-50/80 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
