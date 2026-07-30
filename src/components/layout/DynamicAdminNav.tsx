'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '@/components/icons/BackIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import DotsHorizontalIcon from '@/components/icons/DotsHorizontalIcon';
import NotificationIcon from '@/components/icons/NotificationIcon';
import CategoryIcon from '@/components/icons/CategoryIcon';
import BrandIcon from '@/components/icons/BrandIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import DownloadIcon from '@/components/icons/DropDownIcon';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon';
import Breadcrumb from './AdminBreadcrumb';
import Link from 'next/link';

/**
 * Mobile action menu items based on pathname.
 */
const MOBILE_ACTIONS: Record<string, { label: string; icon: any; href?: string; triggerModal?: boolean }[]> = {
    '/admin/products': [
        { label: 'Create Product', icon: PlusIcon, href: '/admin/products/add' },
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
        { label: 'Categories', icon: CategoryIcon, href: '/admin/categories' },
        { label: 'Brands', icon: BrandIcon, href: '/admin/brands' },
    ],
    '/admin/orders': [
        { label: 'Create Order', icon: PlusIcon, href: '/admin/orders/create' },
        { label: 'Export Orders', icon: SettingsIcon, href: '/admin/export/orders' },
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
    ],
    '/admin/customers': [
        { label: 'Add Customer', icon: PlusIcon, href: '/admin/customers/add' },
        { label: 'Export List', icon: SettingsIcon, href: '/admin/export/customers' },
    ],
    '/admin/reviews': [
        { label: 'Add Review', icon: PlusIcon, triggerModal: true },
        { label: 'Review Settings', icon: SettingsIcon, href: '/admin/settings/reviews' },
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
    ],
    '/admin/qa': [
        { label: 'Add QA', icon: PlusIcon, triggerModal: true },
        { label: 'QA Settings', icon: SettingsIcon, href: '/admin/settings/qa' },
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
    ],
    '/admin/finance': [
        { label: 'Export Report', icon: DownloadIcon, href: '/admin/export/finance' },
        { label: 'Audit Log', icon: SettingsIcon, href: '/admin/finance/audit' },
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
    ],
    '/admin/categories': [
        { label: 'Add Category', icon: PlusIcon, triggerModal: true },
        { label: 'Category Settings', icon: SettingsIcon, href: '/admin/settings/categories' },
    ],
    '/admin/brands': [
        { label: 'Add Brand', icon: PlusIcon, triggerModal: true },
        { label: 'Brand Settings', icon: SettingsIcon, href: '/admin/settings/brands' },
    ],
    '/admin/coupons': [
        { label: 'Add Coupon', icon: PlusIcon, triggerModal: true },
        { label: 'Coupon Settings', icon: SettingsIcon, href: '/admin/settings/coupons' },
    ],

    '/admin/sellers': [
        { label: 'Add Seller', icon: PlusIcon, triggerModal: true },
        { label: 'Seller Settings', icon: SettingsIcon, href: '/admin/settings/sellers' },
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
    ],
    'default': [
        { label: 'Notifications', icon: NotificationIcon, href: '/admin/notifications' },
        { label: 'Analytics', icon: AnalyticsIcon, href: '/admin/analytics' },
    ]
};

/**
 * Dynamic mapping for page titles based on pathname.
 */
const TITLE_MAP: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/products': 'All Products',
    '/admin/products/add': 'Add Product',
    '/admin/categories': 'Categories',
    '/admin/brands': 'Brands',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/finance': 'Finance',
    '/admin/abandoned-cart': 'Abandoned Carts',
    '/admin/reviews': 'Reviews',
    '/admin/qa': 'Question & Answers',
    '/admin/sellers': 'Sellers',
    '/admin/analytics': 'Analytics',
    '/admin/layouts': 'Layouts',
    '/admin/settings': 'System Settings',
    '/admin/support': 'Help & Support',
    '/admin/profile': 'My Profile',
    '/admin/coupons': 'Coupon Management',
    '/admin/orders/create': 'Create Manual Order',
};

/**
 * Primary desktop actions based on pathname.
 */
const PRIMARY_ACTIONS: Record<string, { label: string; href?: string; type: 'link' | 'modal' }> = {
    '/admin/products': { label: 'Add Product', href: '/admin/products/add', type: 'link' },
    '/admin/orders': { label: 'Create Order', href: '/admin/orders/create', type: 'link' },
    '/admin/customers': { label: 'Create Customer', href: '/admin/customers/add', type: 'link' },
    '/admin/finance': { label: 'Export Report', href: '/admin/export/finance', type: 'link' },
    '/admin/reviews': { label: 'Create Review', type: 'modal' },
    '/admin/qa': { label: 'Create QA', type: 'modal' },
    '/admin/categories': { label: 'Create Category', type: 'modal' },
    '/admin/brands': { label: 'Create Brand', type: 'modal' },
    '/admin/sellers': { label: 'Create Seller', type: 'modal' },
    '/admin/coupons': { label: 'Create Coupon', type: 'modal' },
};

