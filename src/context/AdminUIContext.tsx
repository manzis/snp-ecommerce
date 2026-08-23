'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminUIContextType {
  primaryAction: (() => void) | null;
  setPrimaryAction: (action: (() => void) | null) => void;
  overrideTitle: string | null;
  setOverrideTitle: (title: string | null) => void;
  headerActionNode: ReactNode | null;
  setHeaderActionNode: (node: ReactNode | null) => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [primaryAction, setPrimaryAction] = useState<(() => void) | null>(null);
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);
  const [headerActionNode, setHeaderActionNode] = useState<ReactNode | null>(null);

  return (
    <AdminUIContext.Provider value={{ primaryAction, setPrimaryAction, overrideTitle, setOverrideTitle, headerActionNode, setHeaderActionNode }}>
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
    return { primaryAction: null, setPrimaryAction: () => {}, overrideTitle: null, setOverrideTitle: () => {}, headerActionNode: null, setHeaderActionNode: () => {} };
  }
  return context;
}
