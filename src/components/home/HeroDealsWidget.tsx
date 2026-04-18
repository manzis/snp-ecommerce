import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Deal {
    id: string;
    brand: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
    discount: string;
    image: string;
}

interface HeroDealsWidgetProps {
    deals?: Deal[];
}

const HeroDealsWidget: React.FC<HeroDealsWidgetProps> = ({ deals = [] }) => {
    if (deals.length === 0) return null;
    const displayDeals = deals.length >= 3 ? deals : [...deals, ...deals, ...deals].slice(0, 3);
    return (
        <div className="hidden lg:flex w-[410px] flex-col gap-[20px] rounded-[32px] bg-white/10 backdrop-blur-md border border-white/20 p-[24px] shadow-2xl">
            <header className="flex flex-col gap-[8px]">
                <h2 className="font-custom text-[24px] font-normal leading-[28px] text-[#c4ffbc]">
                    Today’s Best Deal
                </h2>
                <p className="font-titillium text-[14px] font-[300] text-white/80">
                    Never miss the opportunity to buy best
                </p>
            </header>

            <div className="flex flex-col gap-[12px]">
                {/* BENTO ROW 1: 2 Small Cards */}
                <div className="flex h-[200px] gap-[12px]">
                    <WidgetCard deal={displayDeals[0]} className="flex-1" />
                    <WidgetCard deal={displayDeals[1]} className="flex-1" />
                </div>
                {/* BENTO ROW 2: 1 Wide Card */}
                <div className="h-[100px]">
                    <WidgetCard deal={displayDeals[2]} isWide className="w-full" />
                </div>
            </div>
        </div>
    );
};

const WidgetCard = ({ deal, className, isWide }: { deal: Deal; className: string; isWide?: boolean }) => (
    <Link href={`/product/${deal.id}`} className={`relative flex bg-white/90 rounded-[16px] p-[6px] border border-white/20 transition-transform active:scale-95 ${isWide ? 'flex-row items-center gap-[10px] h-full' : 'flex-col justify-between h-full'} ${className}`}>
        <div className="absolute top-[6px] right-[6px] z-10 rounded-[4px] bg-[#94ff00] px-[4px] py-[1px]">
            <span className="font-custom text-[8px] text-[#242424]">save {deal.discount}%</span>
        </div>
        <div className={`relative flex items-center justify-center shrink-0 ${isWide ? 'w-[70px] h-full' : 'w-full flex-1'}`}>
            <Image 
                src={deal.image} 
                alt={deal.title} 
                fill 
                priority
                sizes={isWide ? "70px" : "200px"}
                className="object-contain p-[4px]" 
            />
        </div>
        <div className={`flex flex-col justify-center bg-[#f7faf6] rounded-[10px] px-[8px] ${isWide ? 'flex-1 h-full py-[4px]' : 'w-full py-[8px]'}`}>
            <span className="font-titillium text-[8px] text-[#bebebe] uppercase">{deal.brand}</span>
            <h3 className="line-clamp-1 font-custom text-[10px] text-[#485d2c]">{deal.title}</h3>
            {/* PRICE SECTION */}
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

export default HeroDealsWidget;