'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import ProductPageSkeleton from '@/components/product/ProductPageSkeleton';

export default function GlobalProductLoadingOverlay() {
    const pathname = usePathname();
    const { navigatingProductSlug, setNavigatingProductSlug } = useUIStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (navigatingProductSlug) {
            setIsVisible(true);
        }
    }, [navigatingProductSlug]);

    // Clear when we reach the product page
    useEffect(() => {
        if (navigatingProductSlug && pathname === `/product/${navigatingProductSlug}`) {
            setNavigatingProductSlug(null);
            setIsVisible(false);
        }
    }, [pathname, navigatingProductSlug, setNavigatingProductSlug]);

    // Safety timeout
    useEffect(() => {
        if (navigatingProductSlug) {
            const timer = setTimeout(() => {
                setNavigatingProductSlug(null);
                setIsVisible(false);
            }, 8000); // 8 second failsafe
            return () => clearTimeout(timer);
        }
    }, [navigatingProductSlug, setNavigatingProductSlug]);

    if (!isVisible && !navigatingProductSlug) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-white overflow-hidden pointer-events-none">
            <ProductPageSkeleton />
        </div>
    );
}
