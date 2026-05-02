'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '@/services/auth.service';

import SearchIcon from '@/components/icons/SearchIcon';
import NotificationIcon from '@/components/icons/NotificationIcon';
import MessageIcon from '@/components/icons/MessageIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';
import HomeIcon from '@/components/icons/HomeIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon';
import BackArrowIcon from '@/components/icons/BackArrowIcon';




export default function AdminHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const isPreviewMode = pathname.includes('/preview/');

    if (isPreviewMode) return null;

    const handleLogout = async () => {
        try {
            await AuthService.signOut();
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <header className="hidden md:flex h-14 bg-white items-center justify-between px-[10px] z-[130] rounded-[12px] relative">
            {/* Left Section: Utility Icons */}
            <div className="flex items-center gap-1 shrink-0">
                <div className="text-xl font-bold text-gray-900 md:hidden mr-2">
                    AdminPanel
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.back()}
                        className="w-[36px] h-[36px] border border-[#e4e4e7] text-[#242424] hover:bg-[#f4f4f5] rounded-[10px] transition-all relative group flex items-center justify-center shrink-0"
                        title="Go Back"
                    >
                        <BackArrowIcon className="w-[18px] h-[18px]" />
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                        <Link
                            href="/admin"
                            className="w-[36px] h-[36px] hover:bg-[#f4f4f5] rounded-[10px] text-[#71717a] hover:text-[#242424] transition-all flex items-center justify-center shrink-0"
                            title="Dashboard Home"
                        >
                            <HomeIcon className="w-[18px] h-[18px]" />
                        </Link>
                        <Link
                            href="/"
                            target="_blank"
                            className="w-[36px] h-[36px] hover:bg-[#f4f4f5] rounded-[10px] text-[#71717a] hover:text-[#242424] transition-all flex items-center justify-center shrink-0"
                            title="Visit Storefront"
                        >
                            <ExternalLinkIcon className="w-[18px] h-[18px]" />
                        </Link>
                        <button
                            className="w-[36px] h-[36px] hover:bg-[#f4f4f5] rounded-[10px] text-[#71717a] hover:text-[#242424] transition-all flex items-center justify-center shrink-0"
                            title="Quick Add"
                        >
                            <PlusIcon className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Section: Search Bar */}
            <div className="flex-1 max-w-md mx-6 relative group hidden sm:block">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#242424] transition-colors">
                    <SearchIcon className="w-[16px] h-[16px]" />
                </div>
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-full bg-[#f4f4f5] border-transparent rounded-[10px] py-[8px] pl-10 pr-12 text-[14px] font-['Rubik',_sans-serif] focus:bg-white focus:ring-1 focus:ring-[#e4e4e7] focus:border-[#e4e4e7] outline-none transition-all placeholder:text-gray-400"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:opacity-0 transition-opacity flex items-center">
                    <kbd className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-gray-400 bg-white border border-gray-200 rounded-[5px] ">
                        <span className="text-[11px] font-sans">⌘</span>
                        <span>K</span>
                    </kbd>
                </div>
            </div>

            {/* Right Section: Utilities & Profile */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Message Button */}
                <button className="p-2 hover:bg-[#f4f4f5] rounded-[10px] text-[#71717a] hover:text-[#242424] transition-all relative group" title="Messages">
                    <MessageIcon className="w-[20px] h-[20px]" />
                    <span className="absolute top-2 right-2 w-[6px] h-[6px] bg-red-500 rounded-full border border-white group-hover:scale-110 transition-transform"></span>
                </button>

                {/* Notification Button */}
                <button className="p-2 hover:bg-[#f4f4f5] rounded-[10px] text-[#71717a] hover:text-[#242424] transition-all relative group" title="Notifications">
                    <NotificationIcon className="w-[20px] h-[20px]" />
                    <span className="absolute top-2 right-2 w-[6px] h-[6px] bg-red-500 rounded-full border border-white group-hover:scale-110 transition-transform"></span>
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block" />

                {/* Profile Section */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className={`flex items-center gap-2 p-1 pl-2 rounded-[10px] transition-all duration-200 outline-none ${isProfileMenuOpen ? 'bg-[#f4f4f5] ring-1 ring-black/5' : 'hover:bg-[#f4f4f5]'}`}
                        aria-expanded={isProfileMenuOpen}
                    >
                        <div className="relative w-8 h-8 rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0 border border-black/5">
                            <Image src="/images/avatar.svg" alt="Admin Profile" fill sizes="32px" className="object-cover" />
                        </div>
                        {!isProfileMenuOpen && (
                            <ChevronDownIcon className="text-[#71717a] w-[14px] h-[14px]" />
                        )}
                        {isProfileMenuOpen && (
                            <motion.div animate={{ rotate: 180 }}>
                                <ChevronDownIcon className="text-[#242424] w-[14px] h-[14px]" />
                            </motion.div>
                        )}
                    </button>

                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-[60]" onClick={() => setIsProfileMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-[#e4e4e7] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-[140] overflow-hidden p-1 flex flex-col gap-1"
                                >
                                    <div className="px-3 py-2 pb-1">
                                        <p className="text-[13px] font-medium text-[#242424] truncate">Bright Nepcare</p>
                                        <p className="text-[11px] text-[#71717a] truncate">brightnepcare@gmail.com</p>
                                    </div>
                                    <div className="h-[1px] bg-[#e4e4e7] mx-1 my-1" />
                                    <Link
                                        href="/admin/profile"
                                        onClick={() => setIsProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-[#242424] hover:bg-[#f4f4f5] rounded-[8px] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg>
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }}
                                        className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-[8px] transition-colors text-left"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                        Log out
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
