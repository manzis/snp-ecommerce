import React from 'react';

const OrderCardSkeleton: React.FC = () => {
    return (
        <div className="flex w-full flex-col items-center justify-center bg-white pt-[16px] lg:rounded-[16px] lg:border lg:border-[#f1f5f9] overflow-hidden animate-pulse">
            {/* HEADER SKELETON */}
            <div className="flex w-full items-center px-[24px] pb-[8px]">
                <div className="flex flex-1 items-center gap-[12px]">
                    <div className="h-[40px] w-[40px] rounded-[8px] bg-gray-200"></div>
                    <div className="flex flex-col gap-[4px] flex-1">
                        <div className="h-[20px] w-[140px] bg-gray-200 rounded"></div>
                        <div className="h-[14px] w-[100px] bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>

            {/* BODY SKELETON */}
            <div className="flex w-full items-center gap-[24px] p-[12px_24px_20px_24px] lg:p-[16px_32px_20px_32px]">
                <div className="flex flex-1 items-center">
                    <div className="h-[94px] w-[83px] rounded-[6px] bg-gray-200"></div>
                    <div className="flex flex-1 flex-col items-start pl-[16px] gap-[8px]">
                        <div className="h-[14px] w-[60px] bg-gray-100 rounded"></div>
                        <div className="h-[20px] w-[200px] bg-gray-200 rounded"></div>
                        <div className="flex gap-[12px]">
                            <div className="h-[16px] w-[80px] bg-gray-100 rounded"></div>
                            <div className="h-[16px] w-[80px] bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="h-[16px] w-[16px] bg-gray-200 rounded-full"></div>
            </div>

            {/* FOOTER SKELETON */}
            <div className="flex w-full justify-center px-[24px] lg:px-[32px]">
                <div className="flex flex-col w-full border-t border-[#f1f5f9] pt-[16px] pb-[20px] gap-[12px]">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-[8px]">
                            <div className="h-[32px] w-[100px] bg-gray-200 rounded-[8px]"></div>
                            <div className="h-[32px] w-[80px] bg-gray-200 rounded-[8px]"></div>
                        </div>
                        <div className="h-[16px] w-[100px] bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-[14px] w-full bg-gray-50 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default OrderCardSkeleton;
