"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AdminToast, AdminToastType } from './AdminToast';

interface AdminToastContextType {
    showAdminToast: (message: string, type?: AdminToastType) => void;
}

const AdminToastContext = createContext<AdminToastContextType | undefined>(undefined);

export const AdminToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<{ message: string; type: AdminToastType } | null>(null);

    const showAdminToast = useCallback((message: string, type: AdminToastType = 'info') => {
        setToast(null); // Clear existing
        // Small timeout to allow re-render animation if triggering while one already exists
        setTimeout(() => {
            setToast({ message, type });
        }, 10);
    }, []);

    return (
        <AdminToastContext.Provider value={{ showAdminToast }}>
            {children}
            {toast && (
                <AdminToast
                    key={toast.message + Date.now()} // Force re-render key
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </AdminToastContext.Provider>
    );
};

export const useAdminToast = () => {
    const context = useContext(AdminToastContext);
    if (!context) {
        if (typeof window !== 'undefined') {
            console.warn("useAdminToast must be used within an AdminToastProvider. Returning dummy functions.");
        }
        return { showAdminToast: () => {} };
    }
    return context;
};
