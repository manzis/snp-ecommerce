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

const DEALS: Deal[] = [
    { id: '1', brand: 'Naturltein', title: 'Asitsi atom whey protein', originalPrice: 'RS. 5000', discountedPrice: 'rS. 1890', discount: '20%', image: '/images/deal.png' },
    { id: '2', brand: 'Naturltein', title: 'Asitsi atom whey protein', originalPrice: 'RS. 5000', discountedPrice: 'rS. 1890', discount: '20%', image: '/images/deal.png' },
    { id: '3', brand: 'Naturltein', title: 'Asitsi atom whey protein', originalPrice: 'RS. 5000', discountedPrice: 'rS. 1890', discount: '20%', image: '/images/deal.png' },
];

const HeroDealsWidget: React.FC = () => {
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
                    <WidgetCard deal={DEALS[0]} className="flex-1" />
                    <WidgetCard deal={DEALS[1]} className="flex-1" />
                </div>
                {/* BENTO ROW 2: 1 Wide Card */}
                <div className="h-[100px]">
                    <WidgetCard deal={DEALS[2]} isWide className="w-full" />
                </div>
            </div>
        </div>
    );
};

const WidgetCard = ({ deal, className, isWide }: { deal: Deal; className: string; isWide?: boolean }) => (
    <Link href={`/product/${deal.id}`} className={`relative flex bg-white/90 rounded-[16px] p-[6px] border border-white/20 transition-transform active:scale-95 ${isWide ? 'flex-row items-center gap-[10px] h-full' : 'flex-col justify-between h-full'} ${className}`}>
        <div className="absolute top-[6px] right-[6px] z-10 rounded-[4px] bg-[#94ff00] px-[4px] py-[1px]">
            <span className="font-custom text-[8px] text-[#242424]">save {deal.discount}</span>
        </div>
        <div className={`relative flex items-center justify-center shrink-0 ${isWide ? 'w-[70px] h-full' : 'w-full flex-1'}`}>
            <Image src={deal.image} alt={deal.title} fill className="object-contain p-[4px]" />
        </div>
        <div className={`flex flex-col justify-center bg-[#f7faf6] rounded-[10px] px-[8px] ${isWide ? 'flex-1 h-full py-[4px]' : 'w-full py-[8px]'}`}>
            <span className="font-titillium text-[8px] text-[#bebebe] uppercase">{deal.brand}</span>
            <h3 className="line-clamp-1 font-custom text-[10px] text-[#485d2c]">{deal.title}</h3>
            <div className="mt-[2px] flex items-center gap-[4px]">
                <span className="font-titillium text-[10px] text-[#979797] line-through">{deal.originalPrice}</span>
                <span className="font-custom text-[12px] text-[#308026]">{deal.discountedPrice}</span>
            </div>
        </div>
    </Link>
);

export default HeroDealsWidget;