import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';

/**
 * Admin Notification Store
 * Manages the state of "unseen" orders since the last time the admin visited the orders page.
 */
interface AdminNotificationState {
    lastSeenAt: string;
    newOrderCount: number;
    setNewOrderCount: (count: number) => void;
    incrementNewOrderCount: () => void;
    markAsSeen: () => void;
    fetchInitialCount: () => Promise<void>;
}

export const useAdminNotificationStore = create<AdminNotificationState>()(
    persist(
        (set, get) => ({
            lastSeenAt: new Date(0).toISOString(),
            newOrderCount: 0,
            
            setNewOrderCount: (count) => set({ newOrderCount: count }),
            
            incrementNewOrderCount: () => set((state) => ({ 
                newOrderCount: state.newOrderCount + 1 
            })),
            
            markAsSeen: () => set({ 
                lastSeenAt: new Date().toISOString(), 
                newOrderCount: 0 
            }),

            fetchInitialCount: async () => {
                const { lastSeenAt } = get();
                
                // If it's the epoch date, we might want to just start from 'now' to avoid huge numbers on first load
                // but for a small store, a real count is fine.
                const { count, error } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .gt('created_at', lastSeenAt);
                
                if (!error && count !== null) {
                    set({ newOrderCount: count });
                }
            }
        }),
        {
            name: 'admin-notifications-v1',
        }
    )
);
