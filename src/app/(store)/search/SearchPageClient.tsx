'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchNavbar from '@/components/search/SearchNavbar';
import FilterBar, { SelectedFilters } from '@/components/search/FilterBar';
import RecommendedBrands from '@/components/search/RecommendedBrands';
import PopularProducts from '@/components/search/PopularProducts';
import ExploreCategories from '@/components/search/ExploreCategories';
import SearchResults from '@/components/search/SearchResults';
import RecentSearches from '@/components/search/RecentSearches';
import { performSearch } from '@/lib/searchLogic';
import { Product, Brand, Category } from '@/services/productService';
import { recordSearchAction } from '@/app/actions/analyticsActions';
import { useSessionId } from '@/hooks/useSessionId';
import { Search } from 'lucide-react';
import PreOrderModal from '@/components/search/PreOrderModal';

interface SearchPageClientProps {
  initialProducts: Product[];
  initialBrands: Brand[];
  initialCategories: Category[];
}

const STORAGE_KEY = 'snp_recent_searches';
const MAX_RECENT_ITEMS = 6;

export default function SearchPageClient({ initialProducts, initialBrands, initialCategories }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read initial query from URL
  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  const [isSearched, setIsSearched] = useState(!!urlQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  
  const sessionId = useSessionId();
  
  // Compute initial search results synchronously on mount to avoid layout shift & enable scroll restoration
  const [products, setProducts] = useState<Product[]>(() => {
    if (urlQuery && initialProducts.length > 0) {
      return performSearch(urlQuery, initialProducts);
    }
    return [];
  });

  const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  // Track if it's the initial mount to skip debounced search on first render
  const isFirstMount = React.useRef(true);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Synchronize state when URL query changes (e.g. Back button)
  useEffect(() => {
    const newUrlQuery = searchParams.get('q') || '';
    if (newUrlQuery !== query) {
      setQuery(newUrlQuery);
      setIsSearched(!!newUrlQuery);
      // Synchronously search to prevent any footer layout shift/flicker
      if (newUrlQuery && initialProducts.length > 0) {
        setProducts(performSearch(newUrlQuery, initialProducts));
      } else {
        setProducts([]);
      }
    }
  }, [searchParams, initialProducts]);

  // Fuzzy Search Engine Logic
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
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

  const sortedCategories = useMemo(() => {
    return [...initialCategories].sort((a, b) => b.name.localeCompare(a.name));
  }, [initialCategories]);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#F5F5F5]">
        <div className="mx-auto w-full max-w-[1440px]">
          <SearchNavbar onSearch={handleSearch} currentQuery={query} initialProducts={initialProducts} />
          <FilterBar onFilterChange={setActiveFilters} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1440px] lg:px-[36px]">
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
            <ExploreCategories 
              categories={sortedCategories.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                image_url: c.image_url || undefined,
                product_count: c.product_count
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
            {isLoading ? (
              <div className="flex flex-col">
                <div className="px-[24px] mb-[16px]">
                  <p className="font-rajdhani text-[14px] text-[#656565]">Searching...</p>
                </div>
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#308026]"></div>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-[24px] mb-[16px]">
                  <p className="font-rajdhani text-[14px] text-[#656565]">
                    Showing {filteredResults.length} results for "{query}"
                  </p>
                </div>
                <SearchResults products={filteredResults} />

                {/* Pre-order Section when results are found */}
                <div className="flex justify-center w-full px-[24px] pb-[40px]">
                  <div className="mt-[24px] bg-[#F2F9F1] rounded-[16px] p-[24px] md:p-[32px] w-full max-w-[600px] text-center border border-[#e2e8f0]">
                    <h3 className="font-rajdhani font-bold text-[24px] text-[#242424] mb-[12px] tracking-[-0.5px]">
                      Didn't find what you were looking for?
                    </h3>
                    <p className="font-rajdhani text-[15px] text-[#535353] mb-[24px] leading-[24px]">
                      We import various brands on pre-order as well. Request a quotation for a pre-order now!
                    </p>
                    <button
                      onClick={() => setIsPreOrderModalOpen(true)}
                      className="h-[50px] px-[24px] bg-[#308026] hover:bg-[#25661d] active:scale-95 transition-all rounded-[12px] font-rajdhani font-bold text-[16px] text-white inline-flex items-center justify-center shadow-sm"
                    >
                      Know availability
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-[40px] px-[24px]">
                <div className="w-[80px] h-[80px] bg-[#f7faf6] rounded-full flex items-center justify-center mb-[24px]">
                  <Search className="w-[40px] h-[40px] text-[#308026]" />
                </div>
                <h2 className="font-rajdhani font-bold text-[24px] text-[#242424] text-center mb-[8px]">
                  No Products Found
                </h2>
                <p className="font-rajdhani text-[15px] text-[#656565] text-center max-w-[400px] leading-[22px]">
                  We couldn't find any exact matches for "{query}". Try checking the spelling or use different keywords.
                </p>

                {/* Pre-order Section */}
                <div className="mt-[48px] bg-[#F2F9F1] rounded-[16px] p-[24px] md:p-[32px] w-full max-w-[600px] text-center border border-[#e2e8f0]">
                  <h3 className="font-rajdhani font-bold text-[24px] text-[#242424] mb-[12px] tracking-[-0.5px]">
                    Didn't find what you were looking for?
                  </h3>
                  <p className="font-rajdhani text-[15px] text-[#535353] mb-[24px] leading-[24px]">
                    We import various brands on pre-order as well. Request a quotation for a pre-order now!
                  </p>
                  <button
                    onClick={() => setIsPreOrderModalOpen(true)}
                    className="h-[50px] px-[24px] bg-[#308026] hover:bg-[#25661d] active:scale-95 transition-all rounded-[12px] font-rajdhani font-bold text-[16px] text-white inline-flex items-center justify-center shadow-sm"
                  >
                    Know availability
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PreOrderModal
        isOpen={isPreOrderModalOpen}
        onClose={() => setIsPreOrderModalOpen(false)}
        initialProductName={query}
      />
    </div>
  );
}
