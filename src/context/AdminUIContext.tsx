'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminUIContextType {
  primaryAction: (() => void) | null;
  setPrimaryAction: (action: (() => void) | null) => void;
  overrideTitle: string | null;
  setOverrideTitle: (title: string | null) => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export function AdminUIProvider({ children }: { children: ReactNode }) {
  const [primaryAction, setPrimaryAction] = useState<(() => void) | null>(null);
  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);

  return (
    <AdminUIContext.Provider value={{ primaryAction, setPrimaryAction, overrideTitle, setOverrideTitle }}>
      {children}
    </AdminUIContext.Provider>
  );
}

export function useAdminUI() {
  const context = useContext(AdminUIContext);
  if (context === undefined) {
    throw new Error('useAdminUI must be used within an AdminUIProvider');
  }
  return context;
}
