'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HelpIcon from '@/components/icons/HelpIcon';
import TickIcon from '@/components/icons/TickIcon';
import { StatusUpdateLog, OrderStatus, STATUS_CONFIG } from '@/components/orders/OrderCard';

interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    statusUpdates: StatusUpdateLog[];
    carrierName?: string;
    trackingNumber?: string;
    currentStatus: OrderStatus;
}

const ChevronIcon = ({ className, rotated }: { className?: string; rotated?: boolean }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`${className} transition-transform duration-300 ${rotated ? 'rotate-180' : 'rotate-0'}`}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M6 9l6 6 6-6" />
    </svg>
);

// --- Configuration & Constants ---

const STATUS_RANK: Record<string, number> = {
    'PENDING': 1, 'CONFIRMED': 2, 'PROCESSING': 3,
    'SHIPPED': 4, 'IN_TRANSIT': 5, 'SCHEDULED': 6,
    'OUT_FOR_DELIVERY': 7, 'DELIVERED': 8,
    'RETURNED': 8, 'FAILED': 8, 'CANCELLED': 8
};

const GET_PROGRESS_CONFIG = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return { color: 'bg-[#308026]', hex: '#308026' };
        case 'CONFIRMED': return { color: 'bg-[#308026]', hex: '#308026' };
        case 'PROCESSING': return { color: 'bg-[#308026]', hex: '#308026' };
        case 'SHIPPED': return { color: 'bg-[#308026]', hex: '#308026' };
        case 'IN_TRANSIT': return { color: 'bg-[#A16207]', hex: '#A16207' };
        case 'SCHEDULED': return { color: 'bg-[#A16207]', hex: '#A16207' };
        case 'OUT_FOR_DELIVERY': return { color: 'bg-[#308026]', hex: '#308026' };
        case 'DELIVERED': return { color: 'bg-[#308026]', hex: '#308026' };
        case 'RETURNED': return { color: 'bg-[#A16207]', hex: '#A16207' };
        case 'FAILED': return { color: 'bg-[#d92d20]', hex: '#d92d20' };
        case 'CANCELLED': return { color: 'bg-[#d92d20]', hex: '#d92d20' };
        default: return { color: 'bg-[#308026]', hex: '#308026' };
    }
};

// --- Professional Tracking Sub-Components ---

const TimelineDot = ({ 
    isActive, 
    isLatest, 
    glowColor, 
    size = 'small',
    progressColor
}: { 
    isActive: boolean; 
    isLatest: boolean; 
    glowColor: string;
    size?: 'small' | 'large';
    progressColor: string;
}) => {
    const isRed = glowColor === '#d92d20';
    const shouldGlow = isLatest && !isRed;
    const isLarge = size === 'large';
    const dotDimension = isLarge ? '18px' : '8px';
    const containerWidth = '40px';
    // Center at 30px (Axis is 29-31px): Offset = 30 - 60 - (40/2) = -30 - 20 = -50px
    const leftOffset = 'left-[-50px]';

    return (
        <div 
            className={`absolute ${leftOffset} inset-y-0 flex items-center justify-center z-30`}
            style={{ width: containerWidth }}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={shouldGlow ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                        `0 0 0 2px white, 0 0 0 5px ${glowColor}00`,
                        `0 0 0 2px white, 0 0 0 10px ${glowColor}33`,
                        `0 0 0 2px white, 0 0 0 5px ${glowColor}00`
                    ]
                } : { scale: 1 }}
                transition={shouldGlow ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                style={isLatest ? { 
                    boxShadow: `0 0 0 2px white, 0 0 0 5px ${glowColor}`,
                    width: dotDimension,
                    height: dotDimension
                } : { 
                    outline: '2px solid white',
                    width: dotDimension,
                    height: dotDimension
                }}
                className={`flex items-center justify-center rounded-full ${isActive ? progressColor : 'bg-[#e2e8f0]'}`}
            >
                {isActive && isLarge && <TickIcon className="h-[10px] w-[10px] text-white" />}
            </motion.div>
        </div>
    );
};

