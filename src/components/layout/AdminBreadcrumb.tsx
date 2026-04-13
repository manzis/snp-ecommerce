'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RightArrowIcon from '@/components/icons/RightBackIcon';

/**
 * Route Hierarchy Map
 * Maps paths to their breadcrumb trails based on AdminSidebar.tsx
 */
const ROUTE_MAP: Record<string, string[]> = {
    '/admin/dashboard': ['Home', 'Dashboard'],
    '/admin/products': ['Home', 'Products', 'All Products'],
    '/admin/categories': ['Home', 'Products', 'Categories'],
    '/admin/brands': ['Home', 'Products', 'Brands'],
    '/admin/orders': ['Home', 'Orders'],
    '/admin/customers': ['Home', 'Customers'],
    '/admin/finance': ['Home', 'Finance'],
    '/admin/abandoned-cart': ['Home', 'More Options', 'Abandoned Carts'],
    '/admin/reviews': ['Home', 'More Options', 'Reviews'],
    '/admin/qa': ['Home', 'More Options', 'QA'],
    '/admin/settings/store': ['Home', 'Stores', 'Store Settings'],
    '/admin/layouts': ['Home', 'Stores', 'Layouts'],
    '/admin/settings': ['Home', 'System', 'Settings'],
    '/admin/support': ['Home', 'System', 'Help & Support'],
    '/admin/profile': ['Home', 'System', 'Profile'],
};

/**
 * Helper to get the href for a breadcrumb segment based on the sidebar logic
 */
const getSegmentHref = (segment: string, currentPath: string): string => {
    switch (segment) {
        case 'Home': return '/admin/dashboard';
        case 'Dashboard': return '/admin/dashboard';
        case 'Products': return '/admin/products';
        case 'More Options': return '/admin/abandoned-cart';
        case 'Stores': return '/admin/settings/store';
        case 'System': return '/admin/settings';
        default:
            // If it matches a route in the map, use that
            const reverseMatch = Object.entries(ROUTE_MAP).find(([key, crumbs]) => crumbs[crumbs.length - 1] === segment);
            return reverseMatch ? reverseMatch[0] : currentPath;
    }
};

const Breadcrumb = () => {
    const pathname = usePathname();

    // Find the best matching route trail
    const matchedKey = Object.keys(ROUTE_MAP)
        .sort((a, b) => b.length - a.length)
        .find(key => pathname.startsWith(key));

    let crumbs = matchedKey ? [...ROUTE_MAP[matchedKey]] : [];

    // Handle dynamic extra segments (e.g., /admin/products/add-product -> Home / Products / All Products / Add Product)
    if (matchedKey && pathname !== matchedKey) {
        const extra = pathname.replace(matchedKey, '').split('/').filter(Boolean);
        extra.forEach(seg => {
            const formatted = seg.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            crumbs.push(formatted);
        });
    } else if (!matchedKey) {
        // Fallback for completely unmapped paths
        const segments = pathname.split('/').filter(Boolean);
        crumbs = ['Home', ...segments.filter(s => s !== 'admin' && s !== 'dashboard')].map(seg =>
            seg === 'Home' ? seg : seg.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        );
    }

    if (crumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center gap-[2px] flex-wrap">
                {crumbs.map((name, index) => {
                    const isLast = index === crumbs.length - 1;
                    const href = getSegmentHref(name, pathname);

                    return (
                        <React.Fragment key={`${name}-${index}`}>
                            {index > 0 && (
                                <li className="flex items-center text-[#d4d4d8] pointer-events-none">
                                    <RightArrowIcon className="w-3 h-3" />
                                </li>
                            )}
                            <li className="flex items-center">
                                {isLast ? (
                                    <span className="text-[11px] font-regular tracking-[-0.02em] uppercase text-[#242424] font-['Rubik',_sans-serif] px-1 select-none">
                                        {name}
                                    </span>
                                ) : (
                                    <Link
                                        href={href}
                                        className="text-[11px] font-regular uppercase text-[#71717a] hover:text-[#242424] transition-colors p-1 px-[6px] rounded-md hover:bg-[#f4f4f5]"
                                    >
                                        {name}
                                    </Link>
                                )}
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
