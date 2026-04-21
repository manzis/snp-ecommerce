"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from './AuthContext';

interface CartContextType {
    cartCount: number;
    addToCart: () => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    addToCart: () => {},
    clearCart: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const { user, isLoading: authLoading } = useAuth();
    const cartItems = useCartStore((state) => state.items);
    const { setUserId, mergeCartOnLogin } = useCartStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Bridge Auth state to Cart Store
    useEffect(() => {
        if (authLoading || !mounted) return;

        if (user?.id) {
            mergeCartOnLogin(user.id);
        } else {
            setUserId(null);
        }
    }, [user?.id, authLoading, mounted, setUserId, mergeCartOnLogin]);


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
    return useContext(CartContext);
};

