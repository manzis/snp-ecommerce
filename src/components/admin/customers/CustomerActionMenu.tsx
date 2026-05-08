'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HorizontalDotsIcon from '@/components/icons/DotsHorizontalIcon';
import { CustomerData } from '@/app/actions/customerActions';
import { 
    Eye, 
    MessageCircle, 
    Mail, 
    UserX,
    TrendingUp,
    Trash2
} from 'lucide-react';

interface CustomerActionMenuProps {
    customer: CustomerData;
    onView?: (customer: CustomerData) => void;
    onEdit?: (customer: CustomerData) => void;
    onWhatsApp?: (customer: CustomerData) => void;
    onEmail?: (customer: CustomerData) => void;
    onAnalyze?: (customer: CustomerData) => void;
    onRestrict?: (customer: CustomerData) => void;
    onDelete?: (customer: CustomerData) => void;
    onOpenChange?: (isOpen: boolean) => void;
}

const ActionIcon = ({ icon: Icon, className }: { icon: any, className?: string }) => (
    <Icon className={className || "w-4 h-4 text-[#71717a]"} />
);

export default function CustomerActionMenu({
    customer,
    onView,
    onEdit,
    onWhatsApp,
    onEmail,
    onAnalyze,
    onRestrict,
    onDelete,
    onOpenChange,
}: CustomerActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const next = !isOpen;
        setIsOpen(next);
        onOpenChange?.(next);
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
                className={`flex w-[32px] h-[32px] items-center justify-center shrink-0 rounded-[8px] transition-colors duration-[150ms] ease-in-out cursor-pointer z-[110] ${isOpen ? 'bg-[#242424] text-white' : 'bg-transparent text-[#242424] hover:bg-black/5'}`}
                aria-label="Customer actions"
            >
                <HorizontalDotsIcon className="w-[18px] h-[18px]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-[calc(100%+8px)] w-[200px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.1)] z-[120] py-1.5 px-1.5"
                    >
                        <button
                            onClick={(e) => handleAction(e, () => onView?.(customer))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-normal rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <Eye className="w-4 h-4 text-[#71717a]" />
                            <span>View Profile</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, () => onEdit?.(customer))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-normal rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <ActionIcon icon={TrendingUp} />
                            <span>Analyze Pattern</span>
                        </button>
                        
                        <div className="border-t border-gray-50 my-1" />

                        <button
                            onClick={(e) => handleAction(e, () => onWhatsApp?.(customer))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-normal rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span>WhatsApp Offer</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, () => onEmail?.(customer))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-normal rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <Mail className="w-4 h-4 text-amber-600" />
                            <span>Email Marketing</span>
                        </button>

                        <div className="border-t border-gray-50 my-1" />

                        <button
                            onClick={(e) => handleAction(e, () => onRestrict?.(customer))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-normal rounded-[6px] text-[#242424] hover:bg-zinc-100 transition-colors"
                        >
                            <UserX className="w-4 h-4 text-[#71717a]" />
                            <span>Restrict User</span>
                        </button>

                        <button
                            onClick={(e) => handleAction(e, () => onDelete?.(customer))}
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-normal rounded-[6px] text-[#ef4444] hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Customer</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
