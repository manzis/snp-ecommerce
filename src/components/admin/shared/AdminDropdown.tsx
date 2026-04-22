'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronDownIcon from '@/components/icons/CaretDownIcon';
import Image from 'next/image';

interface DropdownOption {
    id: string;
    name: string;
    image?: string;
    subtext?: string;
}

interface AdminDropdownProps {
    label?: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    showError?: boolean;
    required?: boolean;
    onCreateNew?: () => void;
    createNewLabel?: string;
    className?: string;
}

export default function AdminDropdown({
    label,
    value,
    options = [],
    onChange,
    placeholder = 'Select option',
    error,
    showError,
    required,
    onCreateNew,
    createNewLabel = 'Create New',
    className = ''
}: AdminDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            // Focus search input after a short delay for animation
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div className={`flex flex-col gap-2 relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-[11px] font-medium text-[#71717a] px-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                data-error={showError && value === '' ? "true" : "false"}
                className={`
                    flex items-center justify-between w-full bg-white border rounded-xl px-4 py-3 text-[14px] transition-all outline-none text-left
                    ${showError && value === '' ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-black'}
                    ${isOpen ? 'border-black ring-1 ring-black/5' : ''}
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedOption?.image ? (
                        <div className="relative w-5 h-5 rounded-[6px] overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            <Image src={selectedOption.image} alt="" fill className="object-contain p-0.5" />
                        </div>
                    ) : selectedOption && (
                        <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                            {selectedOption.name.charAt(0)}
                        </div>
                    )}
                    <span className={`truncate ${!selectedOption ? 'text-zinc-400' : 'text-[#242424]'}`}>
                        {selectedOption ? selectedOption.name : placeholder}
                    </span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-gray-100 rounded-[16px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(0,0,0,0.08)] z-[100] max-h-[400px] overflow-hidden flex flex-col"
                    >
                        {/* Search Input Area */}
                        <div className="p-2 pb-1 bg-white">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-8 py-1.5 text-[13px] outline-none focus:border-black focus:bg-white transition-all shadow-inner-sm"
                                />
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-y-auto py-1 px-2 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-6 text-center text-gray-400 text-[13px] italic">
                                    {options.length === 0 ? 'No options found' : 'No matches found'}
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleSelect(option.id)}
                                        className={`
                                            w-full flex items-center justify-between gap-3 px-2.5 py-2 text-[14px] rounded-[8px] transition-all text-left
                                            ${value === option.id ? 'bg-gray-50 text-[#242424] font-medium' : 'text-[#4d4d4d] hover:bg-gray-50 hover:text-[#242424]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 ">
                                            <div className="relative w-7 h-7 rounded-[6px] overflow-hidden bg-white border border-gray-100 shrink-0 s">
                                                {option.image ? (
                                                    <Image src={option.image} alt="" fill className="object-contain p-1" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400 font-medium">
                                                        {option.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="truncate">{option.name}</span>
                                                {option.subtext && <span className="text-[11px] text-gray-400 font-regular">{option.subtext}</span>}
                                            </div>
                                        </div>
                                        {value === option.id && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {onCreateNew && (
                            <div className="p-2 pt-1 bg-white">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onCreateNew();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-medium text-white bg-[#242424] hover:bg-black rounded-[10px] transition-all shadow-sm"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    <span>{createNewLabel}</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {showError && value === '' && error && (
                <div className="text-red-500 text-[11px] font-medium mt-1">{error}</div>
            )}
        </div>
    );
}
