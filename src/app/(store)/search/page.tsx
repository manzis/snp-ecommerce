'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import SearchNavbar from '@/components/search/SearchNavbar';
import FilterBar, { SelectedFilters } from '@/components/search/FilterBar';
import RecommendedBrands from '@/components/search/RecommendedBrands';
import PopularProducts from '@/components/search/PopularProducts';
import SearchResults from '@/components/search/SearchResults';
import RecentSearches from '@/components/search/RecentSearches';
import { performSearch } from '@/lib/searchLogic';

const STORAGE_KEY = 'snp_recent_searches';
const MAX_RECENT_ITEMS = 6;


import { fetchProducts, Product } from '@/services/productService';

function SearchPageContent() {
  const [query, setQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRecentSearches(JSON.parse(saved));
    
    // Fetch all products exactly once for the contextual fuzzy engine map
    fetchProducts().then(all => {
      setAllProducts(all);
      setPopularProducts(all.slice(0, 5));
    });
  }, []);

  // Utilize Omni-Search Engine natively on Client-side instead of rigid Postgres iLike
  useEffect(() => {
    if (isSearched && allProducts.length > 0) {
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        const fuzzyRankedResults = performSearch(query, allProducts);
        setProducts(fuzzyRankedResults);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [query, isSearched, allProducts]);

  /**
   * REFINED FILTER LOGIC
   * Apply multi-select filters on the resulting set from DB
   */
  const filteredResults = useMemo(() => {
    let results = [...products];

    // Filter by Category
    if (activeFilters.categories.length > 0) {
      results = results.filter(p => {
        const catName = p.categories?.name?.toLowerCase() || '';
        return activeFilters.categories.some(filterCat => catName.includes(filterCat.toLowerCase()));
      });
    }

    // Filter by Brand
    if (activeFilters.brands.length > 0) {
      results = results.filter(p => {
        const brandName = p.brands?.name?.toLowerCase() || '';
        return activeFilters.brands.some(filterBrand => brandName.includes(filterBrand.toLowerCase()));
      });
    }

    // Filter by Price Range
    if (activeFilters.price.length > 0) {
      results = results.filter(p => {
        const priceVal = parseInt(String(p.discounted_price).replace(/\D/g, ''));
        return activeFilters.price.some(range => {
          if (range === '0-1000') return priceVal < 1000;
          if (range === '1000-2000') return priceVal >= 1000 && priceVal <= 2000;
          if (range === '2000-5000') return priceVal >= 2000 && priceVal <= 5000;
          if (range === '5000+') return priceVal > 5000;
          return false;
        });
      });
    }

    return results;
  }, [products, activeFilters]);

  const handleSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    setQuery(term);
    setIsSearched(true);

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, MAX_RECENT_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecent = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#F5F5F5]">
        <div className="mx-auto w-full max-w-[1280px]">
          <SearchNavbar onSearch={handleSearch} currentQuery={query} />
          {/* FilterBar integrated with state change handler */}
          <FilterBar onFilterChange={setActiveFilters} />
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {!isSearched ? (
          /* BEFORE SEARCH STATE */
          <div className="flex flex-col">
            <RecentSearches
              items={recentSearches}
              onSearch={handleSearch}
              onClear={clearRecent}
            />
            <RecommendedBrands />
            <PopularProducts 
              products={popularProducts.map(p => ({
                id: p.id,
                brand: p.brands?.name || '',
                name: p.title,
                image: p.images?.[0] || '/images/protein.jpg'
              }))} 
            />
          </div>
        ) : (
          /* SEARCH RESULTS STATE */
          <div className="flex flex-col py-[20px]">
            <div className="px-[24px] mb-[16px]">
              <p className="font-titillium text-[14px] text-[#656565]">
                {isLoading ? 'Searching...' : (
                  filteredResults.length > 0
                    ? `Showing ${filteredResults.length} results for "${query}"`
                    : `No exact matches for "${query}". Try different filters or keywords.`
                )}
              </p>
            </div>

            {/* Component handles its own grid, pagination and product redirect */}
            {isLoading ? (
               <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#308026]"></div>
               </div>
            ) : (
              <SearchResults products={filteredResults} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"></div>}>
      <SearchPageContent />
    </Suspense>
  );
}