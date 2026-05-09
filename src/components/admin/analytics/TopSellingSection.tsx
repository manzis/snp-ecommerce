'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp } from 'lucide-react';

interface TopSellingSectionProps {
  topSelling: any[];
  totalOrders: number;
}

export const TopSellingSection = ({ topSelling, totalOrders }: TopSellingSectionProps) => (
  <div className="space-y-6 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-[#242424] font-rubik tracking-tight">Top Selling Products</h2>
      </div>
      <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] hidden md:block">Sales Performance</p>
    </div>

    <div className="relative w-full">
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x no-scrollbar">
        {topSelling.map((item: any, i: number) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="flex flex-col gap-[10px] shrink-0 w-[180px] snap-start relative group font-rubik tracking-tight"
          >
            {/* Product Image Container */}
            <div className="h-[180px] w-full relative bg-[#f4f4f5] rounded-[20px] overflow-hidden border border-gray-100 group-hover:border-gray-200 transition-all">
              <img 
                src={item.image_url || '/images/protein.webp'} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[500ms] ease-out group-hover:scale-110" 
              />
              
              {/* Sales Count Badge Overlay */}
              <div className="absolute bottom-[8px] left-[8px] z-[10] flex px-2.5 py-1.5 gap-[4px] justify-center items-center bg-white/90 backdrop-blur-md rounded-xl border border-white/50">
                <ShoppingBag className="w-3 h-3 text-[#242424]" />
                <span className="text-[11px] font-bold text-[#242424]">
                  {item.order_count || 0}
                </span>
                <span className="text-[9px] text-[#242424]/60 font-medium uppercase tracking-tight">Orders</span>
              </div>

              {/* Rank Badge */}
              <div className="absolute top-[8px] left-[8px] z-[10] w-6 h-6 flex items-center justify-center bg-[#bef264] text-[#242424] rounded-full text-[9px] font-bold border border-[#242424]/10">
                #{i + 1}
              </div>

              {/* Profit Indicator */}
              <div className="absolute top-[8px] right-[8px] z-[10] flex px-2 py-1 gap-1 items-center bg-[#242424] rounded-full">
                 <TrendingUp className="w-2.5 h-2.5 text-[#bef264]" />
                 <span className="text-[8px] font-bold text-white uppercase">HOT</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex px-[4px] mt-1 flex-col gap-[1px] justify-center items-start self-stretch shrink-0 relative">
              <h3 className="self-stretch text-[13px] font-[600] leading-[18px] text-[#242424] truncate group-hover:text-[#3f9633] transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center justify-between w-full">
                <p className="text-[9px] font-[400] text-[#a1a1aa] uppercase tracking-wider">
                  {item.quantity} units moved
                </p>
                <p className="text-[10px] font-bold text-[#242424]">
                  रु {item.price?.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        {topSelling.length === 0 && (
          <div className="w-full py-12 text-center text-gray-400 font-normal italic bg-gray-50 rounded-[24px] border border-dashed border-gray-200">
            No sales data recorded yet.
          </div>
        )}
      </div>
    </div>
  </div>
);
