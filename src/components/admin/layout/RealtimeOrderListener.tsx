'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdminNotificationStore } from '@/store/adminNotificationStore';

/**
 * RealtimeOrderListener Component
 * This component should be rendered ONCE in the admin layout.
 * It handles the initialization of order counts and the real-time subscription.
 */
export default function RealtimeOrderListener() {
    const { fetchInitialCount, incrementNewOrderCount } = useAdminNotificationStore();

    useEffect(() => {
        // 1. Fetch initial count on mount
        fetchInitialCount();

        // 2. Setup real-time subscription for NEW orders
        // Use a unique channel id to avoid collisions if multiple instances accidentally mount
        const channelId = `admin-order-notifications-${Math.random().toString(36).substring(7)}`;
        const channel = supabase
            .channel(channelId)
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'orders' }, 
                () => {
                    incrementNewOrderCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchInitialCount, incrementNewOrderCount]);

    return null; // This component doesn't render anything
}
