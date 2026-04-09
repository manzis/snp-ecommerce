'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import HelpIcon from '@/components/icons/HelpIcon';
import PackageIcon from '@/components/icons/PackageIcon';
import TickIcon from '@/components/icons/TickIcon';
import { OrderProps, STATUS_CONFIG } from '@/components/orders/OrderCard';
import TrackingModal from '@/components/orders/details/TrackingModal';

interface PrimaryOrderDetailsProps {
    order: OrderProps;
}

const GET_PROGRESS_CONFIG = (status: OrderProps['status']) => {
    switch (status) {
        case 'PENDING': return { width: '5%', color: 'bg-[#308026]', label1: 'Order Pending' };
        case 'CONFIRMED': return { width: '20%', color: 'bg-[#308026]', label1: 'Order Confirmed' };
        case 'PROCESSING': return { width: '40%', color: 'bg-[#308026]', label1: 'Processing' };
        case 'SHIPPED': return { width: '50%', color: 'bg-[#308026]', label1: 'Order Shipped', label2: 'Shipped' };
        case 'IN_TRANSIT': return { width: '70%', color: 'bg-[#A16207]', label1: 'Order Confirmed', label2: 'In Transit' };
        case 'SCHEDULED': return { width: '75%', color: 'bg-[#A16207]', label1: 'Order Confirmed', label2: 'Scheduled' };
        case 'OUT_FOR_DELIVERY': return { width: '85%', color: 'bg-[#308026]', label1: 'Order Confirmed', label3: 'Out for Delivery' };
        case 'DELIVERED': return { width: '100%', color: 'bg-[#308026]', label1: 'Order Confirmed', label3: 'Delivered' };
        case 'RETURNED': return { width: '100%', color: 'bg-[#A16207]', label1: 'Order Confirmed', label3: 'Order Returned' };
        case 'FAILED': return { width: '100%', color: 'bg-[#d92d20]', label1: 'Order Confirmed', label3: 'Delivery Failed' };
        case 'CANCELLED': return { width: '100%', color: 'bg-[#d92d20]', label1: 'Order Pending', label3: 'Cancelled' };
        default: return { width: '0%', color: 'bg-[#308026]', label1: 'Order Placed' };
    }
};

