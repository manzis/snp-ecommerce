import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowRightIcon from '@/components/icons/RedirectIcon';
import TodaysDeals from './TodaysDeals';

interface HomeHeroProps {
    deals?: any[]; // Using any[] to match the Deal interface used in TodaysDeals
}

const HomeHero: React.FC<HomeHeroProps> = ({ deals = [] }) => {
    return (
        <section className="relative w-full overflow-hidden bg-white">
            <div className="relative mx-auto flex h-[656px] w-full items-end md:rounded-br-[32px] lg:rounded-none lg:h-[820px]">

                {/* BACKGROUND IMAGE & OVERLAYS */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero.webp"
                        alt="Fitness Essentials Hero"
                        fill
                        priority
                        className="object-cover md:rounded-br-[32px] lg:rounded-none"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        quality={60}
                        fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-[#000000]/20 to-transparent md:rounded-br-[32px] lg:rounded-none" />
                </div>

                {/* CONTENT AREA */}
                <div className="relative z-[1] flex w-full flex-col items-start gap-[16px] lg:gap-[24px] px-[24px] pb-[32px]  lg:px-[60px] lg:pb-[100px] lg:mx-auto lg:max-w-[1440px]">

                    {/* BADGE: BROAD SELECTION */}
                    <div className="flex h-[34px] w-[119px] items-center justify-center gap-[10px] rounded-[100px] bg-[linear-gradient(252.04deg,#e8f5e7,#cdffc6)] px-[10px] py-[6px]">
                        <span className="font-titillium text-[16px] font-[300] leading-[22px] tracking-[-0.32px] text-[#242424] whitespace-nowrap">
                            Broad selection
                        </span>
                    </div>

                    {/* HEADING SECTION */}
                    <div className="flex flex-col gap-[8px] self-stretch lg:gap-[16px]">
                        <div className="flex flex-col gap-[4px]">
                            <h1 className="max-w-[362px] lg:max-w-[600px] font-custom text-[36px] font-normal leading-[50px]  tracking-[-0.36px] bg-clip-text text-transparent bg-[linear-gradient(144.63deg,#c4ffbc,#ffffff)]  lg:text-[50px] lg:leading-[70px] lg:tracking-[-1px]">
                                The best place for your all fitness essentials
                            </h1>
                        </div>

                        {/* SUB-TEXT */}
                        <p className="font-titillium text-[16px] font-[300] leading-[22px] tracking-[-0.32px] text-[#ffffff] [text-shadow:0_1px_3px_rgba(16,24,40,0.1)] lg:text-[20px]">
                            Only Quality & Premium Supplements
                        </p>
                    </div>

                    {/* CTA BUTTON */}
                    <Link
                        href="/search"
                        className="group flex h-[48px] w-[126px] items-center justify-center gap-[10px] rounded-[12px] bg-[#419f34] px-[16px] py-[12px] shadow-[0_1px_3px_0_rgba(16,24,40,0.1)] transition-transform duration-200 active:scale-95"
                    >
                        <span className="font-custom text-[16px] font-normal leading-[24px] text-[#ffffff] whitespace-nowrap">
                            shop now
                        </span>
                        <div className="flex h-[16px] w-[16px] items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                            <ArrowRightIcon className="w-full h-full text-white" />
                        </div>
                    </Link>

                    {/* DESKTOP WIDGET: TODAYS DEALS */}
                    <div className="hidden  lg:absolute lg:right-[64px] lg:bottom-[80px]">
                        <TodaysDeals isHeroWidget={true} deals={deals} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeHero;
