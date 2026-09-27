'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUIContextType {
  primaryAction: (() => void) | null;
  setPrimaryAction: (action: (() => void) | null) => void;
  overrideTitle: string | null;
  setOverrideTitle: (title: string | null) => void;
  headerActionNode: ReactNode | null;
  setHeaderActionNode: (node: ReactNode | null) => void;
  showOrdersStats: boolean;
  setShowOrdersStats: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleOrdersStats: () => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [primaryAction, setPrimaryAction] = useState<(() => void) | null>(null);
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);
  const [headerActionNode, setHeaderActionNode] = useState<ReactNode | null>(null);
  const [showOrdersStats, setShowOrdersStats] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin_orders_show_stats');
      if (saved !== null) {
        setShowOrdersStats(saved === 'true');
      }
    }
  }, []);

  const toggleOrdersStats = () => {
    setShowOrdersStats((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_orders_show_stats', String(next));
      }
      return next;
    });
  };

  return (
    <AdminUIContext.Provider
      value={{
        primaryAction,
        setPrimaryAction,
        overrideTitle,
        setOverrideTitle,
        headerActionNode,
        setHeaderActionNode,
        showOrdersStats,
        setShowOrdersStats,
        toggleOrdersStats,
      }}
    >
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const context = useContext(AdminUIContext);
  if (context === undefined) {
    if (typeof window !== 'undefined') {
      console.warn("useAdminUI must be used within an AdminUIProvider. Returning dummy functions.");
    }
    return {
      primaryAction: null,
      setPrimaryAction: () => {},
      overrideTitle: null,
      setOverrideTitle: () => {},
      headerActionNode: null,
      setHeaderActionNode: () => {},
      showOrdersStats: true,
      setShowOrdersStats: () => {},
      toggleOrdersStats: () => {},
    };
  }
  return context;
}
