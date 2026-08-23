'use client';

import React, { useEffect, useState } from 'react';
import { getStoreSettingsAction, updateStoreSettingsAction } from '@/app/actions/settingsActions';
import { toast } from 'sonner';

export default function StoreStatusToggle() {
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const result = await getStoreSettingsAction();
      if (result.success && result.data) {
        setIsLive(result.data.is_live);
      }
      setIsLoading(false);
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    const newStatus = !isLive;
    setIsLive(newStatus);
    const toastId = toast.loading('Updating store status...');
    
    const result = await updateStoreSettingsAction({ is_live: newStatus });
    
    if (result.success) {
      toast.success(newStatus ? 'Store is now LIVE!' : 'Store is now OFFLINE!', { id: toastId });
    } else {
      // Revert if failed
      setIsLive(!newStatus);
      toast.error('Failed to update store status', { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full hidden md:block"></div>;
  }

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 font-rubik tracking-tight">
      <span className="flex items-center h-[20px] text-[13.5px] font-medium text-[#71717a] leading-none pt-[1px]">
        <span className={isLive ? 'text-[#242424]' : 'text-red-500'}>{isLive ? 'LIVE' : 'OFFLINE'}</span>
      </span>
      
      <button 
        onClick={handleToggle}
        className={`relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isLive ? 'bg-[#242424]' : 'bg-gray-300'}`}
      >
        <span className="sr-only">Toggle store status</span>
        <span
          className={`pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isLive ? 'translate-x-[16px]' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
