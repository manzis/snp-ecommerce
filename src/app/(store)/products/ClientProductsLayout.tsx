'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import ProductCard from '@/components/home/ProductCard';
import Pagination from '@/components/search/Pagination';
import SearchIcon from '@/components/icons/SearchIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [currentPage, setCurrentPage] = useState(1);
    const [isBrandsOpen, setIsBrandsOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
    const itemsPerPage = 20;

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
    const displayedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white">
            <DynamicPageNav
                title="All Products"
                subtitle={`${filteredProducts.length} items`}
            />

            <div className="pt-[80px]">
                {/* Search Header */}
                <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] pt-[24px]">
                    <div
                        onClick={() => router.push('/search?autofocus=true')}
                        className="group flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] border border-[#f1f5f9] bg-[#fafafa] px-[16px] py-[12px] transition-all hover:border-[#308026] hover:bg-white md:py-[16px]"
                    >
                        <SearchIcon className="h-[20px] w-[20px] text-[#838383] transition-colors group-hover:text-[#308026]" />
                        <span className="font-titillium text-[15px] text-[#838383] md:text-[16px]">
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
                                <h3 className="font-titillium text-[16px] font-semibold text-[#242424]">Filter by Brands</h3>
                                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white transition-all">
                                    <DropDownIcon className={`h-[16px] w-[16px] text-[#242424] transition-transform duration-300 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {isBrandsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="no-scrollbar flex gap-[8px] overflow-x-auto pb-[8px] pt-[4px]">
                                            {BRANDS.map((brand) => (
                                                <button
                                                    key={`brand-filter-${brand}`}
                                                    onClick={() => {
                                                        setSelectedBrand(brand);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`shrink-0 rounded-full border px-[16px] py-[6px] font-titillium text-[14px] transition-all ${selectedBrand === brand
                                                        ? 'border-[#308026] bg-[#308026] text-white'
                                                        : 'border-[#f1f5f9] bg-white text-[#575757] hover:border-[#308026] hover:text-[#308026]'
                                                        }`}
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="w-full border-b border-[#f1f5f9]">
                        <div className="mx-auto max-w-[1440px] px-[24px] lg:px-[60px] flex flex-col py-[8px] ">
                            <div
                                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                className="flex cursor-pointer items-center justify-between py-[12px] transition-colors hover:opacity-80"
                            >
                                <h3 className="font-titillium text-[16px] font-semibold text-[#242424]">Filter by Categories</h3>
                                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white transition-all">
                                    <DropDownIcon className={`h-[16px] w-[16px] text-[#242424] transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {isCategoriesOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="no-scrollbar flex gap-[8px] overflow-x-auto pb-[8px] pt-[4px]">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={`category-filter-${cat}`}
                                                    onClick={() => {
                                                        setSelectedCategory(cat);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`shrink-0 rounded-full border px-[16px] py-[6px] font-titillium text-[14px] transition-all ${selectedCategory === cat
                                                        ? 'border-[#308026] bg-[#308026] text-white'
                                                        : 'border-[#f1f5f9] bg-white text-[#575757] hover:border-[#308026] hover:text-[#308026]'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                    image={product.images?.[0] || '/images/protein.jpg'}
                                    slug={product.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-[100px]">
                            <p className="font-titillium text-[18px] text-[#838383]">No products found matching your selection.</p>
                            <button
                                onClick={() => {
                                    setSelectedBrand('All Brands');
                                    setSelectedCategory('All Categories');
                                }}
                                className="mt-[16px] font-titillium text-[16px] font-semibold text-[#308026] underline underline-offset-4"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

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
