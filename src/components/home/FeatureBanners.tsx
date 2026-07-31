import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const FeatureBanners: React.FC = () => {
    const banners = [
        {
            id: 1,
            image: '/images/banner-1.webp',
            buttonBg: 'bg-[#3f9633]',
            href: '/products'
        },
        {
            id: 2,
            image: '/images/banner-2.webp',
            buttonBg: 'bg-[#337596]',
            href: '/products'
        }
    ];

    return (
        <section className="relative mx-auto w-full bg-white py-[24px] lg:max-w-[1440px] lg:py-[40px]">
            {/* HEADER SECTION */}
            <div className="mb-[24px] flex flex-col items-center gap-[12px] px-[24px] text-center lg:mb-[48px] lg:px-0">
                <div className="inline-flex h-[32px] items-center justify-center rounded-[100px] bg-[#d5ffb2] px-[12px] py-[4px]">
                    <span className="font-rajdhani text-[14px] font-[500] leading-[24px] text-[#242424]">
                        Best Choice
                    </span>
                </div>

                <h2 className="w-full font-rajdhani text-[30px] font-bold leading-[34px] text-[#242424] lg:text-[48px] lg:leading-[54px]">
                    Everything you need<br />
                    <span className="text-[#308026]">at oneplace</span>
                </h2>

                <p className="max-w-[362px] font-rajdhani text-[16px] font-[500] leading-[22px] text-[#515151] lg:max-w-[600px] lg:text-[18px]">
                    Learns why professional trainers and fitness athletes choose us over others
                </p>
            </div>

            {/* BANNERS CONTAINER - Horizontal scroll on mobile, Grid on desktop */}
            <div className="no-scrollbar flex w-full gap-[10px] overflow-x-auto px-[24px] lg:px-[48px] lg:grid lg:grid-cols-2 lg:gap-[24px] lg:overflow-visible lg:px-0">
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className="relative h-[187px] w-[293px] shrink-0 overflow-hidden rounded-[24px] lg:rounded-[32px] lg:h-[450px] lg:w-full"
                    >
                        {/* BANNER BACKGROUND */}
                        <Image
                            src={banner.image}
                            alt="Promo Banner"
                            fill
                            loading="lazy"
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-width: 1024px) 293px, 700px"
                        />

                        {/* SHOP NOW BUTTON AREA */}
                        <div className="absolute inset-0 flex flex-col justify-end items-start p-[24px_32px_24px_32px] lg:p-[48px_48px_48px_48px]">
                            <Link
                                href={banner.href}
                                className={`${banner.buttonBg} flex h-[34px] w-[75px] lg:h-[50px] lg:w-[100px] items-center justify-center rounded-[12px] transition-all hover:brightness-110 active:scale-95`}
                            >
 <span className="font-rajdhani font-bold text-[12px] lg:text-[16px] font-[500] leading-[18px] lg:leading-[24px] text-white">
                                    shop now
                                </span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeatureBanners;
