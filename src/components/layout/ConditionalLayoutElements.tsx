'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy-load below-fold / non-critical layout elements
const Footer = dynamic(() => import('@/components/layout/footer'), { ssr: false });
const HomeBottomNav = dynamic(() => import('@/components/home/HomeBottomNav'), { ssr: false });

const HIDDEN_ROUTES = ['/login', '/signup', '/forgot-password', '/checkout/success', '/pay'];

export default function ConditionalLayoutElements() {
    const pathname = usePathname();
    
    // Hide footer and bottom nav on auth pages
    const isHidden = HIDDEN_ROUTES.some(route => pathname?.startsWith(route));

    if (isHidden) return null;

    return (
        <>
            <HomeBottomNav key="global-bottom-nav" />
            <Footer key="global-footer" />
        </>
    );
}
