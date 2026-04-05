'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import RedirectIcon from '@/components/icons/RedirectIcon';

const BRANDS = [
    { name: 'Optimum Nutrition', slug: 'optimum-nutrition', logo: '/images/brands/on.png' },
    { name: 'MuscleBlaze', slug: 'muscleblaze', logo: '/images/brands/muscleblaze.png' },
    { name: 'MyProtein', slug: 'myprotein', logo: '/images/brands/muscleblaze.png' },
    { name: 'Dymatize', slug: 'dymatize', logo: '/images/brands/muscleblaze.png' },
    { name: 'MuscleTech', slug: 'muscletech', logo: '/images/brands/muscleblaze.png' },
    { name: 'GNC', slug: 'gnc', logo: '/images/brands/muscleblaze.png' },
    { name: 'Rule 1', slug: 'rule-1', logo: '/images/brands/muscleblaze.png' },
    { name: 'Cellucor', slug: 'cellucor', logo: '/images/brands/muscleblaze.png' },
    { name: 'Scivation', slug: 'scivation', logo: '/images/brands/muscleblaze.png' },
    { name: 'Ultimate Nutrition', slug: 'ultimate-nutrition', logo: '/images/brands/muscleblaze.png' },
];

const Brands: React.FC = () => {
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
                    <h2 className="font-titillium text-[20px] font-semibold tracking-[-0.8px] text-[#242424] md:text-[32px]">
                        Shop by <span className="text-[#308026]">Brands</span>
                    </h2>
                    <p className="font-titillium text-[14px] font-[400] text-[#575757] lg:text-[18px]">
                        Top premium supplement brands all in one place
                    </p>
                </div>

                <Link
                    href="/brand"
                    className="font-titillium text-[14px] font-medium text-[#308026] underline underline-offset-4 md:text-[18px]"
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
                    {BRANDS.map((brand) => (
                        <motion.div
                            key={`home-brand-list-${brand.slug}`}
                            whileHover={{ y: -8 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="shrink-0"
                        >
                            <Link
                                href={`/brand/${brand.slug}`}
                                className="group flex flex-col items-center gap-[12px] md:gap-[16px]"
                            >
                                <div className="relative flex h-[110px] w-[105px] items-center justify-center overflow-hidden rounded-[16px] border-[1.5px] border-[#f1f5f9] bg-[#fafafa] transition-all duration-300 group-hover:border-[#308026] group-hover:bg-white group-hover:shadow-lg md:h-[130px] md:w-[130px] lg:h-[180px] lg:w-[180px]">
                                    <Image
                                        src={brand.logo}
                                        alt={brand.name}
                                        fill
                                        className="object-cover p-0 transition-all duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <div className="flex items-center gap-[4px] font-titillium text-[12px] font-semibold text-[#242424] transition-colors duration-300 group-hover:text-[#308026] md:text-[15px] lg:text-[18px]">
                                    <span>{brand.name}</span>
                                    <RedirectIcon className="h-[12px] w-[12px] text-[#308026] transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:translate-x-1 lg:group-hover:opacity-100 md:h-[14px] md:w-[14px]" />
                                </div>
                            </Link>
                        </motion.div>
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
