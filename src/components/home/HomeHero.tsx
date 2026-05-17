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

const HomeHero: React.FC<HomeHeroProps> = ({ deals = [] }) => {
    // If no deals or not enough, fill with fallback deals to always have beautiful products
    const displayDeals = deals.length >= 3
        ? deals.slice(0, 3)
        : [...deals, ...fallbackDeals].slice(0, 3);

    return (
        <section
            className="relative w-full h-[764px] lg:h-screen lg:min-h-[764px] overflow-hidden flex items-center justify-center bg-[#081908]"
        >
            {/* Global style for Hero Section background & Marquee */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hero-bg-layer {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 0;
                    overflow: hidden;
                }
                .hero-bg-image-filter {
                    filter: blur(2px);
                    transform: scale(1.03);
                    object-fit: cover;
                    object-position: left center;
                }
                @media (min-width: 1024px) {
                    .hero-bg-image-filter {
                        object-position: center;
                    }
                }
                .hero-pattern-layer {
                    position: absolute;
                    inset: 0;
                    background-image: url('/images/herobgpattern.webp');
                    background-repeat: repeat;
                    background-position: center;
                    background-size: cover;
                    opacity: 0.09;
                    mask-image: radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,1) 80%);
                    -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,1) 80%);
                    pointer-events: none;
                    z-index: 0;
                }
                @media (min-width: 1024px) {
                    .hero-pattern-layer {
                        opacity: 0.04;
                    }
                }
                @keyframes marquee-ltr {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                }
                .animate-marquee-ltr {
                    display: flex;
                    gap: 12px;
                    animation: marquee-ltr 20s linear infinite;
                    width: max-content;
                }
                .animate-marquee-ltr:hover {
                    animation-play-state: paused;
                }
            `}} />

            {/* Absolute Background Image Layer using optimized Next.js Image with high-priority preloading */}
            <div className="hero-bg-layer">
                <Image
                    src="/images/heroimage.webp"
                    alt="Hero Background Image"
                    fill
                    priority
                    sizes="100vw"
                    className="hero-bg-image-filter"
                />
                {/* Radial Gradient Overlay Mask */}
                <div 
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.55) 100%)',
                        zIndex: 1
                    }}
                />
            </div>

            {/* Repeating background pattern layer with responsive opacity */}
            <div className="hero-pattern-layer" />

            {/* Corner Radial Gradient Glows (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle at 0% 0%, rgba(148, 255, 0, 0.05) 0%, rgba(148, 255, 0, 0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle at 100% 0%, rgba(52, 211, 153, 0.04) 0%, rgba(52, 211, 153, 0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle at 100% 100%, rgba(148, 255, 0, 0.03) 0%, rgba(148, 255, 0, 0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* Ambient Radiant Gradient Spotlight Blobs */}
            <div
                style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(148, 255, 0, 0.04) 0%, rgba(148, 255, 0, 0) 70%)',
                    filter: 'blur(120px)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-100px',
                    left: '10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 70%)',
                    filter: 'blur(120px)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* MOBILE & TABLET LAYOUT: 1:1 exact matching herosection.html coordinates */}
            <div className="relative w-[410px] h-[764px] shrink-0 lg:hidden overflow-hidden bg-transparent mx-auto">
                {/* Title & CTA Block */}
                <div
                    style={{
                        display: 'flex',
                        width: '340px',
                        height: 'auto',
                        padding: '24px 20px',
                        flexDirection: 'column',
                        gap: '16px',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        flexShrink: 0,
                        flexWrap: 'nowrap',
                        position: 'absolute',
                        top: '185px',
                        left: '24px',
                        transform: 'none',
                        zIndex: 1
                    }}
                >
                    {/* Soft Dark Oval Gradient Background */}
                    <div 
                        style={{
                            position: 'absolute',
                            inset: '-10px -20px',
                            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
                            borderRadius: '100%',
                            filter: 'blur(15px)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                    <h1
                        style={{
                            minWidth: 0,
                            alignSelf: 'stretch',
                            flexShrink: 0,
                            fontFamily: "var(--font-titillium), sans-serif",
                            fontSize: '36px',
                            fontWeight: 900,
                            lineHeight: '50px',
                            letterSpacing: '1px',
                            position: 'relative',
                            textAlign: 'left',
                            zIndex: 2,
                            textTransform: 'uppercase'
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-titillium), sans-serif",
                                fontSize: '36px',
                                fontWeight: 900,
                                lineHeight: '50px',
                                color: '#ffffff',
                                letterSpacing: '1px',
                                position: 'relative',
                                textAlign: 'left',
                                textTransform: 'uppercase'
                            }}
                        >
                            MEET THE{' '}
                            <span 
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
                                    padding: '6px',
                                    transform: 'rotate(-15deg) translateY(-3px)',
                                    transformOrigin: 'center',
                                    verticalAlign: 'middle',
                                    marginLeft: '10px',
                                    marginRight: '6px'
                                }}
                            >
                                <svg 
                                    width="22" 
                                    height="22" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    style={{
                                        color: '#3f9733'
                                    }}
                                >
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
                            </span>
                            <br />BEST PLATFORM FOR YOUR <br />DAILY NEEDS &{' '}
                        </span>
                        <span
                            style={{
                                fontFamily: "var(--font-titillium), sans-serif",
                                fontSize: '36px',
                                fontWeight: 900,
                                color: '#95FF00',
                                lineHeight: '50px',
                                letterSpacing: '1px',
                                position: 'relative',
                                textAlign: 'left',
                                textTransform: 'uppercase'
                            }}
                        >
                            ESSENTIALS{' '}
                            <span 
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
                                    padding: '6px',
                                    transform: 'rotate(15deg) translateY(-3px)',
                                    transformOrigin: 'center',
                                    verticalAlign: 'middle',
                                    marginLeft: '8px',
                                    marginRight: '4px'
                                }}
                            >
                                <svg 
                                    width="22" 
                                    height="22" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    style={{
                                        color: '#3f9733'
                                    }}
                                >
                                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                                    <path d="m8.5 8.5 7 7"/>
                                </svg>
                            </span>
                        </span>
                    </h1>

                    <Link
                        href="/search"
                        style={{
                            display: 'flex',
                            width: '102px',
                            height: '45px',
                            padding: '10px',
                            gap: '10px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0,
                            flexWrap: 'nowrap',
                            backgroundColor: '#ffffff',
                            position: 'relative',
                            zIndex: 3
                        }}
                        className="active:scale-95 transition-transform"
                    >
                        <span
                            style={{
                                display: 'flex',
                                width: '67px',
                                height: '48px',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                                flexBasis: 'auto',
                                fontFamily: "var(--font-titillium), sans-serif",
                                fontSize: '14px',
                                fontWeight: 700,
                                lineHeight: '48px',
                                color: '#308026',
                                letterSpacing: '-0.4px',
                                position: 'relative',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                zIndex: 4
                            }}
                        >
                            SHOP NOW
                        </span>
                    </Link>
                </div>

                {/* Products Carousel / Cards */}
                <div
                    style={{
                        display: 'flex',
                        width: '478px',
                        height: '160px',
                        padding: '16px',
                        alignItems: 'center',
                        flexShrink: 0,
                        flexWrap: 'nowrap',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        position: 'absolute',
                        top: '570px',
                        left: '50%',
                        transform: 'translate(-46.86%, 0)',
                        zIndex: 5,
                        overflow: 'hidden'
                    }}
                >
                    <div className="animate-marquee-ltr">
                        {[...displayDeals, ...displayDeals].map((item, index) => {
                            const leftPositions = ['45px', '42px', '45px'];
                            const zIndexes = [6, 10, 14];
                            const badgeZIndexes = [8, 12, 16];
                            return (
                                <Link
                                    key={`${item.id}-${index}`}
                                    href={`/product/${item.id}`}
                                    style={{
                                        display: 'flex',
                                        width: '115px',
                                        height: '125px',
                                        padding: '14px 8px 8px 8px',
                                        gap: '10px',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                        flexWrap: 'nowrap',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '5px',
                                        position: 'relative',
                                        zIndex: zIndexes[index % 3]
                                    }}
                                    className="active:scale-95 transition-transform"
                                >
                                    <div
                                        style={{
                                            minWidth: 0,
                                            minHeight: 0,
                                            alignSelf: 'stretch',
                                            flexGrow: 1,
                                            flexShrink: 0,
                                            flexBasis: 0,
                                            position: 'relative',
                                            zIndex: zIndexes[index % 3] + 1
                                        }}
                                    >
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="99px"
                                            className="object-contain"
                                        />
                                    </div>
                                    {/* 3D Wrapped Discount Ribbon */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            padding: '3px 6px 3px 8px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: '#308026',
                                            borderTopRightRadius: '6px',
                                            borderBottomRightRadius: '6px',
                                            position: 'absolute',
                                            top: '10px',
                                            left: '-6px',
                                            zIndex: badgeZIndexes[index % 3]
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: "var(--font-titillium), sans-serif",
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                lineHeight: '14px',
                                                color: '#ffffff',
                                                textTransform: 'uppercase',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {item.discount}% OFF
                                        </span>
                                        {/* Ribbon fold triangle */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: '100%',
                                                width: 0,
                                                height: 0,
                                                borderStyle: 'solid',
                                                borderWidth: '0 6px 6px 0',
                                                borderColor: 'transparent #183f13 transparent transparent'
                                            }}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* DESKTOP LAYOUT: Beautifully scaled full-viewport height and width flex layout */}
            <div className="hidden lg:flex w-full max-w-[1440px] h-full items-center justify-between px-[100px] gap-[80px]">
                {/* Left Column: Heading and SHOP NOW button with local soft oval dark gradient */}
                <div className="relative flex flex-col gap-[28px] items-start max-w-[650px] shrink-0 lg:-mt-[40px] px-[40px] py-[30px] rounded-full">
                    {/* Soft Dark Oval Gradient Background */}
                    <div 
                        style={{
                            position: 'absolute',
                            inset: '-20px -30px',
                            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
                            borderRadius: '100%',
                            filter: 'blur(20px)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}
                    />
                    <h1
                        style={{
                            fontFamily: "var(--font-titillium), sans-serif",
                            fontSize: '56px',
                            fontWeight: 900,
                            lineHeight: '76px',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            textAlign: 'left',
                            position: 'relative',
                            zIndex: 1
                        }}
                        className="text-[#ffffff]"
                    >
                        MEET THE{' '}
                        <span 
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(0, 0, 0, 0.06)',
                                padding: '10px',
                                transform: 'rotate(-15deg) translateY(-5px)',
                                transformOrigin: 'center',
                                verticalAlign: 'middle',
                                marginLeft: '16px',
                                marginRight: '8px'
                            }}
                        >
                            <svg 
                                width="34" 
                                height="34" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                style={{
                                    color: '#3f9733'
                                }}
                            >
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
                        </span>
                        <br />BEST PLATFORM FOR YOUR <br />DAILY NEEDS &{' '}
                        <span style={{ color: '#95FF00' }}>
                            ESSENTIALS{' '}
                            <span 
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(0, 0, 0, 0.06)',
                                    padding: '10px',
                                    transform: 'rotate(15deg) translateY(-5px)',
                                    transformOrigin: 'center',
                                    verticalAlign: 'middle',
                                    marginLeft: '16px',
                                    marginRight: '8px'
                                }}
                            >
                                <svg 
                                    width="34" 
                                    height="34" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    style={{
                                        color: '#3f9733'
                                    }}
                                >
                                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                                    <path d="m8.5 8.5 7 7"/>
                                </svg>
                            </span>
                        </span>
                    </h1>
                    <Link
                        href="/search"
                        className="relative flex h-[56px] w-[150px] shrink-0 items-center justify-center gap-[10px] bg-[#ffffff] rounded-none transition-all hover:bg-[#f8fafc] hover:scale-[1.03] active:scale-95"
                        style={{ zIndex: 2 }}
                    >
                        <span className="font-titillium text-[18px] font-[700] leading-none tracking-[-0.4px] text-[#308026] whitespace-nowrap">
                            SHOP NOW
                        </span>
                    </Link>
                </div>

                {/* Right Column: Premium grid showing Today's Deals dynamically */}
                <div className="flex flex-col items-end shrink-0">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '16px 24px',
                            borderRadius: '0px',
                            backdropFilter: 'blur(12px)',
                            width: '520px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div className="animate-marquee-ltr">
                            {[...displayDeals, ...displayDeals].map((item, index) => {
                                const leftPositions = ['45px', '42px', '45px'];
                                const badgeLeft = leftPositions[index % 3];
                                return (
                                    <Link
                                        key={`${item.id}-${index}`}
                                        href={`/product/${item.id}`}
                                        style={{
                                            display: 'flex',
                                            width: '115px',
                                            height: '125px',
                                            padding: '14px 8px 8px 8px',
                                            gap: '10px',
                                            alignItems: 'center',
                                            flexShrink: 0,
                                            flexWrap: 'nowrap',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '5px',
                                            position: 'relative'
                                        }}
                                        className="transition-all hover:scale-[1.05] active:scale-95"
                                    >
                                        <div
                                            style={{
                                                minWidth: 0,
                                                minHeight: 0,
                                                alignSelf: 'stretch',
                                                flexGrow: 1,
                                                flexShrink: 0,
                                                flexBasis: 0,
                                                position: 'relative'
                                            }}
                                        >
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                sizes="99px"
                                                className="object-contain"
                                            />
                                        </div>
                                        {/* 3D Wrapped Discount Ribbon */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                padding: '3px 6px 3px 8px',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#308026',
                                                borderTopRightRadius: '6px',
                                                borderBottomRightRadius: '6px',
                                                position: 'absolute',
                                                top: '10px',
                                                left: '-6px',
                                                zIndex: 10
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: "var(--font-titillium), sans-serif",
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    lineHeight: '14px',
                                                    color: '#ffffff',
                                                    textTransform: 'uppercase',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {item.discount}% OFF
                                            </span>
                                            {/* Ribbon fold triangle */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '100%',
                                                    width: 0,
                                                    height: 0,
                                                    borderStyle: 'solid',
                                                    borderWidth: '0 6px 6px 0',
                                                    borderColor: 'transparent #183f13 transparent transparent'
                                                }}
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeHero;
