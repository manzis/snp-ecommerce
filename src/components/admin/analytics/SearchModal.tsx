'use client';

import React from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

export const SearchModal = ({ isOpen, onClose, data }: SearchModalProps) => {
  const highFreq = data.slice(0, 5);
  const others = data.slice(5);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Search Trends Explorer"
      description="Visual representation of storefront search activity"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-12">
        {/* Section 1: High Frequency labels */}
        {highFreq.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] mb-4">High Frequency</h3>
            <div className="flex flex-wrap gap-2.5">
              {highFreq.map((item, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 text-[#242424] px-4 py-2 rounded-full cursor-default border border-gray-200"
                >
                  <span className="text-sm font-semibold tracking-tight">
                    {item.keyword || item.normalized_query || item.query || 'Unknown'}
                  </span>
                  <span className="text-[10px] bg-white text-gray-400 px-1.5 py-0.5 rounded-md font-bold min-w-[20px] text-center border border-gray-100">
                    {item.search_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: All Other Keywords as tags */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] mb-4">All Search Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {others.length > 0 ? others.map((item, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 bg-white text-[#71717a] px-3 py-1.5 rounded-lg border border-gray-100 hover:border-gray-300 transition-all cursor-default"
              >
                <span className="text-xs font-medium lowercase tracking-tight">
                  {item.keyword || item.normalized_query || item.query || 'Unknown'}
                </span>
                <span className="text-[9px] text-gray-400 font-bold">
                  {item.search_count}
                </span>
              </div>
            )) : highFreq.length === 0 && (
              <p className="text-left w-full text-gray-400 text-xs font-normal italic">No search data available yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminModal>
  );
};
