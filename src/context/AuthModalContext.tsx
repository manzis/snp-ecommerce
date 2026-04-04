"use client";
import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext({
    isOpen: false,
    openLogin: () => { },
    closeLogin: () => { },
});

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const openLogin = () => setIsOpen(true);
    const closeLogin = () => setIsOpen(false);

    return (
        <AuthModalContext.Provider value={{ isOpen, openLogin, closeLogin }}>
            {children}
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => useContext(AuthModalContext);