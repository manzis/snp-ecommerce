'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
    { name: 'Proteins', slug: 'protein', img: '/images/protein.jpg' },
    { name: 'Creatine', slug: 'creatine', img: '/images/creatine.png' },
    { name: 'Multivitamins', slug: 'multivitamins', img: '/images/vitamin.png' },
    { name: 'Essentials', slug: 'Essentials', img: '/images/essentials.png' },
    { name: 'Accessories', slug: 'accessories', img: '/images/accessories.png' },
];

const HomeCategories: React.FC = () => {
    return (
        <section className="mx-auto max-w-[1440px] w-full px-[24px] py-[32px] lg:px-[60px] lg:py-[60px] md:py-[48px]">
            <div className="no-scrollbar flex items-center justify-between gap-[16px] overflow-x-auto md:gap-[32px] md:justify-center">
                {CATEGORIES.map((cat) => (
                    <Link
                        // UNIQUE PREFIX: Prevents collision with categories on other pages
                        key={`home-section-cat-${cat.slug}`}
                        href={`/category/${cat.slug}`}
                        className="group flex flex-col items-center gap-[8px] shrink-0"
                    >
                        <div className="relative h-[75px] w-[75px] rounded-[12px] border-[1.5px] border-[#f1f5f9] bg-[#fafafa] transition-all group-hover:border-[#308026] md:h-[100px] md:w-[100px] lg:w-[120px] lg:h-[120px]">
                            <Image
                                src={cat.img}
                                alt={cat.name}
                                fill
                                className="object-cover p-[12px]"
                            />
                        </div>
                        <span className="font-titillium text-[13px] font-semibold text-[#242424] md:text-[16px]">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default HomeCategories;