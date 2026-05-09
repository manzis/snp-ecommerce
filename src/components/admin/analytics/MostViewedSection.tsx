'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface MostViewedSectionProps {
  topViewed: any[];
  totalViews: number;
}

export const MostViewedSection = ({ topViewed, totalViews }: MostViewedSectionProps) => (
  <div className="space-y-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-[#242424] font-rubik tracking-tight">Most Viewed Products</h2>
      </div>
      <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] hidden md:block">Real-time Performance</p>
    </div>

    <div className="relative w-full">
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x no-scrollbar">
        {topViewed.map((item: any, i: number) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="flex flex-col gap-[10px] shrink-0 w-[180px] snap-start relative group font-rubik tracking-tight"
          >
            {/* Product Image Container */}
            <div className="h-[180px] w-full relative bg-[#f4f4f5] rounded-[20px] overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-all">
              <img 
                src={item.thumbnail || item.image_url || '/images/protein.webp'} 
                alt={item.name || item.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[500ms] ease-out group-hover:scale-110" 
              />
              
              {/* View Count Badge Overlay */}
              <div className="absolute bottom-[8px] left-[8px] z-[10] flex px-2.5 py-1.5 gap-[4px] justify-center items-center bg-white/90 backdrop-blur-md rounded-xl border border-white/50">
                <Eye className="w-3 h-3 text-[#242424]" />
                <span className="text-[11px] font-bold text-[#242424]">
                  {item.view_count || 0}
                </span>
                <span className="text-[9px] text-[#242424]/60 font-medium uppercase tracking-tight">Views</span>
              </div>

              {/* Rank Badge */}
              <div className="absolute top-[8px] left-[8px] z-[10] w-6 h-6 flex items-center justify-center bg-[#242424] text-white rounded-full text-[9px] font-bold">
                #{i + 1}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex px-[4px] mt-1 flex-col gap-[1px] justify-center items-start self-stretch shrink-0 relative">
              <h3 className="self-stretch text-[13px] font-[600] leading-[18px] text-[#242424] truncate group-hover:text-blue-600 transition-colors">
                {item.name || item.title}
              </h3>
              <p className="text-[9px] font-[400] text-[#a1a1aa] uppercase tracking-wider">
                {Math.round((item.view_count / (totalViews || 1)) * 100)}% reach
              </p>
            </div>
          </motion.div>
        ))}
        {topViewed.length === 0 && (
          <div className="w-full py-12 text-center text-gray-400 font-normal italic bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
            No trending product data available.
          </div>
        )}
      </div>
    </div>
  </div>
);
