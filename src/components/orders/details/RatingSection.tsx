'use client';

import React from 'react';
import RightBackIcon from '@/components/icons/RightBackIcon';
import LikeIcon from '@/components/icons/LikeIcon';

export default function RatingSection() {
    return (
        <section className="flex w-full flex-col items-center justify-center bg-[#ffffff] py-[20px] px-[24px]">
            <div className="flex w-full flex-col gap-[16px] items-start">
                <h2 className="font-titillium text-[18px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                    Rate your Experience
                </h2>
                <button className="flex w-full items-center justify-between rounded-[12px] bg-[#eaffcc] p-[14px_16px] hover:bg-[#e0fbba] transition-colors">
                    <div className="flex items-center gap-[12px]">
                        <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
                            <LikeIcon className="h-full w-full text-[#242424]" />
                        </div>
                        <span className="font-titillium text-[16px] font-[400] leading-[18px] tracking-[-0.64px] text-[#242424]">
                            Did your find this page Helpful?
                        </span>
                    </div>
                    <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                        <RightBackIcon className="h-full w-full text-[#242424]" />
                    </div>
                </button>
            </div>
        </section>
    );
}