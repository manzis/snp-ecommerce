'use client';

import React from 'react';

interface RecentSearchesProps {
  items: string[];
  onSearch: (term: string) => void;
  onClear: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({ items, onSearch, onClear }) => {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-[12px] px-[24px] py-[20px]">
      <div className="flex items-center justify-between">
        <h3 className="font-rajdhani text-[16px] font-semibold text-[#242424]">
          Recent Searches
        </h3>
        <button 
          onClick={onClear}
          className="font-rajdhani text-[12px] text-[#656565] underline underline-offset-2"
        >
          Clear All
        </button>
      </div>
      
      {/* 2 Row Limit Logic via flex-wrap and container constraints */}
      <div className="flex flex-wrap gap-[8px] max-h-[84px] overflow-hidden">
        {items.map((item, index) => (
          <button
            key={`${item}-${index}`}
            onClick={() => onSearch(item)}
            className="rounded-[4px] bg-[#f5f5f5] px-[12px] py-[6px] font-rajdhani text-[14px] text-[#656565] active:bg-[#e8e8e8] whitespace-nowrap transition-colors border border-transparent hover:border-[#e8e8e8]"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};

export default RecentSearches;
