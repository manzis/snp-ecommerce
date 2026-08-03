'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';

import HomeBottomNav from '@/components/home/HomeBottomNav';
import FloatingNav from '@/components/layout/FloatingNav';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import GlobalProductLoadingOverlay from '@/components/layout/GlobalProductLoadingOverlay';

// Lazy-load below-fold / non-critical layout elements
// Footer & FloatingNav must SSR so Googlebot can see internal links (products, brands, policies)
const Footer = dynamic(() => import('@/components/layout/footer'));
// These are interactive-only — safe to skip SSR
const CartSidebar = dynamic(() => import('@/components/cart/CartSidebar'), { ssr: false });


const HIDDEN_ROUTES = ['/login', '/signup', '/forgot-password', '/checkout/success', '/pay'];

export default function ConditionalLayoutElements() {
    const pathname = usePathname();
    const { navTitle, navSubtitle, showBack, onBack } = useUIStore();

    // Global interceptor for all /cart links to ensure the sidebar opens on desktop
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (window.innerWidth < 1024) return;
            
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');
            
            if (anchor && anchor.getAttribute('href') === '/cart') {
                e.preventDefault();
                e.stopPropagation();
                useCartStore.getState().setCartOpen(true);
            }
        };

        document.addEventListener('click', handleGlobalClick, { capture: true });
        return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
    }, []);

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
            <CartSidebar key="global-cart-sidebar" />
            <GlobalProductLoadingOverlay key="global-product-loading" />
        </>
    );
}
