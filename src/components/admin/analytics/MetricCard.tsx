'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: number;
}

export const MetricCard = ({ title, value, subtext, icon: Icon, trend }: MetricCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-[12px] border border-gray-100 transition-all duration-300 group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-[#bef264]/20 transition-colors">
        <Icon className="w-5 h-5 text-[#242424]" />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-sm font-normal text-[#71717a] mb-1">{title}</h3>
    <p className="text-2xl font-semibold text-[#242424] font-rubik tracking-tight">{value}</p>
    <p className="text-xs text-[#a1a1aa] mt-2 font-normal">{subtext}</p>
  </motion.div>
);
