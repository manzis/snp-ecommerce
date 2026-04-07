"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

interface CartContextType {
    cartCount: number;
    addToCart: () => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const cartItems = useCartStore((state) => state.items);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Real cart items total, accounting for native quantity bindings
    const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

    // Interface safety shims - core logic operates directly on Zustand now
    const addToCart = () => {};
    const clearCart = () => {};

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
