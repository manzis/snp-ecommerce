'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useUIStore } from '@/store/uiStore';

// Lazy-load below-fold / non-critical layout elements
const Footer = dynamic(() => import('@/components/layout/footer'), { ssr: false });
const HomeBottomNav = dynamic(() => import('@/components/home/HomeBottomNav'), { ssr: false });
const FloatingNav = dynamic(() => import('@/components/layout/FloatingNav'), { ssr: false });
const DynamicPageNav = dynamic(() => import('@/components/layout/DynamicPageNav'), { ssr: false });

const HIDDEN_ROUTES = ['/login', '/signup', '/forgot-password', '/checkout/success', '/pay'];

export default function ConditionalLayoutElements() {
    const pathname = usePathname();
    const { navTitle, navSubtitle, showBack, onBack } = useUIStore();
    
    // Hide footer and bottom nav on auth pages
    const isHidden = HIDDEN_ROUTES.some(route => pathname?.startsWith(route));
    const isHomePage = pathname === '/';

    if (isHidden) return null;

    return (
        <>
            {isHomePage ? (
                <FloatingNav key="global-floating-nav" showBanner={true} />
            ) : navTitle ? (
                <DynamicPageNav 
                    key="global-dynamic-nav"
                    title={navTitle}
                    subtitle={navSubtitle}
                    showBack={showBack}
                    onBack={onBack}
                />
            ) : null}
            
            <HomeBottomNav key="global-bottom-nav" />
            <Footer key="global-footer" />
        </>
    );
}
