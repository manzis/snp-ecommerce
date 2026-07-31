import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import heroBg from '../../../public/images/heroimage.webp';
import { Barlow } from 'next/font/google';
import { optimizeImage } from '@/lib/optimizeImage';

const barlowFont = Barlow({ subsets: ['latin'], weight: ['800', '900'] });

interface HomeHeroProps {
    deals?: any[];
    heroImages?: {
        desktopUrl: string;
        mobileUrl: string;
    } | null;
}

const fallbackDeals = [
    {
        id: 'optimum-nutrition-gold-standard-100-whey',
        brand: 'Optimum Nutrition',
        title: 'Gold Standard 100% Whey Protein',
        originalPrice: '9500',
        discountedPrice: '7790',
        discount: '18',
        image: '/images/protein.jpg'
    },
    {
        id: 'muscleblaze-biozyme-performance-whey',
        brand: 'MuscleBlaze',
        title: 'Biozyme Performance Whey',
        originalPrice: '7500',
        discountedPrice: '6150',
        discount: '18',
        image: '/images/protein.jpg'
    },
    {
        id: 'naturaltein-whey-protein-isolate',
        brand: 'Naturaltein',
        title: 'Whey Protein Isolate 100% Natural',
        originalPrice: '8800',
        discountedPrice: '7216',
        discount: '18',
        image: '/images/protein.jpg'
    }
];

// Extracted repeated SVG icons to reduce JSX size
const IconSparkle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3f9733' }}>
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m2 6 4-4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
        <path d="M6.5 12.5 12.5 6.5" />
        <path d="m11.5 17.5 6-6" />
    </svg>
);

const IconTag = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3f9733' }}>
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
    </svg>
);

