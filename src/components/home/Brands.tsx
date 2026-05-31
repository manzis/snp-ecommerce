'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RedirectIcon from '@/components/icons/RedirectIcon';

interface BrandProp {
    name: string;
    slug: string;
    logo: string;
}

interface BrandsProps {
    brands?: BrandProp[];
}

const Brands: React.FC<BrandsProps> = ({ brands = [] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
        }
    };

    return (
        <section className="mx-auto w-full max-w-[1440px] px-[24px] py-[32px] lg:px-[60px] lg:py-[60px] md:py-[48px] overflow-hidden">
            <div className="mb-[24px] flex items-center justify-between lg:mb-[40px]">
                <div className="flex flex-col gap-[4px] lg:gap-[8px]">
                    <h2 className="font-rajdhani text-[20px] font-bold text-[#242424] md:text-[32px]">
                        Shop by <span className="text-[#308026]">Brands</span>
                    </h2>
                    <p className="font-rajdhani text-[14px] font-[500] text-[#515151] lg:text-[18px]">
                        Top premium supplement brands all in one place
                    </p>
                </div>

                <Link
                    href="/brand"
                    className="font-rajdhani text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]"
                >
                    View All
                </Link>
            </div>

            {/* Scrollable Container */}
            <div className="relative w-full">
                <div
                    ref={scrollRef}
                    className="no-scrollbar flex gap-[12px] overflow-x-auto scroll-smooth pb-[24px] pt-[12px] md:gap-[20px] lg:gap-[24px]"
                >
                    {brands.map((brand) => (
                        <div
                            key={`home-brand-list-${brand.slug}`}
                            className="shrink-0 transition-transform duration-300 hover:translate-y-[-8px]"
                            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        >
                            <Link
                                href={`/brand/${brand.slug}`}

                                className="group flex flex-col items-center gap-[12px] md:gap-[16px]"
                            >
                                <div className="relative flex h-[105px] w-[100px] items-center justify-center overflow-hidden rounded-[16px] border-[1.5px] border-[#f1f5f9] bg-[#fafafa] transition-all duration-300 group-hover:border-[#308026] group-hover:bg-white group-hover:shadow-lg md:h-[130px] md:w-[130px] lg:h-[180px] lg:w-[180px]">
                                    <Image
                                        src={brand.logo}
                                        alt={brand.name}
                                        fill
                                        loading="lazy"
                                        sizes="(max-width: 768px) 100px, (max-width: 1024px) 130px, 180px"
                                        className="object-cover p-0 transition-all duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <div className="flex items-center gap-[4px] font-rajdhani text-[12px] font-semibold text-[#242424] transition-colors duration-300 group-hover:text-[#308026] md:text-[15px] lg:text-[18px]">
                                    <span>{brand.name}</span>
                                    <RedirectIcon className="h-[12px] w-[12px] text-[#308026] transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:translate-x-1 lg:group-hover:opacity-100 md:h-[14px] md:w-[14px]" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons - Desktop Only */}
            <div className="mt-[20px] hidden w-full items-center justify-end gap-[16px] lg:flex">
                <button
                    onClick={() => scroll('left')}
                    className="flex h-[36px] w-[36px] rotate-180 items-center justify-center rounded-full border border-[#308026] bg-white text-[#308026] transition-all hover:bg-[#308026] hover:text-white active:scale-90"
                    aria-label="Scroll Left"
                >
                    <RedirectIcon className="h-[16px] w-[16px]" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#308026] bg-white text-[#308026] transition-all hover:bg-[#308026] hover:text-white active:scale-90"
                    aria-label="Scroll Right"
                >
                    <RedirectIcon className="h-[16px] w-[16px]" />
                </button>
            </div>
        </section>
    );
};

export default Brands;
