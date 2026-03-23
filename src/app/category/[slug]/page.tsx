'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProductCard from '@/components/search/SearchProductCard';
import FilterBar, { SelectedFilters } from '@/components/search/FilterBar';
import Pagination from '@/components/search/Pagination';
import InfoIcon from '@/components/icons/InfoIcon';
import { CATEGORY_THEMES } from '@/lib/CategoryThemes';

// MOCK DATA - Expansion of previous data to demonstrate pagination
const MOCK_PRODUCTS = [
  { id: 1, slug: 'omega-3-1', category: 'essentials', brand: 'Naturaltein', name: 'Omega 3 Fish Oil V1', originalPrice: 'RS. 5000', discountedPrice: 'RS. 1890', discount: '20%', rating: 4.3, image: '/images/fishoil.jpg' },
  { id: 2, slug: 'atom-whey-1', category: 'protein', brand: 'Asitis', name: 'Atom Whey Protein V1', originalPrice: 'RS. 5000', discountedPrice: 'RS. 1890', discount: '20%', rating: 4.3, image: '/images/atom-whey.jpg' },
  { id: 3, slug: 'creatine-1', category: 'creatine', brand: 'MuscleBlaze', name: 'Creatine Monohydrate', originalPrice: 'RS. 1200', discountedPrice: 'RS. 900', discount: '25%', rating: 4.5, image: '/images/magnesium.jpg' },
  { id: 4, slug: 'omega-3-2', category: 'essentials', brand: 'GNC', name: 'Triple Strength Fish Oil', originalPrice: 'RS. 3000', discountedPrice: 'RS. 2400', discount: '20%', rating: 4.2, image: '/images/fishoil.jpg' },
  { id: 5, slug: 'atom-whey-2', category: 'proteins', brand: 'Asitis', name: 'Atom Isolate Protein', originalPrice: 'RS. 7000', discountedPrice: 'RS. 5800', discount: '15%', rating: 4.7, image: '/images/atom-whey.jpg' },
  { id: 6, slug: 'creatine-2', category: 'creatine', brand: 'Asitis', name: 'Pure Creatine 250g', originalPrice: 'RS. 1000', discountedPrice: 'RS. 850', discount: '15%', rating: 4.4, image: '/images/magnesium.jpg' },
  { id: 7, slug: 'omega-3-3', category: 'essentials', brand: 'Naturaltein', name: 'Deep Sea Omega 3', originalPrice: 'RS. 4500', discountedPrice: 'RS. 3600', discount: '20%', rating: 4.6, image: '/images/fishoil.jpg' },
  { id: 8, slug: 'atom-whey-3', category: 'protein', brand: 'MuscleBlaze', name: 'Biozyme Whey Protein', originalPrice: 'RS. 6000', discountedPrice: 'RS. 4800', discount: '20%', rating: 4.5, image: '/images/atom-whey.jpg' },
  { id: 9, slug: 'creatine-3', category: 'creatine', brand: 'MuscleBlaze', name: 'Creatine HCL Powder', originalPrice: 'RS. 1500', discountedPrice: 'RS. 1300', discount: '10%', rating: 4.3, image: '/images/magnesium.jpg' },
  { id: 10, slug: 'protein-4', category: 'protein', brand: 'Naturaltein', name: 'Plant Based Protein', originalPrice: 'RS. 4000', discountedPrice: 'RS. 3200', discount: '20%', rating: 4.4, image: '/images/atom-whey.jpg' },
];

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const theme = CATEGORY_THEMES[slug] || CATEGORY_THEMES.essentials;

  // 1. STATE MANAGEMENT
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  const ITEMS_PER_PAGE = 8; // 2 cols x 4 rows

  // 2. FILTERING LOGIC
  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS.filter(p => p.category === slug);
    
    if (activeFilters.brands.length > 0) {
      list = list.filter(p => activeFilters.brands.includes(p.brand.toLowerCase()));
    }

    // Price Filtering Logic
    if (activeFilters.price.length > 0) {
      list = list.filter(p => {
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
    
    return list;
  }, [slug, activeFilters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  // 3. PAGINATION CALCULATION
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen mx-auto w-full max-w-[1280px] bg-white mt-[80px] pb-[60px]">
      {/* FIXED NAV - Animated via template.tsx */}
      <DynamicPageNav 
        title={theme.title} 
        subtitle={`${filteredProducts.length} Products`} 
      />

      <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px]">
        {/* HERO SECTION */}
        <section className="px-[24px] py-[24px]" style={{ background: theme.gradient }}>
          <h2 className="font-titillium text-[20px] font-semibold leading-[26px] tracking-[-0.8px]" style={{ color: theme.textColor }}>
            {theme.title}
          </h2>
          <p className="font-titillium text-[16px] font-normal leading-[24px] tracking-[-0.64px] text-white opacity-90">
            {theme.description}
          </p>
        </section>

        {/* BENEFITS BAR */}
        <div className="flex items-center gap-[10px] border-b border-[#f1f5f9] px-[24px] py-[20px]">
          <span className="flex-1 font-titillium text-[16px] font-semibold text-[#242424]">
            {theme.benefitLabel}
          </span>
          <button className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[#eaebf0] bg-white">
            <InfoIcon className="h-[16px] w-[16px] text-[#242424]" />
          </button>
        </div>

        {/* FILTER BAR - STICKY UNDER NAV */}
        <div className="sticky top-[81px] z-20 bg-white border-b border-[#f1f5f9]">
          <div className="flex items-center px-[24px] py-[16px]">
             <h3 className="flex-1 font-titillium text-[16px] font-semibold text-[#242424]">All Products</h3>
          </div>
          <FilterBar 
            onFilterChange={setActiveFilters} 
            visibleFilters={['Brand', 'Price']} 
          />
        </div>

        {/* PRODUCT GRID */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full border-t border-l border-[#e8e8e8]">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>

        {/* PAGINATION SECTION */}
        <div className="w-full flex justify-center bg-white border-t border-[#e8e8e8]">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[100px] px-[24px] text-center">
            <p className="font-titillium text-[16px] text-[#979797]">No products found. <br/> Try clearing filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}