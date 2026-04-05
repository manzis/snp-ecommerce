"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartContextType {
    cartCount: number;
    addToCart: () => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    // Initial load from localStorage (optional, but good for persistence)
    useEffect(() => {
        const savedCount = localStorage.getItem('snp_cart_count');
        if (savedCount) {
            setCartCount(parseInt(savedCount, 10));
        }
    }, []);

    const addToCart = () => {
        setCartCount(prev => {
            const newCount = prev + 1;
            localStorage.setItem('snp_cart_count', newCount.toString());
            return newCount;
        });
    };

    const clearCart = () => {
        setCartCount(0);
        localStorage.removeItem('snp_cart_count');
    };

    return (
        <CartContext.Provider value={{ cartCount, addToCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
