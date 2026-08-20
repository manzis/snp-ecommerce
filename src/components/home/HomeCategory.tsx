import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
    { name: 'Proteins', slug: 'proteins', img: '/images/protein.webp' },
    { name: 'Creatine', slug: 'creatine', img: '/images/creatine.webp' },
    { name: 'Multivitamins', slug: 'multivitamins', img: '/images/vitamin.webp' },
    { name: 'Essentials', slug: 'essentials', img: '/images/essentials.webp' },
    { name: 'Accessories', slug: 'accessories', img: '/images/essentials.webp' },
];

const HomeCategories: React.FC = () => {
    return (
        <section className="mx-auto max-w-[1440px] w-full px-[24px] pt-[24px] pb-[40px] md:pt-[40px] md:pb-[64px] lg:px-[60px] lg:pt-[48px] lg:pb-[80px]">
            {/* Header */}
            <div className="mb-[24px] flex items-center justify-center md:mb-[32px]">
                <h2 className="font-rajdhani text-[22px] font-bold text-[#242424] md:text-[28px]">
                    SHOP BY <span className="text-[#308026]">CATEGORY</span>
                </h2>
            </div>

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
                                loading="lazy"
                                className="object-contain p-[12px]"
                                sizes="(max-width: 768px) 75px, (max-width: 1024px) 100px, 120px"
                            />
                        </div>
                        <span className="font-rajdhani text-[13px] font-semibold text-[#242424] md:text-[16px]">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default HomeCategories;
