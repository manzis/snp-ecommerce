'use client';

import React from 'react';
import { MousePointer2 } from 'lucide-react';

interface SearchAnalysisProps {
  trendingSearches: any[];
  onViewAll: () => void;
}

export const SearchAnalysis = ({ trendingSearches, onViewAll }: SearchAnalysisProps) => (
  <div className="bg-white p-6 rounded-[12px] border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-base font-semibold text-[#242424] font-rubik">Trending Search Terms</h3>
      <button 
        onClick={onViewAll}
        className="text-[11px] font-semibold text-[#71717a] hover:text-[#242424] flex items-center gap-1 uppercase tracking-wider"
      >
        View All <MousePointer2 className="w-3 h-3" />
      </button>
    </div>
    <div className="space-y-4">
      {trendingSearches.length > 0 ? trendingSearches.slice(0, 5).map((item, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-[10px] group hover:bg-white hover:ring-1 hover:ring-gray-100 transition-all">
          <div>
            <p className="text-sm font-semibold text-[#242424]">
              {item.keyword || item.normalized_query || item.query || item.search_term || 'Unknown Query'}
            </p>
            <p className="text-[10px] text-[#a1a1aa] font-medium">Last searched: {new Date(item.last_searched || item.last_searched_at || Date.now()).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#242424]">{item.search_count || 0}</p>
            <p className="text-[10px] text-green-600 font-semibold uppercase tracking-widest text-[9px]">Hits</p>
          </div>
        </div>
      )) : (
        <p className="text-center text-gray-400 text-xs py-4 font-medium">No trending searches recorded yet.</p>
      )}
    </div>
  </div>
);
