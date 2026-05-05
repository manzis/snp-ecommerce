'use client';

import React from 'react';
import Image from 'next/image';

interface OtherShipmentItemsProps {
    items: any[];
    total: number;
}

export default function OtherShipmentItems({ items, total }: OtherShipmentItemsProps) {
    if (!items || items.length <= 1) return null;

    // Skip the first item as it's shown in PrimaryOrderDetails
    const otherItems = items.slice(1);

    return (
        <section className="flex flex-col items-start gap-[16px] rounded-[16px] border border-[#e2e8f0] p-[16px]">
            <div className="flex flex-col gap-[16px] w-full">
                <div className="flex h-[32px] w-fit items-center justify-center gap-[10px] rounded-[6px] bg-[#f4ffeb] px-[8px]">
                    <h4 className="font-titillium text-[14px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                        Other Items in this shipment
                    </h4>
                </div>

                <ul className="flex flex-col gap-[20px] w-full">
                    {otherItems.map((item, idx) => (
                        <li key={idx} className="flex w-full items-center gap-[12px]">
                            <div className="relative flex h-[62px] w-[55px] shrink-0 items-center justify-center rounded-[6px] border border-[#e2e8f0] p-[6px]">
                                <div className="relative h-full w-full">
                                    <Image
                                        src={item.products?.images?.[0] || "/images/protein.webp"}
                                        alt={item.products?.name}
                                        fill
                                        className="object-contain"
                                        sizes="55px"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col gap-[4px]">
                                <div className="flex flex-col gap-[1px]">
                                    <span className="font-titillium text-[10px] font-[400] leading-[12px] text-[#242424]/80 uppercase">
                                        {item.products?.brands?.name || 'SNP Nutrition'}
                                    </span>
                                    <span className="font-titillium text-[12px] font-[600] leading-[18px] tracking-[0.2px] text-[#242424] line-clamp-1">
                                        {item.products?.name}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-[13px]">
                                    {item.selected_size && (
                                        <span className="font-titillium text-[12px] font-[400] leading-[16px] text-[#8a8e91]">Size : {item.selected_size}</span>
                                    )}
                                    {item.selected_flavor && (
                                        <span className="font-titillium text-[12px] font-[400] leading-[16px] text-[#8a8e91]">Flavour : {item.selected_flavor}</span>
                                    )}
                                    <span className="font-titillium text-[12px] font-[400] leading-[16px] text-[#8a8e91]">Qty : {item.quantity}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex w-full items-center justify-between border-t border-[#e2e8f0] pt-[16px]">
                <div className="flex flex-col items-start">
                    <span className="font-titillium text-[12px] font-[400] leading-[16px] tracking-[0.2px] text-[#8b8e92]">
                        Total Amount
                    </span>
                    <span className="font-titillium text-[16px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                        NPR {total}
                    </span>
                </div>

                <button
                    onClick={() => document.getElementById('price-details-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex h-[32px] items-center justify-center gap-[4px] rounded-[6px]  px-[12px] bg-white transition-colors hover:bg-[#308026]/5"
                >
                    <span className="font-titillium text-[13px] font-[600] text-[#308026]">
                        View Price Breakup
                    </span>
                </button>
            </div>
        </section>
    );
}
