'use client';

import React, { useState } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import QAFilters from '@/components/admin/qa/QAFilters';

export default function QAPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav />
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search questions..."
        onSearch={(query) => {}}
        filterDropdown={<QAFilters />}
      />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        {viewMode === 'list' ? (
          <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 text-[#71717a] font-medium">
            QA list view will appear here
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 text-[#71717a] font-medium text-xs">
                Question card {i}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