import { useAdminUI } from '@/context/AdminUIContext';

interface DynamicAdminNavProps {
    children?: React.ReactNode;
    overrideTitle?: string;
}

const DynamicAdminNav = ({ children, overrideTitle: propOverrideTitle }: DynamicAdminNavProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { primaryAction: contextPrimaryAction, overrideTitle: contextOverrideTitle } = useAdminUI();

    // Auto-close menu on navigation
    React.useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Check if this is the global nav instance
    const isGlobalNav = !children && propOverrideTitle === undefined;

    // Hide global nav on pages that render their own custom DynamicAdminNav
    const hideGlobalNavPaths = ['/products/add', '/products/edit', '/orders/create'];
    if (isGlobalNav && hideGlobalNavPaths.some(p => pathname.includes(p))) {
        return null;
    }

    // Get actions for the current page
    const actions = MOBILE_ACTIONS[pathname] || MOBILE_ACTIONS['default'];
    const primaryAction = PRIMARY_ACTIONS[pathname];

    // Mapping for buttons based on path
    const renderActions = () => {
        return (
            <div className="flex items-center gap-2">
                {/* Desktop Primary Actions */}
                {primaryAction && (
                    primaryAction.type === 'link' ? (
                        <Link
                            href={primaryAction.href!}
                            className="hidden md:flex items-center gap-[6px] bg-[#242424] text-white pl-[10px] pr-[14px] py-[8px] rounded-full text-[13px] font-medium hover:bg-[#27272a] transition-all active:scale-[0.98]"
                        >
                            <PlusIcon className="w-[16px] h-[16px]" />
                            {primaryAction.label}
                        </Link>
                    ) : (
                        <button
                            onClick={() => contextPrimaryAction?.()}
                            className="hidden md:flex items-center gap-[6px] bg-[#242424] text-white pl-[10px] pr-[14px] py-[8px] rounded-full text-[13px] font-medium hover:bg-[#27272a] transition-all active:scale-[0.98]"
                        >
                            <PlusIcon className="w-[16px] h-[16px]" />
                            {primaryAction.label}
                        </button>
                    )
                )}

                {/* Unified Dynamic Action Menu */}
                <div className="relative flex items-center">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`p-[6px] rounded-[10px] md:rounded-[12px] transition-all duration-300 ${isMenuOpen ? 'bg-[#242424] text-white scale-105' : 'hover:bg-zinc-100 text-[#71717a]'} active:scale-[0.98] focus:outline-none`}
                        title="Options"
                    >
                        <DotsHorizontalIcon className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]" />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-[115] bg-black/0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                    }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute right-0 top-full mt-2 w-[190px] bg-white rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.1),0_0_1px_0_rgba(0,0,0,0.15)] border border-gray-50 p-1.5 z-[120] font-rubik tracking-tight"
                                >
                                    {actions.map((item) => {
                                        const Icon = item.icon;
                                        if (item.triggerModal) {
                                            return (
                                                <button
                                                    key={item.label}
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        contextPrimaryAction?.();
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-regular text-[#242424] hover:bg-zinc-100 transition-colors"
                                                >
                                                    <Icon className="w-[18px] h-[18px] text-[#71717a]" />
                                                    {item.label}
                                                </button>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href!}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl  text-[13.5px] font-regular text-[#242424] hover:bg-zinc-100 transition-colors"
                                            >
                                                <Icon className="w-[18px] h-[18px] text-[#71717a]" />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Slots for other desktop-only children */}
                {children && (
                    <div className="hidden md:flex items-center gap-2">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Find the title for the current path
    const title = TITLE_MAP[pathname] ||
        pathname.split('/').filter(Boolean).pop()?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ||
        'Admin';

    return (
        <header className={`sticky top-0 w-full shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] transition-all duration-300 ${isMenuOpen ? 'z-[150] bg-white' : 'z-[110] backdrop-blur-md bg-white/80'}`}>
            <div className="flex flex-col w-full px-[18px] md:py-[12px] py-[14px]">
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-[8px]">
                        <button
                            onClick={() => router.back()}
                            className=" rounded-[6px] md:hidden transition-colors text-[#18181b]"
                            title="Go Back"
                        >
                            <ArrowLeftIcon className="md:w-6 md:h-6 w-5 h-5" />
                        </button>
                        <div className="flex flex-col gap-[0px]">
                            <h1 className="md:text-[24px] text-[18px] font-regular text-[#242424] tracking-tight font-rubik truncate max-w-[200px] md:max-w-[400px] lg:max-w-[600px]">
                                {propOverrideTitle || contextOverrideTitle || title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {renderActions()}
                    </div>
                </div>
            </div>
        </header >
    );
};

export default DynamicAdminNav;
