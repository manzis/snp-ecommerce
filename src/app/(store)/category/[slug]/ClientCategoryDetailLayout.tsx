'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProductCard from '@/components/search/SearchProductCard';
import FilterBar, { SelectedFilters } from '@/components/search/FilterBar';
import Pagination from '@/components/search/Pagination';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { CATEGORY_THEMES } from '@/lib/CategoryThemes';
import { Category, Product } from '@/services/productService';
import { useUIStore } from '@/store/uiStore';

interface ClientCategoryDetailLayoutProps {
  slug: string;
  initialProducts: Product[];
  categoryMetadata: Category | null;
}

export default function ClientCategoryDetailLayout({
  slug,
  initialProducts,
  categoryMetadata,
}: ClientCategoryDetailLayoutProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isBenefitsExpanded, setIsBenefitsExpanded] = useState(false);
  const setNavData = useUIStore(state => state.setNavData);
  const [activeFilters, setActiveFilters] = useState<SelectedFilters>({
    categories: [],
    brands: [],
    price: [],
  });

  const theme = useMemo(() => {
    const normalizedSlug = slug.toLowerCase();
    return CATEGORY_THEMES[normalizedSlug] ||
      CATEGORY_THEMES[normalizedSlug.replace(/s$/, '')] ||
      CATEGORY_THEMES[normalizedSlug + 's'] ||
      CATEGORY_THEMES.essentials;
  }, [slug]);

  const ITEMS_PER_PAGE = 8;

  const filteredProducts = useMemo(() => {
    let list = initialProducts;
    if (activeFilters.brands.length > 0) {
      list = list.filter(p => activeFilters.brands.includes(p.brands?.name?.toLowerCase() || ''));
    }
    if (activeFilters.price.length > 0) {
      list = list.filter(p => {
        const priceVal = typeof p.discounted_price === 'number' ? p.discounted_price : parseInt(String(p.discounted_price).replace(/\D/g, ''));
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
  }, [initialProducts, activeFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  // Set navigation data on mount, reset on unmount
  useEffect(() => {
    setNavData({
      navTitle: categoryMetadata?.name || theme.title,
      navSubtitle: `${filteredProducts.length} Products`,
      showBack: true,
      onBack: undefined
    });
    return () => setNavData({ navTitle: '', navSubtitle: undefined });
  }, [categoryMetadata?.name, theme.title, filteredProducts.length, setNavData]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen mx-auto w-full max-w-[1440px] bg-white mt-[80px] pb-[60px]">

      <main className="mx-auto w-full max-w-[410px] lg:px-[48px] lg:max-w-[1440px]">
        <section className="px-[24px] py-[24px]" style={{ background: theme.gradient }}>
          <h2 className="font-titillium text-[20px] font-semibold leading-[26px] tracking-[-0.8px]" style={{ color: theme.textColor }}>
            {categoryMetadata?.name || theme.title}
          </h2>
          <p className="font-titillium text-[16px] font-normal leading-[24px] tracking-[-0.64px] text-white opacity-90">
            {categoryMetadata?.description || theme.description}
          </p>
        </section>

        <div className="border-b border-[#f1f5f9] bg-white">
          <button
            onClick={() => setIsBenefitsExpanded(!isBenefitsExpanded)}
            className="flex w-full items-center gap-[10px] px-[24px] py-[20px] text-left hover:bg-gray-50 transition-colors"
          >
            <span className="flex-1 font-titillium text-[16px] font-semibold text-[#242424]">
              Benefits of {categoryMetadata?.name || theme.title}
            </span>
            <motion.div
              animate={{ rotate: isBenefitsExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] border border-[#eaebf0] bg-white"
            >
              <DropDownIcon className="h-[16px] w-[16px] text-[#242424]" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isBenefitsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-[24px] pb-[20px]">
                  <p className="font-titillium text-[14px] leading-[22px] text-[#4b5563] py-[16px]">
                    {categoryMetadata?.benefits || theme.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sticky top-[81px] z-20 bg-white border-b border-[#f1f5f9]">
          <div className="flex items-center px-[24px] py-[16px]">
            <h3 className="flex-1 font-titillium text-[16px] font-semibold text-[#242424]">All Products</h3>
          </div>
          <FilterBar
            onFilterChange={setActiveFilters}
            visibleFilters={['Brand', 'Price']}
          />
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 w-full border-l border-[#e8e8e8]">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </section>

        <div className="w-full flex justify-center bg-white border-[#e8e8e8]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-[100px] px-[24px] text-center bg-white border-t border-[#e8e8e8]">
            <div className="w-[64px] h-[64px] bg-[#f9fafb] rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <p className="font-titillium text-[18px] font-semibold text-[#242424] mb-2">No Products Available</p>
            <p className="font-titillium text-[14px] text-[#71717a] mb-8">Go back and check other brands or categories.</p>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-[#242424] text-white rounded-full text-[14px] font-medium hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
            >
              Go Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
