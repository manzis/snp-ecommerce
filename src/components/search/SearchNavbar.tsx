'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChevronLeftIcon from '@/components/icons/BackIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import SearchCloseIcon from '@/components/icons/SearchCloseIcon';
import SearchSuggestions from './SearchSuggestion';
import { getAutocorrectSuggestion } from '@/lib/searchUtils';

const PRODUCT_DATABASE = [
  "Asitis Atom Whey Protein",
  "Asitis Atom Whey Protein Concentrate",
  "Asitis Creatine Monohydrate",
  "Asitis Fish Oil",
  "Atom Whey Protein 1kg",
  "MuscleBlaze Biozyme Whey",
  "Optimum Nutrition Gold Standard",
  "Naturaltein Whey Protein",
  "Ultimate Nutrition Prostar"
];

interface SearchNavbarProps {
  onSearch: (term: string) => void;
  currentQuery: string;
}

const SearchNavbar: React.FC<SearchNavbarProps> = ({ onSearch, currentQuery }) => {
  const [inputValue, setInputValue] = useState(currentQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const autofocus = searchParams.get('autofocus');

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (autofocus === 'true' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [autofocus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const q = inputValue.toLowerCase().trim();
    if (!q) return [];

    const results: string[] = [];
    
    // 1. Check for Autocorrect (Priority 1)
    const corrected = getAutocorrectSuggestion(q, PRODUCT_DATABASE);
    if (corrected && corrected !== q) {
      results.push(corrected);
    }

    // 2. Filter DB matches
    const matches = PRODUCT_DATABASE.filter(item => 
      item.toLowerCase().includes(q) || (corrected && item.toLowerCase().includes(corrected))
    ).sort((a, b) => {
      const aStart = a.toLowerCase().startsWith(q);
      const bStart = b.toLowerCase().startsWith(q);
      if (aStart && !bStart) return -1;
      return 1;
    });

    // Combine and deduplicate
    const finalSet = new Set([...results, ...matches]);
    return Array.from(finalSet).slice(0, 8); // Max 8 suggestions
  }, [inputValue]);

  const handleAction = (term: string) => {
    setInputValue(term);
    setShowSuggestions(false);
    onSearch(term);
  };

  return (
    <nav ref={containerRef} className="relative flex h-[81px] w-full items-center bg-white px-[24px] py-[16px] ">
      <button onClick={() => router.back()} type="button" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[5px] active:scale-95 transition-transform">
        <ChevronLeftIcon className="h-[24px] w-[24px] text-[#242424]" />
      </button>

      <div className="ml-[10px] flex h-[49px] flex-1 items-center overflow-hidden rounded-[100px] border border-[#e8e8e8] bg-white transition-all focus-within:border-[1.5px] focus-within:border-[#242424] focus-within:shadow-[0px_0px_0px_3px_#F3F3F3]">
        <div className="flex flex-1 items-center gap-[4px] px-[12px] relative">
          <SearchIcon className="h-[22px] w-[22px] shrink-0 text-[#bebebe]" />
          <input
            ref={inputRef} 
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction(inputValue)}
            placeholder="Ex: Whey Protein Atom"
            className="w-full bg-transparent font-titillium text-[18px] font-normal tracking-[-0.72px] outline-none text-[#242424] placeholder:text-[#bebebe]"
            style={{
              background: 'linear-gradient(48.47deg, #bebebe, #020202)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: inputValue ? 'inherit' : 'transparent'
            }}
          />
          {inputValue && (
            <button onClick={() => { setInputValue(''); inputRef.current?.focus(); }} type="button" className="flex h-[20px] w-[20px] shrink-0 items-center justify-center">
              <SearchCloseIcon className="text-[#242424]" />
            </button>
          )}
        </div>
        <button onClick={() => handleAction(inputValue)} type="button" className="flex h-full w-[67px] items-center justify-center bg-[#242424] rounded-[2px] active:opacity-90">
          <span className="font-titillium text-[12px] font-semibold tracking-[-0.48px] text-white">Search</span>
        </button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <SearchSuggestions 
          suggestions={filteredSuggestions} 
          query={inputValue} 
          onSelect={handleAction} 
        />
      )}
    </nav>
  );
};

export default SearchNavbar;