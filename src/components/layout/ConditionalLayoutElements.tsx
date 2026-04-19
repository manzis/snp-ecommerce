'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/footer';
import HomeBottomNav from '@/components/home/HomeBottomNav';

const HIDDEN_ROUTES = ['/login', '/signup', '/forgot-password', '/checkout/success'];

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
