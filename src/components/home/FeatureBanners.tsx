import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const FeatureBanners: React.FC = () => {
    const banners = [
        {
            id: 1,
            image: '/images/banner-1.png',
            buttonBg: 'bg-[#3f9633]',
            href: '/shop'
        },
        {
            id: 2,
            image: '/images/banner-2.png',
            buttonBg: 'bg-[#337596]',
            href: '/shop'
        }
    ];

    return (
        <section className="relative mx-auto w-full  bg-white py-[40px_48px] lg:max-w-[1440px]  lg:py-[64px]">
            {/* HEADER SECTION */}
            <div className="mb-[24px] flex flex-col items-center gap-[12px] px-[24px] text-center lg:mb-[48px] lg:px-0">
                <div className="inline-flex h-[32px] items-center justify-center rounded-[100px] bg-[#d5ffb2] px-[12px] py-[4px]">
                    <span className="font-titillium text-[14px] font-[400] leading-[24px] text-[#242424]">
                        Best Choice
                    </span>
                </div>

                <h2 className="w-full font-titillium text-[30px] font-[600] leading-[34px] text-[#242424] lg:text-[48px] lg:leading-[54px]">
                    Everything you need<br />
                    <span className="text-[#308026]">at oneplace</span>
                </h2>

                <p className="max-w-[362px] font-titillium text-[16px] font-[300] leading-[22px] text-[#242424] lg:max-w-[600px] lg:text-[18px]">
                    Learns whey professional trainers and fitness athletes choose us over others
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
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            sizes="(max-w-410px) 293px, 600px"
                        />

                        {/* SHOP NOW BUTTON AREA */}
                        <div className="absolute inset-0 flex flex-col justify-end items-start p-[24px_32px_24px_32px] lg:p-[48px_48px_48px_48px]">
                            <Link
                                href={banner.href}
                                className={`${banner.buttonBg} flex h-[34px] w-[75px] lg:h-[50px] lg:w-[100px] items-center justify-center rounded-[12px] transition-all hover:brightness-110 active:scale-95`}
                            >
                                <span className="font-custom text-[12px] lg:text-[16px] font-[400] leading-[18px] lg:leading-[24px] text-white">
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