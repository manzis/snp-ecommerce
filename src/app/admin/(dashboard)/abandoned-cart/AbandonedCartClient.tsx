'use client';

import React, { useState, useEffect } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import { ActiveCartsSection } from '@/components/admin/analytics/ActiveCartsSection';
import { AbandonedCheckoutsSection } from '@/components/admin/analytics/AbandonedCheckoutsSection';
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import { ShoppingCart, RefreshCcw } from 'lucide-react';
import { getAbandonedCartDataAction } from '@/app/actions/marketingActions';

interface AbandonedCartClientProps {
  initialData?: any;
}

export default function AbandonedCartClient({ initialData }: AbandonedCartClientProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [datePreset, setDatePreset] = useState('30d');

  useEffect(() => {
    setMounted(true);
    if (!initialData) {
      refreshData();
    }
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const result = await getAbandonedCartDataAction();
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-rubik overflow-hidden">
      <DynamicAdminNav />

      <AdminSubNav 
        onSearch={() => {}} 
        searchPlaceholder="Search abandoned carts..."
        searchOnLeft={true}
        onRefresh={refreshData}
        refreshLoading={loading}
        filterDropdown={
          <AnalyticsFilters 
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            onReset={() => setDatePreset('30d')}
          />
        }
      />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full mx-auto px-4 md:px-8 lg:px-10 pb-20 pt-8 no-scrollbar bg-[#FAFAFA]">
        {loading || !mounted ? (
          <div className="space-y-12 animate-pulse">
            {/* Active Carts Section Skeleton */}
            <div className="space-y-6">
              <div className="h-8 w-48 bg-gray-200 rounded-lg mx-2" />
              <div className="bg-white h-[400px] rounded-[24px] border border-gray-100" />
            </div>

            {/* Abandoned Checkouts Section Skeleton */}
            <div className="bg-white h-[600px] rounded-[24px] border border-gray-100" />

            {/* Marketing Tip Skeleton */}
            <div className="h-[180px] bg-gray-200 rounded-[24px]" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Carts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[20px] font-semibold text-[#242424] font-rubik tracking-tight">Active Carts</h2>
                <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.15em]">Live Data</span>
              </div>

              <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-100">
                <ActiveCartsSection data={data} />
              </div>
            </div>

            {/* Abandoned Checkouts Section */}
            <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-100">
              <AbandonedCheckoutsSection data={data} />
            </div>

            {/* Marketing Tip */}
            <div className="bg-[#242424] p-10 rounded-[24px] text-white relative overflow-hidden mx-auto max-w-6xl">
              <div className="relative z-10">
                <h3 className="text-xl font-semibold font-rubik mb-2 tracking-tight">Recovery Tip</h3>
                <p className="text-gray-400 text-sm max-w-2xl font-normal leading-relaxed font-rubik tracking-tight">
                  Customers often abandon carts due to unexpected shipping costs or distraction. 
                  Consider sending a gentle WhatsApp reminder or a small discount coupon to users listed above to boost your conversion rate.
                </p>
              </div>
              <ShoppingCart className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 opacity-10 rotate-12" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
