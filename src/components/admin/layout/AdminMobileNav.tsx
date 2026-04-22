'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import Image from 'next/image';

// Icon imports
import DashboardIcon from '@/components/icons/DashboardIcon';
import ProductsIcon from '@/components/icons/CategoryIcon';
import OrdersIcon from '@/components/icons/OrdersIcon';
import BankingIcon from '@/components/icons/BankingIcon';
import DotsHorizontalIcon from '@/components/icons/DotsHorizontalIcon';
import AccordianIcon from '@/components/icons/AccordianIcon';

// More Menu Icons
import CustomersIcon from '@/components/icons/CustomersIcon';
import StoreSettingsIcon from '@/components/icons/StoreSettingsIcon';
import LayoutsIcon from '@/components/icons/LayoutsIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon';
import PreferencesIcon from '@/components/icons/PreferencesIcon';

import { AuthService } from '@/services/auth.service';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: DashboardIcon, href: '/admin/dashboard' },
    { label: 'Products', icon: ProductsIcon, href: '/admin/products' },
    { label: 'Orders', icon: OrdersIcon, href: '/admin/orders' },
    { label: 'Finance', icon: BankingIcon, href: '/admin/finance' },
    { label: 'More', icon: DotsHorizontalIcon, href: '#more' },
];

const MORE_MENU_ITEMS = [
    { label: 'Categories', icon: ProductsIcon, href: '/admin/categories' },
    { label: 'Brands', icon: ProductsIcon, href: '/admin/brands' }, // Using same icon for now or check for BrandIcon
    { label: 'Customers', icon: CustomersIcon, href: '/admin/customers' },
    { label: 'Sellers', icon: AnalyticsIcon, href: '/admin/sellers' },
    { label: 'Layouts', icon: LayoutsIcon, href: '/admin/layouts' },
    { label: 'Coupons', icon: PreferencesIcon, href: '/admin/abandoned-cart' }, // Map correctly
    { label: 'Reviews', icon: PreferencesIcon, href: '/admin/reviews' },
    { label: 'QA', icon: PreferencesIcon, href: '/admin/qa' },
    { label: 'Store', icon: StoreSettingsIcon, href: '/admin/settings/store' },
    { label: 'Settings', icon: SettingsIcon, href: '/admin/settings' },
];

