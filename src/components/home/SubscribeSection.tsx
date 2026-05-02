"use client"

import React from 'react';
import Image from 'next/image';
import RedirectIcon from '@/components/icons/RedirectIcon';

const SubscribeSection: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic for subscription
    };

    return (
        <section className="relative mx-auto w-full px-[12px] lg:max-w-[1440px] my-[32px] lg:my-[64px]">
            {/* Added relative and overflow-hidden to the main green container for the absolute image */}
            <div className="relative flex flex-col gap-[24px] rounded-[28px] border-r-[4px] border-b-[4px] border-[#387830] bg-[#3f9633] px-[24px] py-[28px] lg:flex-col lg:items-start lg:justify-center lg:gap-[36px] lg:px-[64px] lg:py-[48px] lg:h-[380px] overflow-hidden">

                {/* TEXT CONTENT */}
                <div className="relative z-10 flex flex-col gap-[12px] lg:gap-[16px]">
                    <h2 className="max-w-[294px] font-custom text-[22px] font-[400] leading-[32px] text-white lg:max-w-[500px] lg:text-[36px] lg:leading-[44px]">
                        Stay Home and get your daily needs from our shop !
                    </h2>
                    <p className="max-w-[281px] font-titillium text-[16px] font-[400] leading-[20px] tracking-[-0.06px] text-white lg:max-w-none lg:text-[18px]">
                        Subscribe to our news letter today !
                    </p>
                </div>

                {/* SUBSCRIPTION FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="relative z-10 flex w-full items-center lg:max-w-[450px]"
                >
                    <div className="relative flex h-[60px] w-full items-center overflow-hidden rounded-full bg-white p-[6px]">
                        {/* INPUT FIELD */}
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            className="h-full w-full bg-transparent px-[16px] font-titillium text-[15px] font-[400] text-[#242424] outline-none placeholder:text-[#979797]"
                        />
                    </div>

                    {/* SUBSCRIBE BUTTON */}
                    <button
                        type="submit"
                        className="flex h-[60px] w-[115px] shrink-0 items-center justify-center gap-[8px] rounded-[100px] bg-[#ffe900] px-[16px] transition-transform duration-200 hover:brightness-105 active:scale-95"
                    >
                        <span className="font-titillium text-[14px] font-[600] leading-[24px] text-black">
                            Subscribe
                        </span>
                        <div className="h-[16px] w-[16px] shrink-0">
                            <RedirectIcon className="h-full w-full text-black" />
                        </div>
                    </button>
                </form>

                {/* DESKTOP ONLY TRANSPARENT IMAGE PLACEHOLDER */}
                <div className="hidden lg:block absolute right-[20px] bottom-[40px] h-full w-[450px] pointer-events-none">
                    <Image
                        src="/images/subscription-banner.png"
                        alt="Subscribe Rewards"
                        fill
                        className="object-contain object-right-bottom"
                        sizes="(max-width: 1024px) 100vw, 450px"
                        priority
                    />
                </div>
            </div>
        </section>
    );
};

export default SubscribeSection;