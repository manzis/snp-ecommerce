'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HomeHeroProps {
    deals?: any[];
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
        <path d="m6.5 6.5 11 11"/>
        <path d="m21 21-1-1"/>
        <path d="m3 3 1 1"/>
        <path d="m18 22 4-4"/>
        <path d="m2 6 4-4"/>
        <path d="m3 10 7-7"/>
        <path d="m14 21 7-7"/>
        <path d="M6.5 12.5 12.5 6.5"/>
        <path d="m11.5 17.5 6-6"/>
    </svg>
);

const IconTag = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3f9733' }}>
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
        <path d="m8.5 8.5 7 7"/>
    </svg>
);

const HomeHero: React.FC<HomeHeroProps> = ({ deals = [] }) => {
    // If no deals or not enough, fill with fallback deals to always have beautiful products
    const displayDeals = deals.length >= 3
        ? deals.slice(0, 3)
        : [...deals, ...fallbackDeals].slice(0, 3);

    return (
        <section className="relative w-full h-[764px] lg:h-screen lg:min-h-[764px] overflow-hidden flex items-center justify-center bg-[#081908]">
            {/* Global style for Hero Section background & Marquee moved to globals.css */}

            {/* Absolute Background Image Layer using optimized Next.js Image with high-priority preloading */}
            <div className="hero-bg-layer">
                <Image
                    src="/images/heroimage.webp"
                    alt="Hero Background Image"
                    fill
                    priority
                    sizes="100vw"
                    className="hero-bg-image-filter"
                    decoding="sync"
                    {...({ fetchPriority: 'high' } as any)}
                />
                {/* Radial Gradient Overlay Mask */}
                <div 
                    className="absolute inset-0 z-[1]"
                    style={{ background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.55) 100%)' }}
                />
            </div>

            {/* Repeating background pattern layer with responsive opacity */}
            <div className="hero-pattern-layer" />

            {/* Corner Radial Gradient Glows (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(148, 255, 0, 0.05) 0%, rgba(148, 255, 0, 0) 70%)' }} />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(52, 211, 153, 0.04) 0%, rgba(52, 211, 153, 0) 70%)' }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0) 70%)' }} />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(148, 255, 0, 0.03) 0%, rgba(148, 255, 0, 0) 70%)' }} />

            {/* Ambient Radiant Gradient Spotlight Blobs */}
            <div className="absolute top-[-100px] right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(148, 255, 0, 0.04) 0%, rgba(148, 255, 0, 0) 70%)' }} />
            <div className="absolute bottom-[-100px] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 70%)' }} />

            {/* MOBILE & TABLET LAYOUT: 1:1 exact matching herosection.html coordinates */}
            <div className="relative w-[410px] h-[764px] shrink-0 lg:hidden overflow-hidden bg-transparent mx-auto">
                {/* Title & CTA Block */}
                <div className="absolute top-[185px] left-[24px] flex w-[340px] h-auto p-[24px_20px] flex-col gap-[16px] justify-center items-start shrink-0 flex-nowrap z-[1]">
                    {/* Soft Dark Oval Gradient Background */}
                    <div 
                        className="absolute inset-[-10px_-20px] rounded-full pointer-events-none z-0 blur-[15px]"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 70%)' }}
                    />
                    <h1 className="w-full shrink-0 font-titillium text-[36px] font-black leading-[50px] tracking-[1px] relative text-left z-[2] uppercase">
                        <span className="font-titillium text-[36px] font-black leading-[50px] text-white tracking-[1px] relative text-left uppercase">
                            MEET THE{' '}
                            <span 
                                className="inline-flex items-center justify-center bg-white rounded-[10px] p-[6px] origin-center align-middle ml-[10px] mr-[6px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]"
                                style={{ transform: 'rotate(-15deg) translateY(-3px)' }}
                            >
                                <IconSparkle size={22} />
                            </span>
                            <br />BEST PLATFORM FOR YOUR <br />DAILY NEEDS &{' '}
                        </span>
                        <span className="font-titillium text-[36px] font-black text-[#95FF00] leading-[50px] tracking-[1px] relative text-left uppercase">
                            ESSENTIALS{' '}
                            <span 
                                className="inline-flex items-center justify-center bg-white rounded-[10px] p-[6px] origin-center align-middle ml-[8px] mr-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]"
                                style={{ transform: 'rotate(15deg) translateY(-3px)' }}
                            >
                                <IconTag size={22} />
                            </span>
                        </span>
                    </h1>

                    <Link
                        href="/products"
                        className="flex w-[102px] h-[45px] p-[10px] gap-[10px] justify-center items-center shrink-0 flex-nowrap bg-white relative z-[3] active:scale-95 transition-transform"
                    >
                        <span className="flex w-[67px] h-[48px] justify-center items-center shrink-0 basis-auto font-titillium text-[14px] font-bold leading-[48px] text-[#308026] tracking-[-0.4px] relative text-center whitespace-nowrap z-[4]">
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
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            loading="lazy"
                                            sizes="99px"
                                            className="object-contain"
                                        />
                                    </div>
                                    {/* 3D Wrapped Discount Ribbon */}
                                    <div
                                        className="absolute top-[10px] left-[-6px] flex p-[3px_6px_3px_8px] justify-center items-center bg-[#308026] rounded-tr-[6px] rounded-br-[6px]"
                                        style={{ zIndex: badgeZIndexes[index % 3] }}
                                    >
                                        <span className="font-titillium text-[10px] font-bold leading-[14px] text-white uppercase whitespace-nowrap">
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
                    {/* Soft Dark Oval Gradient Background */}
                    <div 
                        className="absolute inset-[-20px_-30px] rounded-full pointer-events-none z-0 blur-[20px]"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 70%)' }}
                    />
                    <h1 className="font-titillium text-[36px] font-black leading-[50px] tracking-[1.5px] uppercase text-center relative z-[1] text-white">
                        MEET THE{' '}
                        <span 
                            className="inline-flex items-center justify-center bg-white rounded-[12px] p-[8px] origin-center align-middle ml-[10px] mr-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
                            style={{ transform: 'rotate(-15deg) translateY(-4px)' }}
                        >
                            <IconSparkle size={24} />
                        </span>
                        <br />BEST PLATFORM FOR YOUR <br />DAILY NEEDS &{' '}
                        <span className="text-[#95FF00]">
                            ESSENTIALS{' '}
                            <span 
                                className="inline-flex items-center justify-center bg-white rounded-[12px] p-[8px] origin-center align-middle ml-[10px] mr-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
                                style={{ transform: 'rotate(15deg) translateY(-4px)' }}
                            >
                                <IconTag size={24} />
                            </span>
                        </span>
                    </h1>
                    <Link
                        href="/products"
                        className="relative flex h-[56px] w-[150px] shrink-0 items-center justify-center gap-[10px] bg-white rounded-none transition-all hover:bg-[#f8fafc] hover:scale-[1.03] active:scale-95 z-[2]"
                    >
                        <span className="font-titillium text-[18px] font-bold leading-none tracking-[-0.4px] text-[#308026] whitespace-nowrap">
                            SHOP NOW
                        </span>
                    </Link>
                </div>

                {/* Bottom Row: Premium carousel showing Today's Deals dynamically */}
                <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 flex flex-col items-center shrink-0 z-10">
                    <div className="flex items-center p-[16px_24px] rounded-none backdrop-blur-[12px] w-[520px] overflow-hidden relative" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <div className="animate-marquee-ltr">
                            {[...displayDeals, ...displayDeals].map((item, index) => (
                                <Link
                                    key={`${item.id}-${index}`}
                                    href={`/product/${item.id}`}
                                    className="flex w-[115px] h-[125px] p-[14px_8px_8px_8px] gap-[10px] items-center shrink-0 flex-nowrap bg-white rounded-[5px] relative transition-all hover:scale-[1.05] active:scale-95"
                                >
                                    <div style={{ minWidth: 0, minHeight: 0, alignSelf: 'stretch', flexGrow: 1, flexShrink: 0, flexBasis: 0, position: 'relative' }}>
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            loading="lazy"
                                            sizes="99px"
                                            className="object-contain"
                                        />
                                    </div>
                                    {/* 3D Wrapped Discount Ribbon */}
                                    <div className="absolute top-[10px] left-[-6px] flex p-[3px_6px_3px_8px] justify-center items-center bg-[#308026] rounded-tr-[6px] rounded-br-[6px] z-10">
                                        <span className="font-titillium text-[10px] font-bold leading-[14px] text-white uppercase whitespace-nowrap">
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
        </section>
    );
};

export default HomeHero;
