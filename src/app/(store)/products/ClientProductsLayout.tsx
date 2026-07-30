'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProductCard from '@/components/home/ProductCard';
import Pagination from '@/components/search/Pagination';
import SearchIcon from '@/components/icons/SearchIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { useRef, useEffect } from 'react';

import type { Product, Category, Brand } from '@/services/productService';

interface ClientProductsLayoutProps {
    initialProducts: Product[];
    brandsData: Brand[];
    categoriesData: Category[];
}

const ClientProductsLayout: React.FC<ClientProductsLayoutProps> = ({
    initialProducts,
    brandsData,
    categoriesData
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const selectedBrand = searchParams.get('brand') || 'All Brands';
    const selectedCategory = searchParams.get('category') || 'All Categories';
    const currentPage = Number(searchParams.get('page')) || 1;

    const [isBrandsOpen, setIsBrandsOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
    const itemsPerPage = 30; // Max per page
    const initialDisplayCount = 20;

    const [visibleCount, setVisibleCount] = useState(initialDisplayCount);
    const [isRevealing, setIsRevealing] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(true);

    useEffect(() => {
        const target = searchBarRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                setIsSearchVisible(entries[0].isIntersecting);
            },
            {
                rootMargin: '-65px 0px 0px 0px' // Offset by the fixed nav height
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    // Reset visible count when filters or page change
    useEffect(() => {
        setVisibleCount(initialDisplayCount);
        setIsRevealing(false);
    }, [selectedBrand, selectedCategory, currentPage]);

    const updateUrl = (page: number, brand: string, category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) params.set('page', page.toString());
        else params.delete('page');

        if (brand !== 'All Brands') params.set('brand', brand);
        else params.delete('brand');

        if (category !== 'All Categories') params.set('category', category);
        else params.delete('category');

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const BRANDS = ['All Brands', ...brandsData.map(b => b.name)];
    const CATEGORIES = ['All Categories', ...categoriesData.map(c => c.name)];

    const filteredProducts = useMemo(() => {
        return initialProducts.filter((product) => {
            const brandName = product.brands?.name || '';
            const categoryName = product.categories?.name || '';
            const brandMatch = selectedBrand === 'All Brands' || brandName === selectedBrand;
            const categoryMatch = selectedCategory === 'All Categories' || categoryName === selectedCategory;
            return brandMatch && categoryMatch;
        });
    }, [selectedBrand, selectedCategory, initialProducts]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Products belonging to the current page
    const pageProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Products currently visible (starts at 20, up to 30)
    const displayedProducts = useMemo(() => {
        return pageProducts.slice(0, visibleCount);
    }, [pageProducts, visibleCount]);

    // Intersection Observer to load more items artificially with skeletons
    useEffect(() => {
        const target = observerRef.current;
        if (!target) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && visibleCount < pageProducts.length && !isRevealing) {
                setIsRevealing(true);
                setTimeout(() => {
                    setVisibleCount(prev => Math.min(prev + 10, itemsPerPage));
                    setIsRevealing(false);
                }, 800); // 800ms artificial delay to show skeletons
            }
        }, { threshold: 0.1 });

        observer.observe(target);
        return () => observer.disconnect();
    }, [visibleCount, pageProducts.length, isRevealing, itemsPerPage]);

    const handlePageChange = (page: number) => {
        updateUrl(page, selectedBrand, selectedCategory);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const rightContent = !isSearchVisible ? (
        <button
            onClick={() => router.push('/search?autofocus=true')}
            className="flex h-[32px] cursor-pointer items-center justify-center gap-[6px] rounded-full border border-[#e2e8f0] px-[12px] transition-colors hover:bg-[#f8f9fa] outline-none"
            aria-label="Search"
        >
            <SearchIcon className="h-[14px] w-[14px] text-[#242424]" />
            <span className="font-rajdhani text-[14px] font-semibold leading-none text-[#242424] mt-[1px]">Search</span>
        </button>
    ) : null;

    return (
        <div className="min-h-screen bg-white">
            <DynamicPageNav
                title="All Products"
                subtitle={`${filteredProducts.length} items`}
                rightContent={rightContent}
            />

            <div className="pt-[65px] animate-page-enter">
                {/* Search Header */}
                <div ref={searchBarRef} className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] pt-[20px] pb-[8px]">
                    <div
                        onClick={() => router.push('/search?autofocus=true')}
                        className="group flex w-full cursor-pointer items-center gap-[12px] rounded-full border border-[#e2e8f0] bg-[#fafafa] px-[22px] py-[12px] transition-all hover:border-[#308026] hover:bg-white md:py-[15px] md:px-[26px]"
                    >
                        <SearchIcon className="h-[20px] w-[20px] text-[#535353] transition-colors group-hover:text-[#308026]" />
                        <span className="font-rajdhani text-[15px] text-[#535353] md:text-[16px] font-medium">
                            Search for products, brands or categories...
                        </span>
                    </div>
                </div>

                {/* Filter Sections */}
                <div className="flex flex-col">
                    <div className="w-full border-b border-[#f1f5f9]">
                        <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] flex flex-col py-[8px]">
                            <div
                                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                                className="flex cursor-pointer items-center justify-between py-[12px] transition-colors hover:opacity-80"
                            >
                                <h3 className="font-rajdhani text-[16px] font-semibold text-[#242424]">Filter by Brands</h3>
                                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white transition-all">
                                    <DropDownIcon className={`h-[16px] w-[16px] text-[#242424] transition-transform duration-300 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            <>
                                {isBrandsOpen && (
                                    <div className="overflow-hidden animate-page-enter">
                                        <div className="no-scrollbar flex gap-[8px] overflow-x-auto pb-[8px] pt-[4px]">
                                            {BRANDS.map((brand) => (
                                                <button
                                                    key={`brand-filter-${brand}`}
                                                    onClick={() => updateUrl(1, brand, selectedCategory)}
                                                    className={`shrink-0 rounded-full border px-[16px] py-[6px] font-rajdhani text-[14px] transition-all ${selectedBrand === brand
                                                        ? 'border-[#308026] bg-[#308026] text-white'
                                                        : 'border-[#f1f5f9] bg-white text-[#575757] hover:border-[#308026] hover:text-[#308026]'
                                                        }`}
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        </div>
                    </div>

                    <div className="w-full border-b border-[#f1f5f9]">
                        <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] flex flex-col py-[8px] ">
                            <div
                                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                className="flex cursor-pointer items-center justify-between py-[12px] transition-colors hover:opacity-80"
                            >
                                <h3 className="font-rajdhani text-[16px] font-semibold text-[#242424]">Filter by Categories</h3>
                                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white transition-all">
                                    <DropDownIcon className={`h-[16px] w-[16px] text-[#242424] transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            <>
                                {isCategoriesOpen && (
                                    <div className="overflow-hidden animate-page-enter">
                                        <div className="no-scrollbar flex gap-[8px] overflow-x-auto pb-[8px] pt-[4px]">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={`category-filter-${cat}`}
                                                    onClick={() => updateUrl(1, selectedBrand, cat)}
                                                    className={`shrink-0 rounded-full border px-[16px] py-[6px] font-rajdhani text-[14px] transition-all ${selectedCategory === cat
                                                        ? 'border-[#308026] bg-[#308026] text-white'
                                                        : 'border-[#f1f5f9] bg-white text-[#575757] hover:border-[#308026] hover:text-[#308026]'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        </div>
                    </div>
                </div>

                <main className="mx-auto flex w-full max-w-[1440px] flex-col px-[16px] pb-[100px] pt-[32px] lg:px-[60px]">
                    {displayedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-[12px] sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:gap-[20px]">
                            {displayedProducts.map((product) => (
                                <ProductCard
                                    key={`all-products-grid-${product.slug}-${product.id}`}
                                    brand={product.brands?.name || ''}
                                    title={product.title}
                                    originalPrice={product.original_price}
                                    discountedPrice={product.discounted_price}
                                    discountPercentage={product.discount_percentage}
                                    rating={product.rating.toString()}
                                    image={product.images?.[0] || '/images/protein.webp'}
                                    slug={product.slug}
                                    stockStatus={product.stock_status}
                                />
                            ))}
                            {/* Render Skeletons while revealing more products */}
                            {isRevealing && Array.from({ length: Math.min(10, pageProducts.length - visibleCount) }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="relative flex h-[261px] w-full max-w-[199px] flex-shrink-0 flex-col items-center gap-[10px] rounded-[20px] border border-[#f2f9f1] bg-[#ffffff] p-[8px] md:max-w-full lg:h-[320px] lg:max-w-[250px] mx-auto md:mx-0">
                                    <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-[12px] bg-[#f8fcf8] animate-pulse" />
                                    
                                    <div className="flex w-full flex-shrink-0 flex-col items-start gap-[8px] rounded-[12px] bg-[#f7faf6] px-[16px] pb-[16px] pt-[8px] animate-pulse">
                                        <div className="w-1/3 h-[14px] bg-[#e8f1e7] rounded mt-[2px]" />
                                        <div className="w-full h-[20px] bg-[#e8f1e7] rounded mt-[2px]" />
                                        <div className="w-2/3 h-[22px] bg-[#e8f1e7] rounded mt-[6px]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-[100px]">
                            <p className="font-rajdhani text-[18px] text-[#838383]">No products found matching your selection.</p>
                            <button
                                onClick={() => updateUrl(1, 'All Brands', 'All Categories')}
                                className="mt-[16px] font-rajdhani text-[16px] font-semibold text-[#308026] underline underline-offset-4"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* Intersection Observer Target */}
                    <div ref={observerRef} className="h-4 w-full" />

                    {totalPages > 1 && (
                        <div className="mt-[48px]">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ClientProductsLayout;
