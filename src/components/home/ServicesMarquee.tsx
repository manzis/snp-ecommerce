"use client"

import React from 'react';
import Image from 'next/image';

interface ServiceItemProps {
    title: string;
    icon: string;
    bgColor?: string;
    textColor?: string;
    width: { mobile: string; desktop: string }; // Responsive width tokens
}

const ServiceItem: React.FC<ServiceItemProps> = ({ title, icon, bgColor = "bg-white", textColor = "text-[#242424]", width }) => (
    <div
        className={`flex h-[100px] lg:h-[280px] shrink-0 flex-col justify-center items-start gap-[2px] lg:gap-[12px] px-[24px] lg:px-[48px] py-[12px] border-r border-[#e2e8f0] ${bgColor} select-none transition-all`}
        style={{ width: 'var(--item-width)' } as React.CSSProperties}
    >
        {/* CSS Variables used to handle responsive width without layout shift */}
        <style jsx>{`
            div { 
                --item-width: ${width.mobile}; 
            }
            @media (min-width: 1024px) {
                div { --item-width: ${width.desktop}; }
            }
        `}</style>

        <div className="relative h-[24px] w-[24px] lg:h-[60px] lg:w-[60px] shrink-0 pointer-events-none">
            <Image
                src={`/images/icons/${icon}`}
                alt={title}
                fill
                className="object-contain"
            />
        </div>
        <span className={`font-titillium text-[15px] lg:text-[24px] font-[600] leading-[24px] lg:leading-[32px] whitespace-nowrap ${textColor}`}>
            {title}
        </span>
    </div>
);

const ServicesMarquee: React.FC = () => {
    const row1 = [
        { title: "Pre Order", icon: "pre-order.png", bgColor: "bg-[#ecf6ff]", width: { mobile: "198px", desktop: "400px" } },
        { title: "Cash on Delivery", icon: "cod.svg", width: { mobile: "198px", desktop: "400px" } },
        { title: "Easy Returns", icon: "moneyback.svg", bgColor: "bg-[#eaffe8]", width: { mobile: "165px", desktop: "350px" } },
    ];

    const row2 = [
        { title: "Trusted", icon: "trusted.png", bgColor: "bg-[#3f9633]", textColor: "text-white", width: { mobile: "154px", desktop: "320px" } },
        { title: "Authenticity Guarantee", icon: "authentic.svg", width: { mobile: "200px", desktop: "450px" } },
        { title: "Vast Options", icon: "options.png", bgColor: "bg-[#ffe900]", width: { mobile: "200px", desktop: "420px" } },
    ];

    // Reduced repetition for desktop (3 repeats is enough for seamless 1440px loop)
    const fullRow1 = [...row1, ...row1, ...row1];
    const fullRow2 = [...row2, ...row2, ...row2];

    return (
        <section className="relative mx-auto w-full overflow-hidden bg-white  lg:py-[60px] touch-pan-y">

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marqueeRow1 {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-33.33%, 0, 0); }
                }
                @keyframes marqueeRow2 {
                    0% { transform: translate3d(-33.33%, 0, 0); }
                    100% { transform: translate3d(0, 0, 0); }
                }
                .marquee-container {
                    display: flex;
                    width: max-content;
                    will-change: transform;
                    backface-visibility: hidden;
                }
                .animate-r1 { animation: marqueeRow1 40s linear infinite; }
                .animate-r2 { animation: marqueeRow2 45s linear infinite; }
                @media (max-width: 1023px) {
                    .animate-r1 { animation: marqueeRow1 20s linear infinite; }
                    .animate-r2 { animation: marqueeRow2 25s linear infinite; }
                }
            `}} />

            {/* MAX WIDTH CONTAINER FOR DESKTOP */}
            <div className="relative mx-auto max-w-[1440px] flex flex-col border-y border-[#e2e8f0]">

                {/* TOP ROW */}
                <div className="relative flex h-[100px] lg:h-[200px] w-full items-center overflow-hidden border-b border-[#e2e8f0]">
                    <div className="marquee-container animate-r1">
                        {fullRow1.map((item, idx) => (
                            <ServiceItem key={`r1-${idx}`} {...item} />
                        ))}
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="relative flex h-[100px] lg:h-[200px] w-full items-center overflow-hidden">
                    <div className="marquee-container animate-r2">
                        {fullRow2.map((item, idx) => (
                            <ServiceItem key={`r2-${idx}`} {...item} />
                        ))}
                    </div>
                </div>

                {/* CORNER BLUR OVERLAYS - Scaled width for larger desktop items */}
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[120px] lg:w-[250px] backdrop-blur-[16px]"
                    style={{
                        maskImage: 'linear-gradient(to right, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)'
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[120px] lg:w-[250px] backdrop-blur-[16px]"
                    style={{
                        maskImage: 'linear-gradient(to left, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to left, black 0%, rgba(0,0,0,0.6) 40%, transparent 100%)'
                    }}
                />
            </div>
        </section>
    );
};

export default ServicesMarquee;