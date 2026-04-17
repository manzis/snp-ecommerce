'use client';

import { useState, useEffect } from 'react';
import { useAdminNotificationStore } from '@/store/adminNotificationStore';

/**
 * Hook to consume real-time order notifications state from the global store.
 * Use this in UI components like Sidebar and MobileNav to display badges.
 */
export function useOrderNotifications() {
    const store = useAdminNotificationStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Manually check if the store has hydrated its persisted state
        const checkHydration = () => {
            if (useAdminNotificationStore.persist.hasHydrated()) {
                setIsHydrated(true);
            }
        };

        checkHydration();

        // Subscribe to hydration finishing
        const unsub = useAdminNotificationStore.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });

        return () => unsub();
    }, []);

    return {
        ...store,
        isHydrated
    };
}
