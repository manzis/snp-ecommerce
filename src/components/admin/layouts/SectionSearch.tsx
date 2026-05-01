'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, fetchBasicProducts } from '@/services/productService';
import Image from 'next/image';

interface SectionSearchProps {
  onSelectProduct: (product: Product) => void;
}

const SectionSearch: React.FC<SectionSearchProps> = ({ onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partial<Product>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const data = await fetchBasicProducts({ search: query });
      setResults(data.slice(0, 5));
      setIsLoading(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search products to add..."
          className="w-full px-[16px] py-[10px] pl-[40px] border border-[#e8e8e8] rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-black/5"
        />
        <svg className="absolute left-[12px] top-[12px] w-[16px] h-[16px] text-[#bebebe]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#e8e8e8] rounded-[8px] shadow-lg z-[50] overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-[12px] text-[#bebebe]">Searching...</div>
          ) : (
            <ul className="flex flex-col">
              {results.map(product => (
                <li 
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product as Product);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-[12px] px-[16px] py-[8px] hover:bg-gray-50 cursor-pointer border-b border-[#f1f5f9] last:border-0"
                >
                  <div className="relative w-[32px] h-[32px] shrink-0 border border-[#f1f5f9] rounded-[4px] overflow-hidden">
                    <Image 
                      src={product.images?.[0] || '/images/protein.jpg'} 
                      alt={product.name || ''} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-medium text-[#242424] truncate">{product.title}</span>
                    <span className="text-[10px] text-[#bebebe] uppercase">{product.brands?.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionSearch;
