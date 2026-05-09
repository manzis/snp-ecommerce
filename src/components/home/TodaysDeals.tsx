import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { optimizeImage } from '@/lib/optimizeImage';

interface Deal {
    id: string;
    brand: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
    discount: string;
    image: string;
}

interface TodaysDealsProps {
    isHeroWidget?: boolean;
    deals?: Deal[];
}

const TodaysDeals: React.FC<TodaysDealsProps> = ({ isHeroWidget = false, deals = [] }) => {
    // If no deals provided, don't render or show placeholder
    if (deals.length === 0) return null;
    
    // Ensure we have at least 3 deals for the layout, otherwise repeat or slice
    const displayDeals = deals.length >= 3 ? deals : [...deals, ...deals, ...deals].slice(0, 3);
    return (
        <section
            className={`relative mx-auto w-full bg-[linear-gradient(180deg,#eaffe8,#d6ff9c)]  
            ${isHeroWidget
                    ? 'hidden lg:flex flex-col w-[410px] rounded-[32px] p-[24px] shadow-2xl'
                    : 'lg:hidden pb-[24px] pt-[40px] rounded-b-[48px]'
                }`}
        >
            {/* 
                FIXED SHIMMER EFFECT: 
                In Next.js App Router, global styles in components are restricted. 
                Using standard <style> tag with keyframes for reliability.
            */}
            <style>{`
                @keyframes shimmerEffect {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    100% { transform: translateX(250%) skewX(-20deg); }
                }
                .animate-shimmer-custom {
                    animation: shimmerEffect 2.5s infinite ease-in-out;
                }
            `}</style>

            <header className={`flex flex-col items-center lg:items-center gap-[16px] px-[24px] lg:px-0 ${isHeroWidget ? 'mb-[20px] ' : 'mb-[28px] text-center lg:items-center'}`}>
                <h2 className={` font-custom text-[#308026] ${isHeroWidget ? 'text-[24px]  leading-[28px]' : 'text-[24px] leading-[30px] lg:text-[42px] lg:leading-[48px]'}`}>
                    Today’s Best Deal
                </h2>
                <p className={`font-titillium font-[300] text-[#575757] ${isHeroWidget ? 'text-[14px]  leading-[18px]' : 'text-[16px] leading-[22px] lg:text-[18px]'}`}>
                    Never miss the opportunity to buy best
                </p>
            </header>

            <div className={`flex flex-col px-[24px] lg:px-0 ${isHeroWidget ? 'gap-[10px]' : 'gap-[6px] lg:gap-[16px]'}`}>

                {/* ROW 2: WIDE CARD (70%) + PROMO DIV (30%) */}
                <div className={`flex w-full gap-[6px] lg:gap-[16px] ${isHeroWidget ? 'h-[175px] gap-[10px]' : 'h-[150px] lg:h-[300px]'}`}>

                    {/* PROMO DIV WITH WORKING SHINY EFFECT */}
                    <div className="relative overflow-hidden flex flex-[0.3] flex-col items-center justify-center rounded-[20px] bg-[#308026] p-[4px] text-white shadow-sm">

                        {/* THE SHINE ELEMENT */}
                        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full animate-shimmer-custom" />

                        <span className="relative z-10 font-titillium text-[12px] font-[400] uppercase tracking-[0.05em] opacity-90 lg:text-[14px]">
                            up to
                        </span>
                        <div className="relative z-10 flex flex-col items-start">
                            <span className="font-custom text-[24px] leading-tight lg:text-[28px]">
                                20%
                            </span>
                            <span className="font-custom text-[24px] leading-tight lg:text-[22px]">
                                OFF
                            </span>
                        </div>
                    </div>

                    <div className="flex-[0.7]">
                        <DealCard deal={displayDeals[2]} isWide className="h-full w-full" />
                    </div>
                </div>

                {/* ROW 1: TWO VERTICAL CARDS */}
                <div className={`flex gap-[6px] w-full ${isHeroWidget ? 'h-[280px] gap-[10px]' : 'h-[240px] lg:gap-[16px] lg:h-[420px]'}`}>
                    <DealCard deal={displayDeals[0]} className={isHeroWidget ? 'flex-1' : 'w-[190px] lg:w-1/2'} />
                    <DealCard deal={displayDeals[1]} className="flex-1" />
                </div>

            </div>
        </section>
    );
};

interface DealCardProps {
    deal: Deal;
    className?: string;
    isWide?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, className, isWide }) => {
    return (
        <Link
            href={`/product/${deal.id}`}
            className={`relative flex bg-white border border-[#f2f9f1] rounded-[20px] p-[8px] transition-transform active:scale-[0.98] ${isWide ? 'flex-row items-center gap-[12px]' : 'flex-col justify-between gap-[8px]'} ${className}`}
        >
            {/* DISCOUNT BADGE */}
            <div className={`absolute top-[10px] z-10 flex h-[21px] w-[54px] items-center justify-center rounded-[6px] bg-[#94ff00] px-[6px] py-[2px] ${isWide ? 'right-[12px]' : 'right-[8px]'}`}>
                <span className="font-custom text-[10px] font-normal leading-[14px] text-[#242424]">save {deal.discount}%</span>
            </div>

            {/* IMAGE CONTAINER */}
            <div className={`relative rounded-[12px] flex items-center justify-center overflow-hidden min-h-0 shrink-0 ${isWide ? 'w-[80px] h-full lg:w-[250px]' : 'w-full flex-1'}`}>
                <Image 
                    src={optimizeImage(deal.image, 400)} 
                    alt={deal.title} 
                    fill 
                    loading="lazy"
                    className="object-contain p-[8px]" 
                    sizes="(max-width: 768px) 150px, 300px"
                />
            </div>

            {/* INFO BLOCK */}
            <div className={`flex flex-col justify-center rounded-[12px] bg-[#f7faf6] px-[16px] ${isWide ? 'flex-1 h-full py-[12px]' : 'w-full shrink-0 pb-[16px] pt-[8px]'}`}>
                <div className="flex flex-col gap-[2px]">
                    <span className="font-titillium text-[10px] font-normal leading-[14px] text-[#bebebe]">{deal.brand}</span>
                    <h3 className="line-clamp-2 font-custom text-[12px] font-normal leading-[16px] tracking-[0.2px] text-[#485d2c] lg:text-[16px] lg:leading-[20px]">{deal.title}</h3>
                </div>
                <div className="flex items-center gap-[6px] lg:gap-[10px]">
              {/* Original Price - Strikethrough */}
              <span className="font-titillium text-[16px] lg:text-[18px] font-normal leading-[22px] text-[#979797] line-through tracking-[-1.12px]">
                Rs. {deal.originalPrice}
              </span>
              
              {/* Discounted Price - Custom Font + Brand Green Gradient */}
              <span className="font-custom text-[17px] lg:text-[20px] font-normal leading-[24px] bg-gradient-to-r from-[#308026] to-[#32d71d] bg-clip-text text-transparent">
                Rs. {deal.discountedPrice}
              </span>
            </div>
        </div>
    </Link>
    );
};

export default TodaysDeals;
