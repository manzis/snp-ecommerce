"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from './Toast';

type ToastType = 'success' | 'error';

interface ToastContextType {
  // Added optional description parameter
  showToast: (message: string, type: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; description?: string } | null>(null);

  const showToast = useCallback((message: string, type: ToastType, description?: string) => {
    setToast(null);
    setTimeout(() => {
      setToast({ message, type, description });
    }, 10);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <Toast 
            key={toast.message} 
            message={toast.message} 
            type={toast.type} 
            description={toast.description}
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