export default function PrimaryOrderDetails({ order }: PrimaryOrderDetailsProps) {
    const [mounted, setMounted] = useState(false);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    useEffect(() => {
        // Trigger mounting animation shortly after mount for smoothest CSS transition
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const config = STATUS_CONFIG[order.status];
    const progress = GET_PROGRESS_CONFIG(order.status);

    // Status Groups
    const isGreenGroup = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);

    // Resolve Latest Dynamic Update
    const latestUpdate = order.statusUpdates && order.statusUpdates.length > 0 
        ? order.statusUpdates[order.statusUpdates.length - 1] 
        : null;

    const displayUpdateMessage = latestUpdate 
        ? latestUpdate.message 
        : (order.status === 'CANCELLED' && order.cancellationReason
            ? `Cancellation processed. Reason: ${order.cancellationReason}`
            : 'Order placed securely.');
            
    const displayUpdateDate = latestUpdate 
        ? new Date(latestUpdate.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : order.dateText.replace(/^.*? on /i, '');
    const isYellowGroup = ['SHIPPED', 'IN_TRANSIT', 'SCHEDULED', 'RETURNED'].includes(order.status);
    const isRedGroup = ['FAILED', 'CANCELLED'].includes(order.status);

    // Node States
    const isNode1Active = true; 
    const isNode2Active = ['SHIPPED', 'IN_TRANSIT', 'SCHEDULED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'FAILED', 'CANCELLED'].includes(order.status);
    const isNode3Active = ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'FAILED', 'CANCELLED'].includes(order.status);

    return (
        <div className="flex flex-col gap-[24px] relative z-[2]">
            <div className="flex flex-col gap-[12px] relative z-[3]">
                <div className="flex w-full items-center gap-[16px] min-h-[76px]">
                    {/* Product Image */}
                    <div className="relative flex h-[76px] w-[65px] shrink-0 items-center justify-center rounded-[6px] border border-[#e2e8f0] p-[6px]">
                        <div className="relative h-full w-full">
                            <Image
                                src={order.image}
                                alt={order.title}
                                fill
                                className="object-contain"
                                sizes="65px"
                            />
                        </div>
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-1 flex-col items-start">
                        <div className="flex w-full flex-col items-start pb-[2px]">
                            <div className="flex w-full flex-col items-start gap-[2px] pb-[4px]">
                                <span className="font-titillium text-[12px] font-[400] leading-[18px] text-[#242424]/80 uppercase">
                                    {order.brand}
                                </span>
                                <h2 className="font-titillium text-[16px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                                    {order.title}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-[13px]">
                            <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#8a8e91]">Size : {order.size}</span>
                            <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#8a8e91]">Flavour : {order.flavour}</span>
                            <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#8a8e91]">Qty : 1</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start gap-[6px]">
                <div className="flex items-center gap-[6px]">
                    <span className="font-titillium text-[14px] font-[400] leading-[30px] text-[#242424]/40 text-right">
                        ORDER ID: #{order.shortId}
                    </span>
                    <div className="flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                        <HelpIcon className="h-full w-full text-[#8a8e91]" />
                    </div>
                </div>

                <div className="flex w-full flex-col justify-between items-start gap-[24px] rounded-[20px] bg-[#ffffff] p-[12px] md:h-auto border border-[#f1f5f9]">
                    <div className="flex w-full flex-col gap-[24px]">
                        <div className="flex w-full flex-col px-[6px] py-[4px]">
                            <span className="w-full text-left font-titillium text-[11px] font-[400] leading-[14px] text-[#242424]/40">
                                {order.dateText}
                            </span>
                            <div className="flex w-full items-center justify-between mt-[4px]">
                                <div className="flex flex-col justify-center items-start">
                                    <h3 className={`font-titillium text-[18px] font-[700] leading-[30px] ${config.color}`}>
                                        {config.text}
                                    </h3>
                                    <div className="flex flex-col mt-[2px]">
                                        <p className="font-titillium text-[13px] font-[500] leading-[18px] text-[#242424]">
                                            Update: <span className="font-[400] opacity-80">{displayUpdateMessage}</span>
                                        </p>
                                        <span className="font-titillium text-[11px] font-[400] leading-[14px] text-[#8a8e91] mt-[2px]">
                                            {displayUpdateDate}
                                        </span>
                                    </div>
                                </div>
                                <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] ${config.bg}`}>
                                    <PackageIcon className={`h-[24px] w-[24px] ${config.iconColor}`} />
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-[10px] px-[6px]">
                            {/* Timeline Graphic */}
                            <div className="relative flex h-[20px] w-full items-center">
                                {/* Base Track */}
                                <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-[#e2e8f0]"></div>
                                {/* Active Progress Bar */}
                                <div
                                    className={`absolute left-0 top-1/2 h-[3px] -translate-y-1/2 transition-all duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${progress.color}`}
                                    style={{ width: mounted ? progress.width : '0%' }}
                                ></div>

                                <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 justify-between">
                                    {/* Node 1: Ordered */}
                                    <div className={`flex items-center justify-center h-[18px] w-[18px] rounded-full outline outline-3 outline-white relative z-10 ${isNode1Active ? progress.color : 'bg-white border-2 border-[#e2e8f0]'}`}>
                                        {isNode1Active && <TickIcon className="h-[10px] w-[10px] text-white" />}
                                    </div>

                                    {/* Node 2: Shipped/In Transit */}
                                    <div className={`flex items-center justify-center h-[18px] w-[18px] rounded-full outline outline-3 outline-white relative z-10 ${isNode2Active ? progress.color : 'bg-white border-2 border-[#e2e8f0]'}`}>
                                        {isNode2Active && <TickIcon className="h-[10px] w-[10px] text-white" />}
                                    </div>

                                    {/* Node 3: Delivered/Final State */}
                                    <div className="relative flex items-center justify-center">
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <div className="absolute inset-[-6px] rounded-full bg-[#308026]/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] z-0"></div>
                                        )}
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <div className="absolute inset-[-3px] rounded-full bg-[#308026]/20 animate-pulse z-0"></div>
                                        )}
                                        <div className={`flex items-center justify-center h-[18px] w-[18px] rounded-full outline outline-3 outline-white relative z-10 ${isNode3Active ? progress.color : 'bg-white border-2 border-[#e2e8f0]'}`}>
                                            {isNode3Active && (
                                                order.status === 'OUT_FOR_DELIVERY' ? (
                                                    <div className="h-[6px] w-[6px] rounded-full bg-white"></div>
                                                ) : (
                                                    <TickIcon className="h-[10px] w-[10px] text-white" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Labels */}
                            <div className="flex w-full justify-between items-center">
                                <div className="flex flex-1 flex-col items-start">
                                    <span className={`font-titillium text-[13px] font-[600] leading-[18px] ${isNode1Active ? 'text-[#242424]' : 'text-[#8a8e91]'}`}>
                                        {progress.label1 || 'Ordered'}
                                    </span>
                                    <span className="font-titillium text-[11px] font-[400] leading-[18px] text-[#626262]">Apr 03</span>
                                </div>
                                <div className="flex flex-1 flex-col items-center">
                                    <span className={`font-titillium text-[13px] font-[600] leading-[18px] text-center ${isNode2Active ? 'text-[#242424]' : 'text-[#8a8e91]'}`}>
                                        {progress.label2 || 'Shipped'}
                                    </span>
                                    <span className="font-titillium text-[11px] font-[400] leading-[18px] text-[#626262] text-center">Apr 04</span>
                                </div>
                                <div className="flex flex-1 flex-col items-end">
                                    <span className={`font-titillium text-[13px] font-[600] leading-[18px] text-right ${isNode3Active ? 'text-[#242424]' : 'text-[#8a8e91]'}`}>
                                        {progress.label3 || 'Delivery'}
                                    </span>
                                    <span className="font-titillium text-[11px] font-[400] leading-[18px] text-[#626262] text-right">
                                        {order.status === 'DELIVERED'
                                            ? 'Apr 04'
                                            : order.status === 'OUT_FOR_DELIVERY'
                                                ? 'Expected today'
                                                : 'Expected soon'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-[12px] w-full mt-[12px]">
                        <button 
                            onClick={() => setIsTrackingModalOpen(true)}
                            className="flex h-[42px] w-full items-center justify-center gap-[10px] rounded-[12px] bg-[#ffe900] py-[12px] transition-transform active:scale-[0.98] hover:bg-[#ffe000]"
                        >
                            <span className="font-titillium text-[16px] font-[600] leading-[22px] tracking-[-0.2px] text-[#242424]">
                                See all updates
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <TrackingModal 
                isOpen={isTrackingModalOpen} 
                onClose={() => setIsTrackingModalOpen(false)} 
                statusUpdates={order.statusUpdates || []}
                carrierName={order.carrierName}
                trackingNumber={order.trackingNumber}
                currentStatus={order.status}
            />
        </div>
    );
}
