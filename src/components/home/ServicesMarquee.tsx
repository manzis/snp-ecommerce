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
        className={`service-item flex h-[100px] lg:h-[280px] shrink-0 flex-col justify-center items-start gap-[2px] lg:gap-[12px] px-[24px] lg:px-[48px] py-[12px] border-r border-[#e2e8f0] ${bgColor} select-none transition-all`}
        style={{ 
            '--item-width-mobile': width.mobile,
            '--item-width-desktop': width.desktop 
        } as React.CSSProperties}
    >
        <div className="relative h-[24px] w-[24px] lg:h-[60px] lg:w-[60px] shrink-0 pointer-events-none">
            <Image
                src={`/images/icons/${icon}`}
                alt={title}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 24px, 60px"
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
        { title: "Cash on Delivery", icon: "cod.webp", width: { mobile: "198px", desktop: "400px" } },
        { title: "Easy Returns", icon: "moneyback.webp", bgColor: "bg-[#eaffe8]", width: { mobile: "165px", desktop: "350px" } },
    ];

    const row2 = [
        { title: "Trusted", icon: "trusted.png", bgColor: "bg-[#3f9633]", textColor: "text-white", width: { mobile: "154px", desktop: "320px" } },
        { title: "Authenticity Guarantee", icon: "authentic.webp", width: { mobile: "200px", desktop: "450px" } },
        { title: "Vast Options", icon: "options.png", bgColor: "bg-[#ffe900]", width: { mobile: "200px", desktop: "420px" } },
    ];

    // Reduced repetition for desktop (3 repeats is enough for seamless 1440px loop)
    const fullRow1 = [...row1, ...row1, ...row1];
    const fullRow2 = [...row2, ...row2, ...row2];

    return (
        <section className="relative mx-auto w-full overflow-hidden bg-white  lg:py-[60px] touch-pan-y">

            {/* All keyframe/style CSS moved to globals.css — no more dangerouslySetInnerHTML */}

            {/* MAX WIDTH CONTAINER FOR DESKTOP */}
            <div className="relative mx-auto max-w-[1440px] flex flex-col border-y border-[#e2e8f0] services-marquee-mask">

                {/* TOP ROW */}
                <div className="relative flex h-[100px] lg:h-[180px] w-full items-center overflow-hidden border-b border-[#e2e8f0]">
                    <div className="marquee-container animate-r1">
                        {fullRow1.map((item, idx) => (
                            <ServiceItem key={`r1-${idx}`} {...item} />
                        ))}
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="relative flex h-[100px] lg:h-[180px] w-full items-center overflow-hidden">
                    <div className="marquee-container animate-r2">
                        {fullRow2.map((item, idx) => (
                            <ServiceItem key={`r2-${idx}`} {...item} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesMarquee;