const HomeHero: React.FC<HomeHeroProps> = ({ deals = [], heroImages }) => {
    // If no deals or not enough, fill with fallback deals to always have beautiful products
    const displayDeals = deals.length >= 3
        ? deals.slice(0, 3)
        : [...deals, ...fallbackDeals].slice(0, 3);

    return (
        <section className="relative w-full h-[810px] lg:h-screen lg:min-h-[810px] flex items-center justify-center bg-[#081908]">
            {/* Global style for Hero Section background & Marquee moved to globals.css */}

            {/* Absolute Background Image Layer using optimized Next.js Image with high-priority preloading */}
            <div className="hero-bg-layer">
                {heroImages?.desktopUrl || heroImages?.mobileUrl ? (
                    <picture>
                        {heroImages.desktopUrl && (
                            <source media="(min-width: 1024px)" srcSet={heroImages.desktopUrl} />
                        )}
                        <img 
                            src={heroImages.mobileUrl || heroImages.desktopUrl} 
                            alt="Hero Background Image" 
                            className="hero-bg-image-filter object-cover w-full h-full"
                            fetchPriority="high"
                            decoding="sync"
                        />
                    </picture>
                ) : (
                    <Image
                        src={heroBg}
                        alt="Hero Background Image"
                        fill
                        priority
                        sizes="100vw"
                        className="hero-bg-image-filter"
                        {...({ fetchPriority: 'high', decoding: 'sync' } as any)}
                    />
                )}
                {/* Radial Gradient Overlay Mask */}
                <div
                    className="absolute inset-0 z-[1]"
                    style={{ background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.55) 100%)' }}
                />
            </div>

            {/* Repeating background pattern layer with responsive opacity */}
            <div className="hero-pattern-layer" />

            {/* Optimized: Removed heavy blur gradient corner and blob layers for performance */}

            {/* MOBILE & TABLET LAYOUT: 1:1 exact matching herosection.html coordinates */}
            <div className="relative w-[410px] h-[810px] shrink-0 lg:hidden overflow-hidden bg-transparent mx-auto">
                {/* Title & CTA Block */}
                <div className="absolute top-[185px] left-[24px] flex w-[340px] h-auto p-[24px_20px] flex-col gap-[16px] justify-center items-start shrink-0 flex-nowrap z-[1]">
                    <h1 className={`w-full shrink-0 ${barlowFont.className} text-[32px] font-black leading-[44px] tracking-[1px] relative text-left z-[2] uppercase`}>
                        <span className={`${barlowFont.className} text-[32px] font-black leading-[44px] text-white tracking-[1px] relative text-left uppercase`}>
                            MEET THE{' '}
                            <span
                                className="inline-flex items-center justify-center bg-white rounded-[8px] p-[6px] origin-center align-middle ml-[8px] mr-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]"
                                style={{ transform: 'rotate(-15deg) translateY(-2px)' }}
                            >
                                <IconSparkle size={20} />
                            </span>
                            <br />BEST PLATFORM FOR YOUR <br />DAILY NEEDS &{' '}
                        </span>
                        <span className={`${barlowFont.className} text-[32px] font-black text-[#95FF00] leading-[44px] tracking-[1px] relative text-left uppercase`}>
                            ESSENTIALS{' '}
                            <span
                                className="inline-flex items-center justify-center bg-white rounded-[8px] p-[6px] origin-center align-middle ml-[8px] mr-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]"
                                style={{ transform: 'rotate(15deg) translateY(-2px)' }}
                            >
                                <IconTag size={20} />
                            </span>
                        </span>
                    </h1>

                    <Link
                        href="/products"
                        className="flex w-[102px] h-[45px] p-[10px] gap-[10px] justify-center items-center shrink-0 flex-nowrap bg-white relative z-[3] active:scale-95 transition-transform"
                    >
                        <span className="flex w-[67px] h-[48px] justify-center items-center shrink-0 basis-auto font-rajdhani text-[14px] font-bold leading-[48px] text-[#308026] tracking-[-0.4px] relative text-center whitespace-nowrap z-[4]">
                            SHOP NOW
                        </span>
                    </Link>
                </div>

                {/* Products Carousel / Cards */}
                <div
                    className="absolute top-[570px] left-[50%] flex w-[478px] h-[160px] p-[16px] items-center shrink-0 flex-nowrap z-[5] overflow-hidden"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', transform: 'translateX(-46.86%)' }}
                >
                    <div className="animate-marquee-ltr">
                        {[...displayDeals, ...displayDeals].map((item, index) => {
                            const zIndexes = [6, 10, 14];
                            const badgeZIndexes = [8, 12, 16];
                            return (
                                <Link
                                    key={`${item.id}-${index}`}
                                    href={`/product/${item.id}`}
                                    className="flex w-[115px] h-[125px] p-[14px_8px_8px_8px] gap-[10px] items-center shrink-0 flex-nowrap bg-white rounded-[5px] relative active:scale-95 transition-transform"
                                    style={{ zIndex: zIndexes[index % 3] }}
                                >
                                    <div style={{ minWidth: 0, minHeight: 0, alignSelf: 'stretch', flexGrow: 1, flexShrink: 0, flexBasis: 0, position: 'relative', zIndex: zIndexes[index % 3] + 1 }}>
                                        <Image
                                            src={optimizeImage(item.image, 300, 'auto:low')}
                                            alt={item.title}
                                            fill
                                            priority
                                            sizes="99px"
                                            className="object-contain"
                                        />
                                    </div>
                                    {/* 3D Wrapped Discount Ribbon */}
                                    <div
                                        className="absolute top-[10px] left-[-6px] flex p-[3px_6px_3px_8px] justify-center items-center bg-[#308026] rounded-tr-[6px] rounded-br-[6px]"
                                        style={{ zIndex: badgeZIndexes[index % 3] }}
                                    >
                                        <span className="font-rajdhani text-[10px] font-bold leading-[14px] text-white uppercase whitespace-nowrap">
                                            {item.discount}% OFF
                                        </span>
                                        {/* Ribbon fold triangle */}
                                        <div className="absolute left-0 top-[100%] w-0 h-0 border-solid border-[0_6px_6px_0] border-transparent border-r-[#183f13]" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* DESKTOP LAYOUT: Beautifully scaled full-viewport height and width flex layout */}
            <div className="hidden lg:flex flex-col w-full max-w-[1440px] h-full items-center justify-center px-[100px] relative">
                {/* Left Column: Heading and SHOP NOW button with local soft oval dark gradient */}
                <div className="relative flex flex-col gap-[28px] items-center max-w-[850px] shrink-0 lg:-mt-[40px] px-[40px] py-[30px] rounded-full text-center">
                    <h1 className={`${barlowFont.className} text-[32px] font-black leading-[44px] tracking-[1px] uppercase text-center relative z-[1] text-white`}>
                        MEET THE{' '}
                        <span
                            className="inline-flex items-center justify-center bg-white rounded-[10px] p-[6px] origin-center align-middle ml-[8px] mr-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
                            style={{ transform: 'rotate(-15deg) translateY(-2px)' }}
                        >
                            <IconSparkle size={20} />
                        </span>
                        <br />BEST PLATFORM FOR YOUR <br />DAILY NEEDS &{' '}
                        <span className="text-[#95FF00]">
                            ESSENTIALS{' '}
                            <span
                                className="inline-flex items-center justify-center bg-white rounded-[10px] p-[6px] origin-center align-middle ml-[8px] mr-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
                                style={{ transform: 'rotate(15deg) translateY(-2px)' }}
                            >
                                <IconTag size={20} />
                            </span>
                        </span>
                    </h1>
                    <Link
                        href="/products"
                        className="relative flex h-[56px] w-[150px] shrink-0 items-center justify-center gap-[10px] bg-white rounded-none transition-all hover:bg-[#f8fafc] hover:scale-[1.03] active:scale-95 z-[2]"
                    >
                        <span className="font-rajdhani text-[18px] font-bold leading-none tracking-[-0.4px] text-[#308026] whitespace-nowrap">
                            SHOP NOW
                        </span>
                    </Link>
                </div>

                {/* Bottom Row: Premium carousel showing Today's Deals dynamically */}
                <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center shrink-0 z-10">
                    <div className="flex items-center p-[16px_24px] rounded-none w-[520px] overflow-hidden relative bg-white/15">
                        <div className="animate-marquee-ltr">
                            {[...displayDeals, ...displayDeals].map((item, index) => (
                                <Link
                                    key={`${item.id}-${index}`}
                                    href={`/product/${item.id}`}
                                    className="flex w-[115px] h-[125px] p-[14px_8px_8px_8px] gap-[10px] items-center shrink-0 flex-nowrap bg-white rounded-[5px] relative transition-all hover:scale-[1.05] active:scale-95"
                                >
                                    <div style={{ minWidth: 0, minHeight: 0, alignSelf: 'stretch', flexGrow: 1, flexShrink: 0, flexBasis: 0, position: 'relative' }}>
                                        <Image
                                            src={optimizeImage(item.image, 300, 'auto:low')}
                                            alt={item.title}
                                            fill
                                            priority
                                            sizes="99px"
                                            className="object-contain"
                                        />
                                    </div>
                                    {/* 3D Wrapped Discount Ribbon */}
                                    <div className="absolute top-[10px] left-[-6px] flex p-[3px_6px_3px_8px] justify-center items-center bg-[#308026] rounded-tr-[6px] rounded-br-[6px] z-10">
                                        <span className="font-rajdhani text-[10px] font-bold leading-[14px] text-white uppercase whitespace-nowrap">
                                            {item.discount}% OFF
                                        </span>
                                        {/* Ribbon fold triangle */}
                                        <div className="absolute left-0 top-[100%] w-0 h-0 border-solid border-[0_6px_6px_0] border-transparent border-r-[#183f13]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Wavy bottom border to blend into the next section */}
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[45px] md:h-[60px] lg:h-[80px] block text-white z-20 pointer-events-none translate-y-[2px]">
                <path fill="currentColor" d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z" />
            </svg>
        </section>
    );
};

export default HomeHero;
