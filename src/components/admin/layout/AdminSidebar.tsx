'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

// Asset handling rule: Icons imported from @/components/icons/
import DashboardIcon from '@/components/icons/DashboardIcon';
import ProductsIcon from '@/components/icons/CategoryIcon';
import ChevronDownIcon from '@/components/icons/ArrowDown';
import OrdersIcon from '@/components/icons/OrdersIcon';
import CustomersIcon from '@/components/icons/CustomersIcon';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon';
import StoreSettingsIcon from '@/components/icons/StoreSettingsIcon';
import LayoutsIcon from '@/components/icons/LayoutsIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import HelpSupportIcon from '@/components/icons/HelpSupportIcon';
import BankingIcon from '@/components/icons/BankingIcon';
import PreferencesIcon from '@/components/icons/PreferencesIcon';


import { AuthService } from '@/services/auth.service';

/**
 * Static Menu Data Definitions
 * Defined outside the component to prevent re-creation and facilitate memoization.
 */

interface MenuItem {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
}

const MAIN_MENU_ITEMS: MenuItem[] = [
    { name: 'Dashboard', icon: DashboardIcon, href: '/admin/dashboard' },
];

const SECONDARY_MENU_ITEMS: MenuItem[] = [
    { name: 'Orders', icon: OrdersIcon, href: '/admin/orders' },
    { name: 'Customers', icon: CustomersIcon, href: '/admin/customers' },
    { name: 'Finance', icon: BankingIcon, href: '/admin/finance' },
];

const MORE_OPTIONS_SUB_MENU = [
    { name: 'Abandoned Carts', href: '/admin/abandoned-cart' },
    { name: 'Reviews', href: '/admin/reviews' },
    { name: 'QA', href: '/admin/qa' },
    { name: 'Coupons', href: '/admin/coupons' },
];


const STORE_MENU_ITEMS: MenuItem[] = [
    { name: 'Analytics', icon: AnalyticsIcon, href: '/admin/analytics' },
    { name: 'Layouts', icon: LayoutsIcon, href: '/admin/layouts' },
    { name: 'SEO', icon: SearchIcon, href: '/admin/seo' },
];

const SYSTEM_MENU_ITEMS: MenuItem[] = [
    { name: 'Settings', icon: SettingsIcon, href: '/admin/settings' },
    { name: 'Help&Support', icon: HelpSupportIcon, href: '/admin/support' },
];

const PRODUCT_SUB_MENU = [
    { name: 'All Products', href: '/admin/products' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Brands', href: '/admin/brands' },
];

/**
 * Memoized Sub-components
 */

const ActiveIndicator = memo(({ isCollapsed }: { isCollapsed: boolean }) => (
    <motion.div
        layoutId="activeIndicator"
        initial={isCollapsed ? { x: -10, opacity: 0 } : { opacity: 0 }}
        animate={isCollapsed ? { x: 0, opacity: 1 } : { opacity: 1 }}
        className={`absolute w-[4px] bg-black rounded-full z-50 ${isCollapsed ? 'left-[-1px] h-[16px]' : 'left-[-19px] h-[20px]'}`}
        transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
            opacity: { duration: 0.2 }
        }}
    />
));
ActiveIndicator.displayName = 'ActiveIndicator';

interface NavItemProps {
    item: MenuItem;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: (href: string) => void;
    activeStyles: string;
    inactiveStyles: string;
    badgeCount?: number;
}

