'use client';

import React, { useState, useRef, useEffect } from 'react';
import FilterIcon from '@/components/icons/FilterIcon';
import ChevronDownIcon from '@/components/icons/CaretDownIcon';
import TickIcon from '@/components/icons/TickIcon';

export interface SelectedFilters {
  categories: string[];
  brands: string[];
  price: string[];
}

type FilterType = 'Category' | 'Brand' | 'Price';

interface FilterBarProps {
  onFilterChange: (filters: SelectedFilters) => void;
  visibleFilters?: FilterType[]; // Controlled visibility
}

const LABEL_TO_KEY: Record<string, keyof SelectedFilters> = {
  Category: 'categories',
  Brand: 'brands',
  Price: 'price',
};

const FILTER_DATA = {
  Category: [
    { label: 'Protein', value: 'protein' },
    { label: 'Creatine', value: 'creatine' },
    { label: 'Multivitamin', value: 'multivitamin' },
    { label: 'Fish Oil', value: 'fishoil' },
    { label: 'Pre-Workout & Energy', value: 'preworkout' },
  ],
  Brand: [
    { label: 'MuscleBlaze', value: 'muscleblaze' },
    { label: 'Asitis Nutrition', value: 'asitis' },
    { label: 'Naturaltein', value: 'naturaltein' },
    { label: 'Optimum Nutrition', value: 'on' },
    { label: 'GNC', value: 'gnc' },
    { label: 'Dymatize', value: 'dymatize' },
  ],
  Price: [
    { label: '< RS. 1000', value: '0-1000' },
    { label: 'RS. 1000 - 2000', value: '1000-2000' },
    { label: 'RS. 2000 - 5000', value: '2000-5000' },
    { label: '> RS. 5000', value: '5000+' },
  ],
};

const FilterBar: React.FC<FilterBarProps> = ({ 
  onFilterChange, 
  visibleFilters = ['Category', 'Brand', 'Price'] 
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (type: keyof SelectedFilters, value: string) => {
    const current = selected[type];
    const isSelected = current.includes(value);
    const updated = isSelected 
      ? current.filter(i => i !== value) 
      : [...current, value];
    
    const newFilters = { ...selected, [type]: updated };
    setSelected(newFilters);
    onFilterChange(newFilters);
  };

  const renderDropdown = (label: string) => {
    if (activeDropdown !== label) return null;

    const type = LABEL_TO_KEY[label];
    const options = FILTER_DATA[label as keyof typeof FILTER_DATA];

    return (
      <div className="absolute top-[50px] left-0 right-0 z-[30] flex flex-col bg-white border border-[#eaebf0] rounded-[6px] shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="max-h-[220px] overflow-y-auto no-scrollbar py-1">
          {options.map((opt) => {
            const isChecked = selected[type].includes(opt.value);
            return (
              <div 
                key={opt.value}
                onClick={() => toggleOption(type, opt.value)}
                className="flex items-start gap-[10px] px-[12px] py-[10px] cursor-pointer hover:bg-[#fafafa] transition-colors border-b last:border-0 border-[#f5f5f5]"
              >
                {/* Tick Box UI */}
                <div className={`mt-[1px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[3px] border transition-all duration-200 
                  ${isChecked ? 'bg-[#3F9733] border-[#3F9733]' : 'bg-white border-[#d0d5dd]'}`}
                >
                  {isChecked && <TickIcon className="w-[8px] h-[8px] text-white" />}
                </div>
                {/* Text Wrap logic */}
                <span className={`flex-1 font-titillium text-[13px] leading-[16px] tracking-[-0.1px] break-words
                  ${isChecked ? 'font-semibold text-[#242424]' : 'font-normal text-[#656565]'}`}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative flex w-full flex-col bg-white border-t border-[#f1f5f9] lg:px-[60px]">
      <div className="flex w-full items-center h-[44px]">
        {/* Main Filter Icon */}
        <div className="flex w-[36px] shrink-0 items-center justify-center pl-[4px]">
          <FilterIcon className="h-[14px] w-[14px] text-[#242424]" />
        </div>

        {/* Dynamic Buttons Container */}
        <div className="flex flex-1 items-center border-l border-[#f1f5f9] h-full">
          {visibleFilters.map((label, idx) => {
            const type = LABEL_TO_KEY[label];
            const isOpen = activeDropdown === label;
            const hasSelection = selected[type].length > 0;

            return (
              <div key={label} className="relative flex-1 h-full">
                <button 
                  onClick={() => setActiveDropdown(isOpen ? null : label)}
                  className={`flex h-full w-full items-center justify-center gap-[4px] px-[4px] transition-colors outline-none
                    ${idx !== visibleFilters.length - 1 ? 'border-r border-[#f1f5f9]' : ''}
                    ${isOpen ? 'bg-[#fafbfc]' : 'bg-white'}`}
                >
                  <span className={`font-titillium text-[13px] font-semibold tracking-[-0.2px] truncate max-w-[75px]
                    ${hasSelection ? 'text-[#3F9733]' : 'text-[#242424]'}`}
                  >
                    {hasSelection ? `${label} (${selected[type].length})` : label}
                  </span>
                  <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDownIcon className="h-[12px] w-[12px] text-[#242424] opacity-70" />
                  </div>
                </button>
                {renderDropdown(label)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