const AdminMobileNav: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { newOrderCount } = useOrderNotifications();

    const activeIndex = useMemo(() => {
        const index = NAV_ITEMS.findIndex(item => {
            if (item.label === 'More') return isMoreMenuOpen;
            if (item.href === '/admin/dashboard' || item.href === '/admin') {
                return pathname === '/admin/dashboard' || pathname === '/admin';
            }
            return pathname.startsWith(item.href);
        });
        return index;
    }, [pathname, isMoreMenuOpen]);

    // Auto-close menus on navigation
    useEffect(() => {
        setIsMoreMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await AuthService.signOut();
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const isPreviewMode = pathname.includes('/preview/');

    if (isPreviewMode) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[160] flex flex-col items-center pointer-events-none md:hidden transition-all duration-300">
            <AnimatePresence>
                {isMoreMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsMoreMenuOpen(false);
                                setIsProfileMenuOpen(false);
                            }}
                            className="fixed inset-0 bg-black/5 pointer-events-auto z-[165]"
                        />

                        {/* More Menu Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="pointer-events-auto absolute bottom-[78px] left-[12px] right-[12px] bg-white rounded-[16px] shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)]  p-[16px] z-[170]"
                        >
                            <div className="grid grid-cols-2 gap-[8px]">
                                {MORE_MENU_ITEMS.map((item) => {
                                    const isItemActive = pathname === item.href;
                                    const MenuIcon = item.icon;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setIsMoreMenuOpen(false)}
                                            className={`flex items-center gap-[10px] h-[44px] px-[12px] py-[8px] rounded-[10px] transition-all duration-200 border ${isItemActive ? 'bg-[#242424] border-[#242424] text-white ' : 'bg-gray-50 border-transparent text-[#71717a] active:scale-95'}`}
                                        >
                                            <MenuIcon className={`w-[18px] h-[18px] ${isItemActive ? 'text-white' : 'text-[#71717a]'}`} />
                                            <span className="text-[12px] font-medium font-rubik tracking-tight">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="h-[1px] bg-gray-100 mx-[4px] my-[10px]" />

                            {/* User Profile Footer */}
                            <div className="relative flex items-center justify-between px-[6px] py-[4px]">
                                <Link
                                    href="/admin/profile"
                                    onClick={() => setIsMoreMenuOpen(false)}
                                    className="flex items-center gap-[10px] group active:scale-95 transition-transform"
                                >
                                    <div className="relative w-[34px] h-[34px] rounded-[10px] overflow-hidden bg-gray-100 border border-gray-100">
                                        <Image src="/images/avatar.svg" alt="Admin" fill className="object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-semibold text-[#18181b] font-rubik tracking-tight leading-tight">Bright Nepcare</span>
                                        <span className="text-[9px] text-[#71717a] font-rubik tracking-tight">brightnepcare@gmail.com</span>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className={`w-[30px] h-[30px] flex items-center justify-center rounded-[10px] transition-all duration-200 ${isProfileMenuOpen ? 'bg-[#18181b] text-white shadow-lg' : 'bg-gray-50 text-[#71717a] hover:bg-gray-100 active:scale-90'}`}
                                    title="Options"
                                >
                                    <motion.div animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}>
                                        <AccordianIcon className="w-[14px] h-[14px]" />
                                    </motion.div>
                                </button>

                                {/* Profile Context Menu */}
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <>
                                            {/* Local Backdrop to close on click-outside */}
                                            <div
                                                className="fixed inset-0 z-[115]"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsProfileMenuOpen(false);
                                                }}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                                className="absolute bottom-full right-0 mb-[12px] w-[160px] bg-white rounded-[12px] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.2)] border border-gray-50 p-[4px] z-[120] font-rubik"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setIsProfileMenuOpen(false);
                                                        setIsMoreMenuOpen(false);
                                                        router.push('/admin/profile');
                                                    }}
                                                    className="flex items-center gap-[10px] w-full px-[12px] py-[8px] rounded-[8px] text-[12px] font-medium text-[#18181b] hover:bg-[#f4f4f5] transition-colors"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg>
                                                    View Profile
                                                </button>
                                                <div className="h-[1px] bg-gray-50 my-[4px] mx-[8px]" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-[10px] w-full px-[12px] py-[8px] rounded-[8px] text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <motion.nav
                initial={false}
                className="pointer-events-auto relative flex h-[70px] w-full items-center justify-between bg-white px-[12px] shadow-[0_-1px_10px_0_rgba(0,0,0,0.05)] border-t border-gray-100"
                style={{
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                {/* INDICATOR LAYER */}
                <div className="absolute inset-x-0 top-0 bottom-0 px-[12px] pointer-events-none z-[1]">
                    <div className="relative w-full h-full">
                        {activeIndex !== -1 && (
                            <motion.div
                                key="nav-sliding-indicator"
                                className="absolute top-0 h-full w-[20%]"
                                initial={false}
                                animate={{ x: `${activeIndex * 100}%` }}
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                            >
                                <div className="absolute top-0 left-1/2 h-[3px] w-[30px] -translate-x-1/2 rounded-b-[10px] bg-[#18181b] z-[3]" />
                                <div
                                    className="absolute top-[8px] left-1/2 h-[38px] w-[50px] -translate-x-1/2 rounded-[12px]"
                                    style={{ background: 'linear-gradient(180deg, rgba(244,244,245,1) 0%, rgba(255,255,255,0) 100%)' }}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* INTERACTIVE LAYER */}
                {NAV_ITEMS.map((item) => {
                    const isActive = activeIndex !== -1 && NAV_ITEMS[activeIndex].label === item.label;
                    const Icon = item.icon;

                    const handleClick = (e: React.MouseEvent) => {
                        if (item.label === 'More') {
                            e.preventDefault();
                            setIsMoreMenuOpen(!isMoreMenuOpen);
                            return;
                        }

                        setIsMoreMenuOpen(false);
                        if (isActive) {
                            e.preventDefault();
                            const scrollTarget = document.querySelector('main');
                            if (scrollTarget) {
                                scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }
                    };

                    return (
                        <Link
                            key={`admin-mobile-nav-${item.label}`}
                            href={item.href}
                            prefetch={true}
                            onClick={handleClick}
                            className="relative flex h-full flex-1 basis-0 flex-col items-center justify-center gap-[6px] py-[10px] outline-none z-10 group"
                        >
                            <div className={`relative h-[22px] w-[22px] flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-107' : 'scale-100 group-active:scale-95'}`}>
                                <Icon className={`h-full w-full ${isActive ? 'text-[#18181b]' : 'text-[#71717a]'}`} />
                                {item.label === 'Orders' && newOrderCount > 0 && (
                                    <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#242424] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-white border-[1px] px-0.5">
                                        {newOrderCount}
                                    </div>
                                )}
                            </div>
                            <span className={`relative text-[10.5px] font-rubik font-medium leading-[14px] tracking-tight  transition-colors duration-200 ${isActive ? 'text-[#18181b]' : 'text-[#71717a]'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default AdminMobileNav;