const NavItem = memo(({ item, isActive, isCollapsed, onClick, activeStyles, inactiveStyles, badgeCount }: NavItemProps) => {
    const Icon = item.icon;
    return (
        <li className="w-full relative">
            <Link
                href={item.href}
                onClick={() => onClick(item.href)}
                className={`flex px-[8px] gap-[10px] items-center self-stretch border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1 ${isActive ? activeStyles : 'bg-white border-transparent ' + inactiveStyles} ${isCollapsed ? 'justify-center border-none py-[10px] rounded-[11px] overflow-hidden' : 'pl-[12px] py-[5px] rounded-[8px]'}`}
                title={isCollapsed ? item.name : ""}
                aria-current={isActive ? 'page' : undefined}
            >
                {isActive && <ActiveIndicator isCollapsed={isCollapsed} />}
                <div className="relative">
                    <Icon className={`w-[16px] h-[16px] shrink-0 transition-colors duration-200 ${isActive ? 'text-[#242424]' : 'text-[#3f3f46]'}`} />
                    {isCollapsed && badgeCount ? badgeCount > 0 && (
                        <div className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] bg-[#242424] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-white border-[1px] px-0.5" />
                    ) : null}
                </div>
                {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="font-['Rubik',_sans-serif] text-[14px] font-medium leading-[17px] truncate">{item.name}</span>
                        {badgeCount ? badgeCount > 0 && (
                            <span className="bg-[#242424] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full min-w-[20px] text-center">
                                {badgeCount}
                            </span>
                        ) : null}
                    </div>
                )}
            </Link>
        </li>
    );
});
NavItem.displayName = 'NavItem';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isProductsOpen, setIsProductsOpen] = useState(pathname.includes('/products') || pathname.includes('/categories'));
    const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(pathname.includes('/abandoned-cart') || pathname.includes('/reviews') || pathname.includes('/qa') || pathname.includes('/coupons'));
    const [optimisticActivePath, setOptimisticActivePath] = useState(pathname);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { newOrderCount } = useOrderNotifications();


    // Synchronize optimistic state with true application state
    useEffect(() => {
        setOptimisticActivePath(pathname);
        if (pathname.includes('/products') || pathname.includes('/categories')) {
            setIsProductsOpen(true);
        }
        if (pathname.includes('/abandoned-cart') || pathname.includes('/reviews') || pathname.includes('/qa') || pathname.includes('/coupons')) {
            setIsMoreOptionsOpen(true);
        }
    }, [pathname]);


    // Handlers
    const handleLinkClick = (href: string) => {
        setOptimisticActivePath(href);
        setIsProfileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await AuthService.signOut();
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    // Derived State & Styles
    const isActive = (path: string) => optimisticActivePath === path;
    const isProductsSectionActive = useMemo(() =>
        optimisticActivePath.includes('/products') || optimisticActivePath.includes('/categories'),
        [optimisticActivePath]);

    const isMoreOptionsSectionActive = useMemo(() =>
        optimisticActivePath.includes('/abandoned-cart') || optimisticActivePath.includes('/reviews') || optimisticActivePath.includes('/qa') || optimisticActivePath.includes('/coupons'),
        [optimisticActivePath]);


    const activeStyles = "bg-[#f4f4f5] rounded-[6px] border border-[#e4e4e7] text-[#242424] relative";
    const inactiveStyles = "bg-[#ffffff] border-transparent transition-all duration-200 text-[#3f3f46] hover:bg-[#f4f4f5] relative";

    return (
        <div
            className={`hidden md:flex h-screen shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[225px]'} p-[8px] relative z-[90]`}
            style={{ willChange: 'width' }}
        >
            <aside
                className={`h-full flex flex-col bg-[#ffffff]  relative transition-all duration-300 py-[4px] w-full ${isCollapsed ? 'px-[10px] rounded-[16px]' : ' rounded-[12px]'}`}
                role="navigation"
                aria-label="Admin Sidebar"
            >
                {/* Collapse Trigger Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute right-[-10px] top-[48px] w-[24px] h-[24px] rounded-full bg-white border border-[#e5e5e5] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12),0_1px_3px_-1px_rgba(0,0,0,0.08)] flex items-center justify-center z-[100] cursor-pointer hover:bg-gray-50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    aria-expanded={!isCollapsed}
                >
                    <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </div>
                </button>

                {/* Logo Area */}
                <div className={`flex flex-col w-full shrink-0 relative justify-center items-center ${isCollapsed ? '' : 'px-[8px] pb-[4px] pr-[16px]'}`}>
                    <div className={`flex flex-col gap-[3px] items-start w-full relative ${isCollapsed ? 'mb-[8px] py-[4px]' : ' py-[4px] pb-[4px]'}`}>
                        <Link
                            href="/admin"
                            className={`flex items-center -m-[2px] transition-all duration-300 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-black/10 ${isCollapsed ? 'w-[40px] h-[40px] justify-center' : 'gap-2 px-[4px] py-[6px]'}`}
                        >
                            <div className={`flex items-center justify-center shrink-0 bg-[#bef264] transition-all duration-300 ${isCollapsed ? 'w-[43px] h-[40px] rounded-[11px]' : 'w-[32px] h-[32px] rounded-[8px]'}`}>
                                <span className="font-['Rubik',_sans-serif] text-[16px] font-bold text-[#242424]">S</span>
                            </div>
                            {!isCollapsed && (
                                <div className="flex items-baseline transition-all duration-300">
                                    <span className="font-['Rubik',_sans-serif] text-[19px] font-extralight text-[#242424] tracking-tight whitespace-nowrap">SNP</span>
                                    <span className="font-['Rubik',_sans-serif] text-[19px] font-bold text-[#242424] tracking-tight whitespace-nowrap ml-[1px]">Dash</span>
                                </div>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Scrollable Navigation Area */}
                <div className={`flex-1 overflow-y-auto transition-all duration-300 scroll-smooth custom-scrollbar ${isCollapsed ? '' : 'pl-[12px] pr-[16px]'}`}>
                    <div className={`flex flex-col gap-[8px] ${isCollapsed ? 'items-center' : ''}`}>

                        {/* Main Menu Section */}
                        <nav className={`flex flex-col gap-[8px] self-stretch shrink-0 border-y border-[#e5e5e5] relative z-40 ${isCollapsed ? 'items-center py-[8px]' : 'py-[12px]'}`}>
                            {!isCollapsed && (
                                <span className="h-[14px] self-stretch font-['Rubik',_sans-serif] text-[10px] font-medium leading-[14px] text-[#71717a] tracking-[0.24px]">
                                    MAIN MENU
                                </span>
                            )}
                            <ul className={`flex flex-col gap-[5px] self-stretch shrink-0 relative ${isCollapsed ? 'items-center' : 'pl-[6px] items-stretch'}`}>
                                {MAIN_MENU_ITEMS.map(item => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={isActive(item.href)}
                                        isCollapsed={isCollapsed}
                                        onClick={handleLinkClick}
                                        activeStyles={activeStyles}
                                        inactiveStyles={inactiveStyles}
                                    />
                                ))}

                                {/* Products Interactive Item */}
                                <li className="flex flex-col gap-[8px] items-start self-stretch shrink-0 relative w-full">
                                    <button
                                        onClick={() => {
                                            if (isCollapsed) {
                                                const target = '/admin/products';
                                                router.push(target);
                                                handleLinkClick(target);
                                            } else {
                                                setIsProductsOpen(!isProductsOpen);
                                            }
                                        }}
                                        className={`flex px-[8px] gap-[10px] items-center self-stretch cursor-pointer border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${isProductsSectionActive ? activeStyles : 'bg-white border-transparent ' + inactiveStyles} w-full relative ${isCollapsed ? 'justify-center border-none py-[10px] rounded-[11px] overflow-hidden' : 'pl-[12px] py-[5px] rounded-[8px]'}`}
                                        title={isCollapsed ? "Products" : ""}
                                        aria-expanded={!isCollapsed && isProductsOpen}
                                    >
                                        {isProductsSectionActive && <ActiveIndicator isCollapsed={isCollapsed} />}
                                        <ProductsIcon className={`w-[16px] h-[16px] shrink-0 ${isProductsSectionActive ? 'text-[#242424]' : 'text-[#3f3f46]'}`} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-grow text-left font-['Rubik',_sans-serif] text-[14px] font-medium leading-[17px]">Products</span>
                                                <motion.div
                                                    animate={{ rotate: isProductsOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="shrink-0"
                                                >
                                                    <ChevronDownIcon className={`w-[12px] h-[12px] ${isProductsSectionActive ? 'text-[#242424]' : 'text-[#3f3f46]'}`} />
                                                </motion.div>
                                            </>
                                        )}
                                    </button>

                                    {!isCollapsed && (
                                        <AnimatePresence>
                                            {isProductsOpen && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    className="flex flex-col gap-[2px] justify-center items-stretch self-stretch shrink-0 relative pl-[28px] overflow-hidden"
                                                >
                                                    <div className="absolute top-[-14px] left-[14px] w-[1px] bottom-[12px] bg-[#e4e4e7] z-0"></div>
                                                    {PRODUCT_SUB_MENU.map((item) => (
                                                        <li key={item.href} className="w-full relative z-10">
                                                            <div className="absolute left-[-14px] top-[14px] w-[14px] h-[1px] bg-[#e4e4e7]"></div>
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => handleLinkClick(item.href)}
                                                                className={`flex py-[5px] px-[8px] gap-[10px] items-center self-stretch rounded-[6px] transition-all duration-200 outline-none focus-visible:bg-[#f4f4f5] relative ${isActive(item.href) ? 'bg-[#f4f4f5] text-[#242424] border-transparent' : 'bg-white border-transparent text-[#3f3f46] hover:bg-[#f4f4f5] hover:text-[#242424]'}`}
                                                            >
                                                                <span className="flex-grow font-['Rubik',_sans-serif] text-[14px] font-medium leading-[17px]">{item.name}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </li>

                                {SECONDARY_MENU_ITEMS.map(item => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={isActive(item.href)}
                                        isCollapsed={isCollapsed}
                                        onClick={handleLinkClick}
                                        activeStyles={activeStyles}
                                        inactiveStyles={inactiveStyles}
                                        badgeCount={item.name === 'Orders' ? newOrderCount : undefined}
                                    />
                                ))}

                                {/* More Options Interactive Item */}
                                <li className="flex flex-col gap-[8px] items-start self-stretch shrink-0 relative w-full">
                                    <button
                                        onClick={() => {
                                            if (isCollapsed) {
                                                const target = '/admin/abandoned-cart';
                                                router.push(target);
                                                handleLinkClick(target);
                                            } else {
                                                setIsMoreOptionsOpen(!isMoreOptionsOpen);
                                            }
                                        }}
                                        className={`flex px-[8px] gap-[10px] items-center self-stretch cursor-pointer border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${isMoreOptionsSectionActive ? activeStyles : 'bg-white border-transparent ' + inactiveStyles} w-full relative ${isCollapsed ? 'justify-center border-none py-[10px] rounded-[11px] overflow-hidden' : 'pl-[12px] py-[5px] rounded-[8px]'}`}
                                        title={isCollapsed ? "More Options" : ""}
                                        aria-expanded={!isCollapsed && isMoreOptionsOpen}
                                    >
                                        {isMoreOptionsSectionActive && <ActiveIndicator isCollapsed={isCollapsed} />}
                                        <PreferencesIcon className={`w-[16px] h-[16px] shrink-0 ${isMoreOptionsSectionActive ? 'text-[#242424]' : 'text-[#3f3f46]'}`} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-grow text-left font-['Rubik',_sans-serif] text-[14px] font-medium leading-[17px]">More Options</span>
                                                <motion.div
                                                    animate={{ rotate: isMoreOptionsOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="shrink-0"
                                                >
                                                    <ChevronDownIcon className={`w-[12px] h-[12px] ${isMoreOptionsSectionActive ? 'text-[#242424]' : 'text-[#3f3f46]'}`} />
                                                </motion.div>
                                            </>
                                        )}
                                    </button>

                                    {!isCollapsed && (
                                        <AnimatePresence>
                                            {isMoreOptionsOpen && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                                    className="flex flex-col gap-[2px] justify-center items-stretch self-stretch shrink-0 relative pl-[28px] overflow-hidden"
                                                >
                                                    <div className="absolute top-[-14px] left-[14px] w-[1px] bottom-[12px] bg-[#e4e4e7] z-0"></div>
                                                    {MORE_OPTIONS_SUB_MENU.map((item) => (
                                                        <li key={item.href} className="w-full relative z-10">
                                                            <div className="absolute left-[-14px] top-[14px] w-[14px] h-[1px] bg-[#e4e4e7]"></div>
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => handleLinkClick(item.href)}
                                                                className={`flex py-[5px] px-[8px] gap-[10px] items-center self-stretch rounded-[6px] transition-all duration-200 outline-none focus-visible:bg-[#f4f4f5] relative ${isActive(item.href) ? 'bg-[#f4f4f5] text-[#242424] border-transparent' : 'bg-white border-transparent text-[#3f3f46] hover:bg-[#f4f4f5] hover:text-[#242424]'}`}
                                                            >
                                                                <span className="flex-grow font-['Rubik',_sans-serif] text-[14px] font-medium leading-[17px]">{item.name}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </li>

                            </ul>
                        </nav>

                        {/* Stores Section content */}
                        <nav className={`flex flex-col gap-[8px] self-stretch shrink-0 relative z-30 ${isCollapsed ? 'items-center py-[6px]' : 'py-[8px]'}`}>
                            {!isCollapsed && (
                                <span className="h-[14px] self-stretch font-['Rubik',_sans-serif] text-[10px] font-medium leading-[14px] text-[#71717a] tracking-[0.24px]">
                                    STORES
                                </span>
                            )}
                            <ul className={`flex flex-col gap-[5px] self-stretch shrink-0 relative ${isCollapsed ? 'items-center' : 'pl-[6px] items-stretch'}`}>
                                {STORE_MENU_ITEMS.map(item => (
                                    <NavItem
                                        key={item.href}
                                        item={item}
                                        isActive={isActive(item.href)}
                                        isCollapsed={isCollapsed}
                                        onClick={handleLinkClick}
                                        activeStyles={activeStyles}
                                        inactiveStyles={inactiveStyles}
                                    />
                                ))}
                            </ul>
                        </nav>

                        {/* Preview Section content */}
                        <div className={`flex flex-col gap-[8px] self-stretch shrink-0 border-t border-[#e4e4e7]  ${isCollapsed ? 'items-center py-[10px]' : 'py-[12px]'}`}>
                            {!isCollapsed && (
                                <span className="h-[14px] self-stretch font-['Rubik',_sans-serif] text-[10px] font-medium leading-[14px] text-[#71717a] tracking-[0.24px] px-[8px]">
                                    PREVIEW
                                </span>
                            )}
                            <div className={`${isCollapsed ? 'px-0' : 'px-[8px]'} w-full flex ${isCollapsed ? 'justify-center' : 'items-stretch'}`}>
                                <Link
                                    href="/"
                                    target="_blank"
                                    className={`flex items-center bg-[#bef264] hover:bg-[#aee64b] border border-[#add86f] transition-colors duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-[#add86f] ${isCollapsed ? 'w-full h-[36px] justify-center rounded-[10px] overflow-hidden' : 'w-full py-[6px] px-[12px] justify-between rounded-[8px]'}`}
                                    title={isCollapsed ? "Visit Shop" : ""}
                                >
                                    {!isCollapsed && <span className="font-['Rubik',_sans-serif] text-[14px] font-medium leading-[17px] text-[#242424]">Visit Shop</span>}
                                    <ExternalLinkIcon className="w-[18px] h-[18px] text-[#242424] transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Utility Section */}
                <div className={`flex flex-col shrink-0   ${isCollapsed ? 'items-center' : 'pt-2 items-stretch p-[12px]'}`}>
                    <nav className={`flex flex-col gap-[8px] border-b border-[#e5e5e5]  self-stretch shrink-0 ${isCollapsed ? 'items-center py-[6px]' : 'py-[12px]'}`}>
                        {!isCollapsed && (
                            <span className="h-[14px] self-stretch font-['Rubik',_sans-serif] text-[10px] font-medium leading-[14px] text-[#71717a] tracking-[0.24px] px-[6px]">
                                SYSTEM
                            </span>
                        )}
                        <ul className={`flex flex-col gap-[5px] self-stretch shrink-0 relative ${isCollapsed ? 'items-center' : 'pl-[6px] items-stretch'}`}>
                            {SYSTEM_MENU_ITEMS.map(item => (
                                <NavItem
                                    key={item.href}
                                    item={item}
                                    isActive={isActive(item.href)}
                                    isCollapsed={isCollapsed}
                                    onClick={handleLinkClick}
                                    activeStyles={activeStyles}
                                    inactiveStyles={inactiveStyles}
                                />
                            ))}
                        </ul>
                    </nav>

                    {/* User Profile Area */}
                    <div className={`flex flex-col gap-[10px] shrink-0 relative pt-2  ${isCollapsed ? 'items-center p-0 py-[4px] w-full' : ' pt-[12px]'}`}>
                        <div className={`flex items-center justify-between self-stretch gap-[4px] relative ${isCollapsed ? 'flex-col gap-2' : ''}`}>
                            <Link
                                href="/admin/profile"
                                onClick={() => handleLinkClick('/admin/profile')}
                                className={`flex px-[4px] gap-[6px] items-start flex-1 -m-[2px] relative transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-black/10 ${isActive('/admin/profile') ? 'bg-[#f4f4f5]' : 'hover:bg-[#f4f4f5] hover:bg-opacity-50'} ${isCollapsed ? 'flex-none w-[40px] h-[40px] p-0 m-0 justify-center rounded-[11px] overflow-hidden' : 'rounded-[10px] py-[4px]'}`}
                                title={isCollapsed ? "Profile" : ""}
                            >
                                {isActive('/admin/profile') && <ActiveIndicator isCollapsed={isCollapsed} />}
                                <div className={`relative shrink-0 overflow-hidden bg-gray-100 ${isActive('/admin/profile') ? 'ring-1 ring-black/10' : ''} ${isCollapsed ? 'w-[40px] h-[40px] rounded-[11px]' : 'w-[31px] h-[32px] rounded-[8px]'}`}>
                                    <Image src="/images/avatar.svg" alt="Admin Profile" fill sizes="40px" className="object-cover" />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col items-start self-stretch flex-grow basis-0 min-h-0 justify-center ">
                                        <span className="h-[18px] self-stretch font-['Rubik',_sans-serif] text-[14.5px] font-medium leading-[18px] text-[#242424] truncate group-hover:text-black">Bright Nepcare</span>
                                        <span className="h-[12px] self-stretch font-['Rubik',_sans-serif] text-[9px] font-medium leading-[12px] text-[#52525b] truncate">brightnepcare@gmail.com</span>
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className={`flex items-center justify-center rounded-md transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${isProfileMenuOpen ? 'bg-[#f4f4f5] text-black' : 'text-[#71717a] hover:bg-[#f4f4f5] hover:text-black'} ${isCollapsed ? 'w-full h-[18px]' : 'w-[24px] h-[24px]'}`}
                                aria-haspopup="true"
                                aria-expanded={isProfileMenuOpen}
                            >
                                <motion.div animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}>
                                    <svg width={isCollapsed ? "14" : "16"} height={isCollapsed ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                </motion.div>
                            </button>
                        </div>

                        <AnimatePresence>
                            {isProfileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-[60]" onClick={() => setIsProfileMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className={`absolute bottom-[52px] ${isCollapsed ? 'left-0' : 'right-0'} w-48 bg-white border border-[#e4e4e7] rounded-[10px] shadow-lg z-[70] overflow-hidden p-1 flex flex-col gap-1`}
                                    >
                                        <button
                                            onClick={() => { setIsProfileMenuOpen(false); router.push('/admin/profile'); }}
                                            className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-[#242424] hover:bg-[#f4f4f5] rounded-md transition-colors text-left"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                                            Switch Account
                                        </button>
                                        <div className="h-[1px] bg-[#e4e4e7] mx-1 my-0.5" />
                                        <button
                                            onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }}
                                            className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
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
            </aside>
        </div>
    );
}