const TimelineSegment = ({ 
    isActive, 
    isFirst, 
    isLast, 
    progressColor 
}: { 
    isActive: boolean; 
    isFirst: boolean; 
    isLast: boolean; 
    progressColor: string;
}) => {
    // We extend the top/bottom overlap to close gaps between milestones (mb-12)
    const segmentStyle = {
        top: isFirst ? '50%' : '-16px', 
        bottom: isLast ? '50%' : '-16px'
    };

    return (
        <div className="absolute left-[-31px] w-[2px] z-10" style={segmentStyle}>
            {isActive && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.4 }}
                    className={`h-full w-full ${progressColor} origin-top`}
                />
            )}
        </div>
    );
};

// --- State Reconciliation Hook ---

function useTrackingReconciliation(statusUpdates: StatusUpdateLog[], currentStatus: OrderStatus) {
    return React.useMemo(() => {
        const currentRank = STATUS_RANK[currentStatus] || 0;
        
        const isMilestoneActive = (id: string) => {
            if (id === 'ORDERED') return true;
            if (id === 'SHIPPED') return currentRank >= 4;
            if (id === 'DELIVERY') return currentRank >= 8;
            return false;
        };

        const getFinalLabel = () => {
            if (currentStatus === 'CANCELLED') return 'Order Cancelled';
            if (currentStatus === 'RETURNED') return 'Order Returned';
            if (currentStatus === 'FAILED') return 'Delivery Failed';
            return 'Delivery';
        };

        const groups: { id: string; label: string; isActive: boolean; isCompleted: boolean; logs: any[] }[] = [];

        // Build Phases
        const phases = [
            { id: 'ORDERED', label: 'Order Placed', statusRange: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
            { id: 'SHIPPED', label: 'Shipped', statusRange: ['SHIPPED', 'IN_TRANSIT', 'SCHEDULED', 'OUT_FOR_DELIVERY'] },
            { id: 'DELIVERY', label: getFinalLabel(), statusRange: ['DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'] }
        ];

        phases.forEach(phase => {
            const phaseLogs: any[] = [];
            
            phase.statusRange.forEach(s => {
                const existing = statusUpdates.find(u => u.status === s);
                if (existing) {
                    phaseLogs.push({ id: `log-${s}`, data: existing, isActive: true, status: s });
                } else if (currentRank >= (STATUS_RANK[s] || 0) && phase.id !== 'DELIVERY') {
                    // Logic for Virtualization: Only virtualize non-terminal steps
                    phaseLogs.push({ 
                        id: `virtual-${s}`, 
                        data: { status: s, message: STATUS_CONFIG[s as OrderStatus]?.text || s, date: new Date().toISOString() }, 
                        isActive: true,
                        status: s
                    });
                }
            });

            // Special Terminal Logic for Phase 3
            if (phase.id === 'DELIVERY' && phaseLogs.length === 0 && ['DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED'].includes(currentStatus)) {
                const finalLog = statusUpdates.find(u => u.status === currentStatus);
                if (finalLog) phaseLogs.push({ id: `log-final`, data: finalLog, isActive: true, status: currentStatus });
            }

            // Milestone is COMPLETED only if the current rank has moved PAST its status range
            const isCompleted = (id: string) => {
                if (id === 'ORDERED') return currentRank >= 4;
                if (id === 'SHIPPED') return currentRank >= 8;
                return false;
            };

            groups.push({ 
                id: phase.id, 
                label: phase.label, 
                isActive: isMilestoneActive(phase.id), 
                isCompleted: isCompleted(phase.id),
                logs: phaseLogs 
            });
        });

        const flatElements = groups.flatMap(g => [
            { type: 'milestone', id: g.id, label: g.label, isActive: g.isActive },
            ...g.logs.map(l => ({ type: 'log', ...l }))
        ]);
        
        const latestActiveIndex = flatElements.reduce((acc, el, idx) => el.isActive ? idx : acc, -1);

        return { groups, flatElements, latestActiveIndex };
    }, [statusUpdates, currentStatus]);
}

export default function TrackingModal({ isOpen, onClose, statusUpdates, carrierName, trackingNumber, currentStatus }: TrackingModalProps) {
    const [mounted, setMounted] = useState(false);
    
    const reconciliation = useTrackingReconciliation(statusUpdates, currentStatus);
    const progress = GET_PROGRESS_CONFIG(currentStatus);

    const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(() => {
        // Default to opening the LATEST active milestone
        const latestActive = [...reconciliation.groups].reverse().find(g => g.isActive);
        return new Set(latestActive ? [latestActive.id] : ['ORDERED']);
    });

    const toggleMilestone = (id: string) => {
        setExpandedMilestones(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100dvw';
            document.body.style.overflow = 'hidden';
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/40 backdrop-blur-md p-[12px] md:p-[24px] md:items-center touch-none overflow-hidden"
            onClick={onClose}
        >
            <div className="flex w-full flex-col items-center max-w-full md:max-w-[440px]">
                {/* Close Button */}
                <div className="flex w-full justify-end mb-[10px]">
                    <button
                        onClick={onClose}
                        className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <HelpIcon className="h-[12px] w-[12px] text-[#242424]" />
                    </button>
                </div>

                {/* Modal Container */}
                <div
                    className="relative flex w-full flex-col items-start gap-[12px] rounded-[16px] bg-[#ffffff] p-[20px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] touch-auto h-[80vh]"
                    onClick={(e) => e.stopPropagation()}
                >



                    {/* Header */}
                    <div className="flex w-full items-center justify-start py-[16px]">
                        <h2 className="font-titillium text-[20px] font-[700] leading-[18px] text-[#242424]">
                            Tracking Details
                        </h2>
                    </div>

                    {/* Tracking Info Box */}
                    <div className="flex w-full flex-col rounded-[12px] bg-[#FCFFF3] border border-[#EDF0E4] pt-[16px] pb-[8px]">
                        <div className="flex w-full items-center">
                            <div className="flex flex-1 flex-col items-start gap-[4px] border-r border-[#e2e8f0] px-[16px]">
                                <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#242424]">
                                    Delivery Partner
                                </span>
                                <span className="font-titillium text-[14px] font-[600] leading-[18px] text-[#242424]">
                                    {carrierName || 'Unknown'}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col items-start gap-[4px] px-[20px]">
                                <span className="w-full font-titillium text-[14px] font-[400] leading-[18px] text-[#242424]">
                                    Tracking Details
                                </span>
                                <div className="flex items-center gap-[4px]">
                                    <span className="font-titillium text-[14px] font-[600] leading-[18px] text-[#242424] max-w-[130px] truncate">
                                        {trackingNumber || 'Unassigned'}
                                    </span>
                                    <div className="h-[16px] w-[16px] shrink-0">
                                        <HelpIcon className="h-full w-full text-[#308026]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Note Section Integrated */}
                        <div className="w-full px-[16px] mt-[12px] pt-[8px] border-t border-[#e2e8f0]/50">
                            <p className="font-titillium text-[10px] font-[400] leading-[15px] text-[#626262]">
                                <span className="font-[600]">Note:</span> Career details are only available once the product has been shipped or Dispatch from the warehouse !
                            </p>
                        </div>
                    </div>

                    {/* Information Banner */}
                    <div className="flex w-full items-start gap-[10px] rounded-[12px] bg-[#3f9633] p-[8px_16px] md:items-center">
                        <div className="mt-[2px] h-[14px] w-[14px] shrink-0 md:mt-0">
                            <HelpIcon className="h-full w-full text-white" />
                        </div>
                        <span className="flex-1 font-titillium text-[13px] font-[400] leading-[18px] text-[#ffffff]">
                            This is the same tracking information our customer support can access
                        </span>
                    </div>

                    {/* Detailed Timeline Area */}
                    <div className="flex w-full flex-col flex-1 p-[24px_24px_20px] overflow-y-auto scrollbar-hide">
                        {statusUpdates.length === 0 ? (
                            <div className="w-full text-center py-4 font-titillium text-[14px] text-[#626262]">
                                No tracking updates available yet.
                            </div>
                        ) : (
                            <div className="flex flex-col w-full relative pl-[60px]">
                                {/* Unified Vertical Axis - Snapped to terminal dot centers (18px = center of 36px header) */}
                                <div className="absolute left-[29px] top-[18px] bottom-[18px] w-[2px] bg-[#e2e8f0]" />

                                {reconciliation.groups.map((group) => {
                                    const isExpanded = expandedMilestones.has(group.id);
                                    const milestoneIdx = reconciliation.flatElements.findIndex(el => el.type === 'milestone' && el.id === group.id);
                                    
                                    return (
                                        <div key={group.id} className="flex flex-col w-full mb-[12px]">
                                            {/* Milestone Header */}
                                            <div
                                                className={`relative flex items-center justify-between w-full h-[36px] ${group.isCompleted ? 'bg-[#ECF7E8]' : 'bg-[#f8fafc]'} rounded-[10px] px-[12px] cursor-pointer hover:bg-gray-100 transition-colors z-20`}
                                                onClick={() => toggleMilestone(group.id)}
                                            >
                                                <TimelineSegment 
                                                    isActive={group.isActive}
                                                    isFirst={milestoneIdx === 0}
                                                    isLast={milestoneIdx === reconciliation.flatElements.length - 1}
                                                    progressColor={progress.color}
                                                />

                                                <TimelineDot 
                                                    size="large"
                                                    isActive={group.isActive}
                                                    isLatest={milestoneIdx === reconciliation.latestActiveIndex}
                                                    glowColor={group.id === 'SHIPPED' ? '#A16207' : progress.hex}
                                                    progressColor={progress.color}
                                                />

                                                <div className="flex items-center gap-[8px]">
                                                    <span className={`font-titillium text-[15px] font-[700] tracking-[0.2px] leading-[1] ${group.isActive ? 'text-[#242424]' : 'text-[#8a8e91]'}`}>
                                                        {group.label}
                                                    </span>
                                                    {group.isActive && (
                                                        <span className="font-titillium text-[11px] font-[600] text-[#8a8e91]">
                                                            {(() => {
                                                                if (group.id === 'DELIVERY' && currentStatus === 'CANCELLED') {
                                                                    return statusUpdates.find(u => u.status === 'CANCELLED')?.message;
                                                                }
                                                                const mStatus = group.id === 'ORDERED' ? 'PENDING' : group.id;
                                                                const log = statusUpdates.find(u => u.status === mStatus || (group.id === 'ORDERED' && u.status === 'CONFIRMED'));
                                                                if (!log) return '';
                                                                const dateStr = new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                                if (group.id === 'ORDERED' || group.id === 'SHIPPED') return `on ${dateStr}`;
                                                                if (group.id === 'DELIVERY') return `Expected by ${dateStr}`;
                                                                return dateStr;
                                                            })()}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronIcon className="h-[16px] w-[16px] text-[#8a8e91]" rotated={isExpanded} />
                                            </div>

                                            {/* Nested Logs */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="overflow-hidden ml-[-60px] pl-[60px]"
                                                    >
                                                        <div className="flex flex-col gap-[6px] mt-[8px]">
                                                            {group.logs.map((log) => {
                                                                const flatElement = reconciliation.flatElements.find(el => el.type === 'log' && el.id === log.id);
                                                                const idx = reconciliation.flatElements.indexOf(flatElement!);
                                                                const isLatest = idx === reconciliation.latestActiveIndex;
                                                                const isLast = idx === reconciliation.flatElements.length - 1;

                                                                return (
                                                                    <div key={log.id} className="relative flex flex-col py-[2px] pl-[12px]">
                                                                        <TimelineSegment 
                                                                            isActive={log.isActive}
                                                                            isFirst={false}
                                                                            isLast={isLast}
                                                                            progressColor={progress.color}
                                                                        />

                                                                        <TimelineDot 
                                                                            isActive={log.isActive}
                                                                            isLatest={isLatest}
                                                                            glowColor={progress.hex}
                                                                            progressColor={progress.color}
                                                                        />

                                                                        <div className="flex flex-col items-start gap-[2px]">
                                                                            <span className={`font-titillium text-[12px] font-[700] tracking-[0.2px] ${log.isActive ? 'text-[#4a4a4a]' : 'text-[#8a8e91]'}`}>
                                                                                {log.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                                                            </span>
                                                                            <p className="font-titillium text-[11px] font-[400] leading-[15px] text-[#575757]">
                                                                                {log.data.message}
                                                                            </p>
                                                                            <span className="font-titillium text-[10px] font-[400] text-[#8a8e91] opacity-70">
                                                                                {new Date(log.data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(log.data.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}