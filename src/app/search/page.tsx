'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SearchNavbar from '@/components/search/SearchNavbar';
import FilterBar, { SelectedFilters } from '@/components/search/FilterBar';
import RecommendedBrands from '@/components/search/RecommendedBrands';
import PopularProducts from '@/components/search/PopularProducts';
import SearchResults from '@/components/search/SearchResults';
import RecentSearches from '@/components/search/RecentSearches';
import { performSearch } from '@/lib/searchLogic';

const STORAGE_KEY = 'snp_recent_searches';
const MAX_RECENT_ITEMS = 6; 

/**
 * UPDATED MOCK DATA
 * Added 'category' field to support the filtering logic.
 */
const MOCK_PRODUCTS = [
  { id: 1, slug: 'omega-3-fish-oil-triple-strength', category: 'fishoil', brand: 'Naturaltein', name: 'Omega 3 Fish Oil - Triple Strength', originalPrice: 'RS. 5000', discountedPrice: 'RS. 1890', discount: '20%', rating: 4.3, image: '/images/fishoil.jpg', description: 'High quality EPA/DHA' },
  { id: 2, slug: 'atom-whey-protein-concentrate', category: 'protein', brand: 'Asitis', name: 'Atom Whey Protein Concentrate', originalPrice: 'RS. 5000', discountedPrice: 'RS. 1890', discount: '20%', rating: 4.3, image: '/images/atom-whey.jpg', description: 'Pure protein for muscle gain' },
  { id: 3, slug: 'biozyme-performance-whey-protein', category: 'protein', brand: 'MuscleBlaze', name: 'Biozyme Performance Whey Protein', originalPrice: 'RS. 6500', discountedPrice: 'RS. 4200', discount: '35%', rating: 4.5, image: '/images/magnesium.jpg', description: 'Enhanced absorption formula' },
  { id: 4, slug: 'gold-standard-100-whey', category: 'protein', brand: 'Optimum Nutrition', name: 'Gold Standard 100% Whey', originalPrice: 'RS. 8000', discountedPrice: 'RS. 7200', discount: '10%', rating: 4.8, image: '/images/atom-whey.jpg', description: 'Worlds best selling protein' },
  { id: 5, slug: 'creatine-monohydrate-powder', category: 'creatine', brand: 'Asitis', name: 'Creatine Monohydrate Powder', originalPrice: 'RS. 1200', discountedPrice: 'RS. 900', discount: '25%', rating: 4.2, image: '/images/magnesium.jpg', description: 'Increase strength and power' },
  { id: 6, slug: 'plant-based-vegan-protein', category: 'protein', brand: 'Naturaltein', name: 'Plant Based Vegan Protein', originalPrice: 'RS. 4500', discountedPrice: 'RS. 3800', discount: '15%', rating: 4.4, image: '/images/fishoil.jpg', description: 'Pea and rice protein blend' },
  { id: 7, slug: 'prostar-100-whey-protein', category: 'protein', brand: 'Ultimate Nutrition', name: 'Prostar 100% Whey Protein', originalPrice: 'RS. 7000', discountedPrice: 'RS. 5500', discount: '21%', rating: 4.1, image: '/images/atom-whey.jpg', description: 'Imported high quality whey' },
  { id: 8, slug: 'creatine-hcl-max-strength', category: 'creatine', brand: 'MuscleBlaze', name: 'Creatine HCL - Max Strength', originalPrice: 'RS. 1800', discountedPrice: 'RS. 1500', discount: '16%', rating: 4.6, image: '/images/magnesium.jpg', description: 'Advanced creatine formula' },
  { id: 9, slug: 'mega-men-multi-vitamin', category: 'multivitamin', brand: 'GNC', name: 'Mega Men Multi-Vitamin', originalPrice: 'RS. 2500', discountedPrice: 'RS. 1990', discount: '20%', rating: 4.5, image: '/images/fishoil.jpg', description: 'Complete daily nutrition' },
  { id: 10, slug: 'impact-whey-isolate', category: 'protein', brand: 'MyProtein', name: 'Impact Whey Isolate', originalPrice: 'RS. 9000', discountedPrice: 'RS. 7500', discount: '16%', rating: 4.7, image: '/images/atom-whey.jpg', description: 'Premium isolate protein' },
  { id: 11, slug: 'iso-100-hydrolyzed-whey', category: 'protein', brand: 'Dymatize', name: 'ISO 100 Hydrolyzed Whey', originalPrice: 'RS. 11000', discountedPrice: 'RS. 9800', discount: '12%', rating: 4.9, image: '/images/atom-whey.jpg', description: 'Fastest absorbing protein' },
  { id: 12, slug: 'r1-protein-isolate-blend', category: 'protein', brand: 'Rule 1', name: 'R1 Protein Isolate Blend', originalPrice: 'RS. 8500', discountedPrice: 'RS. 6900', discount: '18%', rating: 4.6, image: '/images/atom-whey.jpg', description: 'Clean protein isolate' },
  { id: 13, slug: 'c4-original-pre-workout', category: 'preworkout', brand: 'Cellucor', name: 'C4 Original Pre-Workout', originalPrice: 'RS. 3500', discountedPrice: 'RS. 2800', discount: '20%', rating: 4.3, image: '/images/magnesium.jpg', description: 'Explosive energy' },
  { id: 14, slug: 'syntha-6-ultra-premium-whey', category: 'protein', brand: 'BSN', name: 'Syntha-6 Ultra Premium Whey', originalPrice: 'RS. 7500', discountedPrice: 'RS. 6200', discount: '17%', rating: 4.4, image: '/images/atom-whey.jpg', description: 'The best tasting protein' },
  { id: 15, slug: 'bulk-pre-workout-powder', category: 'preworkout', brand: 'Transparent Labs', name: 'Bulk Pre-Workout Powder', originalPrice: 'RS. 5000', discountedPrice: 'RS. 4500', discount: '10%', rating: 4.7, image: '/images/magnesium.jpg', description: 'Clinically dosed preworkout' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  // Initial load of recent searches
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  /**
   * REFINED SEARCH + FILTER LOGIC
   * 1. Perform weighted token search
   * 2. Apply multi-select filters on the resulting set
   */
  const filteredResults = useMemo(() => {
    let results = performSearch(query, MOCK_PRODUCTS);

    // Filter by Category
    if (activeFilters.categories.length > 0) {
      results = results.filter(p => activeFilters.categories.includes(p.category.toLowerCase()));
    }

    // Filter by Brand
    if (activeFilters.brands.length > 0) {
      results = results.filter(p => activeFilters.brands.includes(p.brand.toLowerCase()));
    }

    // Filter by Price Range
    if (activeFilters.price.length > 0) {
      results = results.filter(p => {
        const priceVal = parseInt(p.discountedPrice.replace(/\D/g, ''));
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
  }, [query, activeFilters]);

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
            <PopularProducts />
          </div>
        ) : (
          /* SEARCH RESULTS STATE */
          <div className="flex flex-col py-[20px]">
            <div className="px-[24px] mb-[16px]">
              <p className="font-titillium text-[14px] text-[#656565]">
                {filteredResults.length > 0 
                  ? `Showing ${filteredResults.length} results for "${query}"`
                  : `No exact matches for "${query}". Try different filters or keywords.`}
              </p>
            </div>
            
            {/* Component handles its own grid, pagination and product redirect */}
            <SearchResults products={filteredResults} />
          </div>
        )}
      </main>
    </div>
  );
}