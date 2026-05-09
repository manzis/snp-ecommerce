'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchNavbar from '@/components/search/SearchNavbar';
import FilterBar, { SelectedFilters } from '@/components/search/FilterBar';
import RecommendedBrands from '@/components/search/RecommendedBrands';
import PopularProducts from '@/components/search/PopularProducts';
import SearchResults from '@/components/search/SearchResults';
import RecentSearches from '@/components/search/RecentSearches';
import { performSearch } from '@/lib/searchLogic';
import { Product, Brand } from '@/services/productService';
import { recordSearchAction } from '@/app/actions/analyticsActions';
import { useSessionId } from '@/hooks/useSessionId';

interface SearchPageClientProps {
  initialProducts: Product[];
  initialBrands: Brand[];
}

const STORAGE_KEY = 'snp_recent_searches';
const MAX_RECENT_ITEMS = 6;

export default function SearchPageClient({ initialProducts, initialBrands }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read initial query from URL
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isSearched, setIsSearched] = useState(!!searchParams.get('q'));
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sessionId = useSessionId();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Synchronize state when URL query changes (e.g. Back button)
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
      setIsSearched(!!urlQuery);
    }
  }, [searchParams]);

  // Fuzzy Search Engine Logic
  useEffect(() => {
    if (isSearched && initialProducts.length > 0) {
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        const fuzzyRankedResults = performSearch(query, initialProducts);
        setProducts(fuzzyRankedResults);
        setIsLoading(false);
      }, 100); // Shorter debounce for "instant" feel

      return () => clearTimeout(timer);
    } else if (!isSearched) {
      setProducts([]);
    }
  }, [query, isSearched, initialProducts]);

  const filteredResults = useMemo(() => {
    let results = [...products];

    if (activeFilters.categories.length > 0) {
      results = results.filter(p => {
        const catName = p.categories?.name?.toLowerCase() || '';
        return activeFilters.categories.some(filterCat => catName.includes(filterCat.toLowerCase()));
      });
    }

    if (activeFilters.brands.length > 0) {
      results = results.filter(p => {
        const brandName = p.brands?.name?.toLowerCase() || '';
        return activeFilters.brands.some(filterBrand => brandName.includes(filterBrand.toLowerCase()));
      });
    }

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
    if (!term) {
      router.push('/search');
      setQuery('');
      setIsSearched(false);
      return;
    }

    // Update URL to persist state
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setQuery(term);
    setIsSearched(true);

    // Record search for analytics (non-blocking)
    recordSearchAction(term, filteredResults.length, sessionId || undefined).catch(err => console.error('Failed to record search:', err));

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

  const popularProducts = useMemo(() => initialProducts.slice(0, 5), [initialProducts]);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#F5F5F5]">
        <div className="mx-auto w-full max-w-[1280px]">
          <SearchNavbar onSearch={handleSearch} currentQuery={query} initialProducts={initialProducts} />
          <FilterBar onFilterChange={setActiveFilters} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {!isSearched ? (
          <div className="flex flex-col">
            <RecentSearches
              items={recentSearches}
              onSearch={handleSearch}
              onClear={clearRecent}
            />
            <RecommendedBrands 
              brands={initialBrands.slice(0, 8).map(b => ({
                id: b.id,
                name: b.name,
                image: b.image_url || '/images/brands/muscleblaze.png',
                slug: b.slug
              }))} 
            />
            <PopularProducts 
              products={popularProducts.map(p => ({
                id: p.id,
                brand: p.brands?.name || '',
                name: p.title,
                image: p.images?.[0] || '/images/protein.webp',
                slug: p.slug
              }))} 
            />
          </div>
        ) : (
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
