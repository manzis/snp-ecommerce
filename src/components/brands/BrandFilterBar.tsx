'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from '@/components/icons/CaretDownIcon';
import TickIcon from '@/components/icons/TickIcon';

interface BrandFilterBarProps {
  onCategoryChange: (category: string | null) => void;
  selectedCategory: string | null;
}

const CATEGORIES = [
  { label: 'All Categories', value: null },
  { label: 'Proteins', value: 'proteins' },
  { label: 'Creatine', value: 'creatine' },
  { label: 'Multivitamins', value: 'multivitamins' },
  { label: 'Pre-Workout', value: 'preworkout' },
];

const BrandFilterBar: React.FC<BrandFilterBarProps> = ({ onCategoryChange, selectedCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="flex items-center justify-between px-[24px] py-[24px] border-t border-[#f1f5f9]">
        <span className="font-titillium text-[16px] font-semibold leading-[26px] tracking-[-0.64px] text-[#242424]">
          All Products
        </span>
        
        <div className="relative" ref={containerRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-[155px] items-center justify-center gap-[8px] rounded-[6px] border border-[#eaebf0] px-[8px] py-[8px] transition-all active:scale-95"
          >
            <span className="font-titillium text-[16px] font-normal leading-[26px] tracking-[-0.64px] text-[#979797] truncate">
              {selectedCategory ? selectedCategory.toUpperCase() : 'Sort By Category'}
            </span>
            <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
              <ChevronDownIcon className="h-[16px] w-[16px] text-[#242424]" />
            </div>
          </button>

          {isOpen && (
            <div className="absolute right-0 top-[50px] z-50 w-[160px] rounded-[8px] border border-[#eaebf0] bg-white py-2 shadow-lg">
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat.label}
                  onClick={() => { onCategoryChange(cat.value); setIsOpen(false); }}
                  className="flex items-center gap-[10px] px-[16px] py-[10px] cursor-pointer hover:bg-[#fafafa]"
                >
                  <div className={`flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border ${selectedCategory === cat.value ? 'bg-[#3F9733] border-[#3F9733]' : 'border-[#d0d5dd]'}`}>
                    {selectedCategory === cat.value && <TickIcon className="w-[8px] h-[8px] text-white" />}
                  </div>
                  <span className="font-titillium text-[14px] text-[#242424]">{cat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandFilterBar;
