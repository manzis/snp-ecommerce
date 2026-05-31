'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface TopSellingSectionProps {
  topSelling: any[];
  onViewAll?: () => void;
}

export const TopSellingSection = ({ topSelling, onViewAll }: TopSellingSectionProps) => (
  <div className="space-y-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-[#242424] font-rubik tracking-tight">Top Selling Products</h2>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onViewAll}
          className="text-[11px] font-bold text-[#3f9633] hover:text-[#2d6e25] uppercase tracking-wider transition-colors px-3 py-1.5 bg-[#3f9633]/5 rounded-lg border border-[#3f9633]/10"
        >
          View All
        </button>
        <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] hidden md:block">Sales Performance</p>
      </div>
    </div>

    <div className="relative w-full">
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x subtle-scrollbar">
        {topSelling.slice(0, 10).map((item: any, i: number) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="flex flex-col gap-[10px] shrink-0 w-[180px] snap-start relative group font-rubik tracking-tight"
          >
            {/* Product Image Container */}
            <div className="h-[180px] w-full relative bg-[#f4f4f5] rounded-[20px] overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-all">
              <img 
                src={item.thumbnail || '/images/protein.webp'} 
                alt={item.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[500ms] ease-out group-hover:scale-110" 
              />
              
              {/* Sold Count Badge Overlay */}
              <div className="absolute bottom-[8px] left-[8px] z-[10] flex px-2.5 py-1.5 gap-[2px] justify-center items-baseline bg-white/90 backdrop-blur-md rounded-xl border border-white/50">
                <ShoppingBag className="w-3 h-3 text-[#242424] self-center mr-[2px]" />
                <div className="flex items-baseline text-[11px] font-bold text-[#242424]">
                  <span className="text-[#242424]/60 font-semibold mr-[1px]">{item.order_count || 0}/</span>
                  <span className="text-[#242424]">{item.sold_count || 0}</span>
                </div>
                <span className="text-[9px] text-[#242424]/60 font-medium uppercase tracking-tight ml-[2px]">Sold</span>
              </div>

              {/* Rank Badge */}
              <div className="absolute top-[8px] left-[8px] z-[10] w-6 h-6 flex items-center justify-center bg-green-600 text-white rounded-full text-[9px] font-bold">
                #{i + 1}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex px-[4px] mt-1 flex-col gap-[1px] justify-center items-start self-stretch shrink-0 relative">
              <h3 className="self-stretch text-[13px] font-[600] leading-[18px] text-[#242424] truncate group-hover:text-green-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-[9px] font-[500] text-[#a1a1aa] uppercase tracking-wider">
                Top Performer
              </p>
            </div>
          </motion.div>
        ))}
        {topSelling.length === 0 && (
          <div className="w-full py-12 text-center text-gray-400 font-medium italic bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
            No sales data available.
          </div>
        )}
      </div>
    </div>
  </div>
);
