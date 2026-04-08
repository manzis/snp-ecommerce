'use client';

import React from 'react';
import HelpIcon from '@/components/icons/HelpIcon';

interface OrderActionsProps {
    isCancellable: boolean;
}

export default function OrderActions({ isCancellable }: OrderActionsProps) {
    return (
        <div className="flex w-full items-center justify-between">
            <button className="flex h-[40px] w-fit items-center justify-center gap-[4px] rounded-[8px] border border-[#f1f5f9] px-[10px] hover:bg-gray-50 transition-colors">
                <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                    <HelpIcon className="h-full w-full text-[#242424]" />
                </div>
                <span className="font-titillium text-[14px] font-[600] leading-[26px] tracking-[-0.03px] text-[#242424]">
                    Help with order
                </span>
            </button>
            {isCancellable && (
                <button className="flex h-[40px] w-fit items-center justify-center gap-[4px] rounded-[8px] border border-[#f1f5f9] px-[10px] hover:bg-red-50 transition-colors">
                    <span className="font-titillium text-[14px] font-[600] leading-[26px] tracking-[-0.03px] text-[#b64040]">
                        Cancel Order
                    </span>
                </button>
            )}
        </div>
    );
}