'use client';

import React from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';

export const MarketingPanel = () => (
  <div className="bg-[#242424] p-8 rounded-[12px] text-white overflow-hidden relative">
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4 text-[#bef264]">
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold tracking-widest uppercase">Marketing Engine</span>
      </div>
      <h3 className="text-2xl font-semibold font-rubik mb-2">Bulk WhatsApp Marketing</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-md font-medium">Reach your customers instantly with high-conversion templates.</p>
      
      <div className="flex flex-wrap gap-4">
        <button className="bg-[#bef264] text-[#242424] px-6 py-3 rounded-[10px] font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
          New Campaign
        </button>
        <button className="bg-white/10 text-white px-6 py-3 rounded-[10px] font-semibold text-sm hover:bg-white/20 transition-all">
          Manage Templates
        </button>
      </div>
    </div>
    <div className="absolute -right-10 -bottom-10 opacity-10">
      <ShoppingBag className="w-64 h-64" />
    </div>
  </div>
);
