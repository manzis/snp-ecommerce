'use client';

import React, { useState, useMemo, useEffect } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import OrderCard, { OrderProps } from '@/components/orders/OrderCard';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterIcon from '@/components/icons/FilterIcon';
import OrderDateFilter from '@/components/orders/OrderDateFilter';
import Pagination from '@/components/search/Pagination';

const ORDERS_PER_PAGE = 10;

interface ClientOrdersLayoutProps {
  initialOrders: OrderProps[];
}

export default function ClientOrdersLayout({ initialOrders }: ClientOrdersLayoutProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [dateRange, setDateRange] = useState<{ from: Date | null, to: Date | null }>({ from: null, to: null });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredOrders = useMemo(() => {
        return initialOrders.filter(order => {
            const matchesSearch =
                order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [initialOrders, searchQuery]);

    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
        return filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    return (
        <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[40px]">
            <DynamicPageNav title="My Orders" />

            <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px] px-0 lg:px-[24px]">
                <div className="flex w-full items-center gap-[12px] bg-white lg:px-0 pt-[16px] pb-[8px] px-[24px] lg:py-[24px]">
                    <div className="group flex flex-1 items-center gap-[12px] border-b border-[#f1f5f9] mb-[2px] h-[48px] md:h-[56px] transition-all focus-within:border-[#308026] focus-within:bg-white">
                        <SearchIcon className="h-[20px] w-[20px] text-[#838383] transition-colors group-focus-within:text-[#308026]" />
                        <input
                            type="text"
                            placeholder="Search orders, brands or ID..."
                            className="font-rajdhani w-full h-full bg-transparent text-[16px] text-[#242424] outline-none placeholder:text-[#838383] md:text-[16px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center justify-center h-[48px] w-[48px] md:h-[56px] md:w-[56px] rounded-[12px] transition-all shrink-0 ${isFilterOpen || dateRange.from ? 'border-[#308026] bg-[#f2f9f1]' : 'border-[#f1f5f9] bg-white hover:bg-gray-40 active:scale-95'}`}
                        >
                            <FilterIcon className={`h-[20px] w-[20px] md:h-[24px] md:w-[24px] transition-colors ${isFilterOpen || dateRange.from ? 'text-[#308026]' : 'text-[#242424]'}`} />
                        </button>
                        <OrderDateFilter
                            isOpen={isFilterOpen}
                            onClose={() => setIsFilterOpen(false)}
                            onApply={(from, to) => setDateRange({ from, to })}
                            initialFrom={dateRange.from}
                            initialTo={dateRange.to}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-[20px] lg:grid lg:grid-cols-2 lg:gap-[24px]">
                    {paginatedOrders.length > 0 ? (
                        paginatedOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-[60px] col-span-1 lg:col-span-2">
                            <p className="font-rajdhani text-[16px] text-[#838383]">
                                {searchQuery ? 'No orders found matching your search.' : 'You haven\'t placed any orders yet.'}
                            </p>
                            {!searchQuery && (
                                <a href="/products" className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#308026] px-[24px] text-white font-[600]">
                                    Browse Products
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {filteredOrders.length > ORDERS_PER_PAGE && (
                    <div className="mt-[20px] lg:mt-[40px]">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
