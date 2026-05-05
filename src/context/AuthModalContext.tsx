"use client";
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface AuthModalContextType {
    isOpen: boolean;
    openLogin: (onSuccess?: () => void) => void;
    closeLogin: () => void;
    triggerLoginSuccess: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
    isOpen: false,
    openLogin: () => { },
    closeLogin: () => { },
    triggerLoginSuccess: () => { },
});

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const onSuccessRef = useRef<(() => void) | null>(null);

    const openLogin = useCallback((onSuccess?: () => void) => {
        onSuccessRef.current = onSuccess || null;
        setIsOpen(true);
    }, []);

    const closeLogin = useCallback(() => {
        setIsOpen(false);
        // Don't clear the callback here — triggerLoginSuccess may fire after close
    }, []);

    const triggerLoginSuccess = useCallback(() => {
        if (onSuccessRef.current) {
            onSuccessRef.current();
            onSuccessRef.current = null;
        }
    }, []);

    return (
        <AuthModalContext.Provider value={{ isOpen, openLogin, closeLogin, triggerLoginSuccess }}>
            {children}
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => useContext(AuthModalContext);
