'use client';

import React, { useState, useMemo } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import OrderCard, { OrderProps } from '@/components/orders/OrderCard';
import SearchIcon from '@/components/icons/SearchIcon';
import FilterIcon from '@/components/icons/FilterIcon';
import OrderDateFilter from '@/components/orders/OrderDateFilter';

const DUMMY_ORDERS: OrderProps[] = [
    {
        id: "124575497",
        status: "CONFIRMED",
        dateText: "Arriving By Apr 22, 2026",
        brand: "ASITIS NUTRITION",
        title: "Asitis atom whey protein conctte",
        image: "/images/product.png",
        size: "2Kg",
        flavour: "Vanilla",
        extraItemsCount: 2,
        isCancellable: true,
    },
    {
        id: "124575498",
        status: "IN_TRANSIT",
        dateText: "Arriving By Apr 22, 2026",
        brand: "ASITIS NUTRITION",
        title: "Asitis atom whey protein conctte",
        image: "/images/product.png",
        size: "2Kg",
        flavour: "Vanilla",
        extraItemsCount: 2,
        isCancellable: false,
    },
    {
        id: "124575499",
        status: "DELIVERED",
        dateText: "Delivered On Apr 20, 2026",
        brand: "ASITIS NUTRITION",
        title: "Asitis atom whey protein conctte",
        image: "/images/product.png",
        size: "2Kg",
        flavour: "Vanilla",
        extraItemsCount: 0,
        isCancellable: false,
    },
    {
        id: "124575500",
        status: "CANCELLED",
        dateText: "Cancelled On Apr 18, 2026",
        brand: "ASITIS NUTRITION",
        title: "Asitis atom whey protein conctte",
        image: "/images/product.png",
        size: "2Kg",
        flavour: "Vanilla",
        extraItemsCount: 1,
        isCancellable: false,
    }
];

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [dateRange, setDateRange] = useState<{ from: Date | null, to: Date | null }>({ from: null, to: null });

    const filteredOrders = useMemo(() => {
        return DUMMY_ORDERS.filter(order => {
            const matchesSearch =
                order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.includes(searchQuery);

            return matchesSearch;
        });
    }, [searchQuery, dateRange]);

    return (
        <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[40px]">
            <DynamicPageNav title="My Orders" />

            <main className="mx-auto w-full max-w-[410px] lg:max-w-[1280px] px-0 lg:px-[24px]">

                {/* Search & Filter Header */}
                <div className="flex w-full items-center gap-[12px] bg-white lg:px-0 py-[16px] px-[24px] lg:py-[24px]">
                    {/* Search Bar - Based on products/page.tsx */}
                    <div className="group flex flex-1 items-center gap-[12px]  border-b border-[#f1f5f9]  mb-[2px] h-[48px] md:h-[56px] transition-all focus-within:border-[#308026] focus-within:bg-white">
                        <SearchIcon className="h-[20px] w-[20px] text-[#838383] transition-colors group-focus-within:text-[#308026]" />
                        <input
                            type="text"
                            placeholder="Search orders, brands or ID..."
                            className="font-titillium w-full h-full bg-transparent text-[16px] text-[#242424] outline-none placeholder:text-[#838383] md:text-[16px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Button */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center justify-center h-[48px] w-[48px] md:h-[56px] md:w-[56px] rounded-[12px]  transition-all shrink-0 ${isFilterOpen || dateRange.from ? 'border-[#308026] bg-[#f2f9f1]' : 'border-[#f1f5f9] bg-white hover:bg-gray-40 active:scale-95'}`}
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
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-[60px] col-span-1 lg:col-span-2">
                            <p className="font-titillium text-[16px] text-[#838383]">No orders found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}