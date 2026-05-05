"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TrackModalForm from '@/components/track-order/TrackModalForm';
import CloseIcon from '@/components/icons/CloseIcon2';
import type { OrderProps, OrderStatus, StatusUpdateLog } from '@/components/orders/OrderCard';
import { STATUS_CONFIG } from '@/components/orders/OrderCard';
import CopyIcon from '@/components/icons/CopyIcon';
import InfoIcon from '@/components/icons/InfoIcon';
import TickIcon from '@/components/icons/TickIcon';
import PackageIcon from '@/components/icons/PackageIcon';

// ─── Tracking Details Inline Panel (from TrackingModal) ─────────────────

const ChevronIcon = ({ className, rotated }: { className?: string; rotated?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`${className} transition-transform duration-300 ${rotated ? 'rotate-180' : 'rotate-0'}`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const STATUS_RANK: Record<string, number> = {
  'PENDING': 1, 'CONFIRMED': 2, 'PROCESSING': 3,
  'SHIPPED': 4, 'IN_TRANSIT': 5, 'SHIPMENT_ARRIVED': 6,
  'OUT_FOR_DELIVERY': 7, 'DELIVERED': 8,
  'RETURNED': 8, 'FAILED': 8, 'CANCELLED': 8, 'RESCHEDULED': 8
};

const GET_PROGRESS_CONFIG = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': case 'CONFIRMED': case 'PROCESSING': case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': case 'DELIVERED':
      return { color: 'bg-[#308026]', hex: '#308026' };
    case 'IN_TRANSIT': case 'SHIPMENT_ARRIVED': case 'RETURNED':
      return { color: 'bg-[#A16207]', hex: '#A16207' };
    case 'FAILED': case 'CANCELLED':
      return { color: 'bg-[#d92d20]', hex: '#d92d20' };
    default: return { color: 'bg-[#308026]', hex: '#308026' };
  }
};

const TimelineDot = ({ isActive, isLatest, glowColor, size = 'small', progressColor }: {
  isActive: boolean; isLatest: boolean; glowColor: string; size?: 'small' | 'large'; progressColor: string;
}) => {
  const isRed = glowColor === '#d92d20';
  const shouldGlow = isLatest && !isRed;
  const isLarge = size === 'large';
  const dotDimension = isLarge ? '18px' : '8px';
  return (
    <div className="absolute left-[-50px] inset-y-0 flex items-center justify-center z-30" style={{ width: '40px' }}>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={shouldGlow ? {
          scale: [1, 1.05, 1],
          boxShadow: [`0 0 0 2px white, 0 0 0 5px ${glowColor}00`, `0 0 0 2px white, 0 0 0 10px ${glowColor}33`, `0 0 0 2px white, 0 0 0 5px ${glowColor}00`]
        } : { scale: 1 }}
        transition={shouldGlow ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        style={isLatest ? { boxShadow: `0 0 0 2px white, 0 0 0 5px ${glowColor}`, width: dotDimension, height: dotDimension } : { outline: '2px solid white', width: dotDimension, height: dotDimension }}
        className={`flex items-center justify-center rounded-full ${isActive ? progressColor : 'bg-[#e2e8f0]'}`}
      >
        {isActive && isLarge && <TickIcon className="h-[10px] w-[10px] text-white" />}
      </motion.div>
    </div>
  );
};

const TimelineSegment = ({ isIncomingActive, isOutgoingActive, isFirst, isLast, progressColor }: {
  isIncomingActive: boolean; isOutgoingActive: boolean; isFirst: boolean; isLast: boolean; progressColor: string;
}) => (
  <div className="absolute left-[-31px] w-[2px] z-10 top-0 bottom-0 overflow-visible">
    <div className="absolute w-full bg-[#e2e8f0]" style={{ top: isFirst ? '50%' : '-16px', bottom: isLast ? '50%' : '-16px' }} />
    {isIncomingActive && !isFirst && <div className={`absolute w-full ${progressColor}`} style={{ top: '-16px', bottom: '50%' }} />}
    {isOutgoingActive && !isLast && <div className={`absolute w-full ${progressColor}`} style={{ top: '50%', bottom: '-16px' }} />}
  </div>
);

function useTrackingReconciliation(statusUpdates: StatusUpdateLog[], currentStatus: OrderStatus) {
  return React.useMemo(() => {
    const normalizedCurrentStatus = currentStatus.toUpperCase() as OrderStatus;
    const currentRank = STATUS_RANK[normalizedCurrentStatus] || 0;
    const TERMINAL_STATUSES: OrderStatus[] = ['CANCELLED', 'FAILED', 'RETURNED'];
    const isTerminal = TERMINAL_STATUSES.includes(normalizedCurrentStatus);
    const standardSequence: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'SHIPMENT_ARRIVED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

    const allLogs: { id: string; status: OrderStatus; data: StatusUpdateLog; isActive: boolean; isVirtual?: boolean }[] =
      statusUpdates.map((u, idx) => {
        const statusUpper = u.status.toUpperCase() as OrderStatus;
        return { id: `real-${statusUpper}-${idx}-${u.date}`, status: statusUpper, data: u, isActive: true };
      });

    if (!isTerminal) {
      standardSequence.forEach(s => {
        const sRank = STATUS_RANK[s];
        if (sRank < currentRank && !allLogs.some(l => l.status === s)) {
          const triggeringLog = [...allLogs].filter(l => !l.isVirtual).sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime()).find(l => (STATUS_RANK[l.status] || 0) > sRank);
          const virtualDate = triggeringLog ? triggeringLog.data.date : new Date().toISOString();
          allLogs.push({
            id: `virtual-${s}`, status: s,
            data: { status: s, message: STATUS_CONFIG[s]?.text || s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), date: virtualDate },
            isActive: true, isVirtual: true
          });
        }
      });
    }

    const sortedLogs = allLogs.sort((a, b) => {
      const timeA = new Date(a.data.date).getTime(); const timeB = new Date(b.data.date).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (STATUS_RANK[a.status] || 0) - (STATUS_RANK[b.status] || 0);
    });

    const getFinalLabel = () => {
      if (normalizedCurrentStatus === 'CANCELLED') return 'Order Cancelled';
      if (normalizedCurrentStatus === 'RETURNED') return 'Order Returned';
      if (normalizedCurrentStatus === 'FAILED') return 'Delivery Failed';
      if (normalizedCurrentStatus === 'RESCHEDULED') return 'Delivery Rescheduled';
      if (normalizedCurrentStatus === 'DELIVERED') return 'Delivered';
      return 'Delivery';
    };

    const reachedShipping = statusUpdates.some(log => { const rank = STATUS_RANK[log.status.toUpperCase() as OrderStatus] || 0; return rank >= 4 && rank <= 7; });
    const hideShipping = isTerminal && !reachedShipping;

    const phases = [
      { id: 'ORDERED', label: 'Order Received', rankRange: [1, 3] },
      ...(!hideShipping ? [{ id: 'SHIPPED', label: 'Shipped', rankRange: [4, 6] }] : []),
      { id: 'DELIVERY', label: getFinalLabel(), rankRange: [8, 8] }
    ];

    const groups = phases.map(phase => {
      const logs = sortedLogs.filter((l, idx) => {
        const rank = STATUS_RANK[l.status] || 0;
        if (rank >= phase.rankRange[0] && rank <= phase.rankRange[1]) return true;
        if (rank === 7) {
          const hasEarlierTerminal = sortedLogs.slice(0, idx).some(prev => (STATUS_RANK[prev.status] || 0) >= 8);
          if (phase.id === 'DELIVERY' && hasEarlierTerminal) return true;
          if (phase.id === 'SHIPPED' && !hasEarlierTerminal) return true;
        }
        if (phase.id === 'DELIVERY' && isTerminal && TERMINAL_STATUSES.includes(l.status as OrderStatus)) return true;
        return false;
      });
      const isActive = isTerminal ? logs.length > 0 : logs.some(l => l.isActive);
      const isCompleted = phase.id === 'ORDERED' ? currentRank >= 4 : phase.id === 'SHIPPED' ? currentRank >= 7 : (phase.id === 'DELIVERY' && normalizedCurrentStatus === 'DELIVERED');
      return { id: phase.id, label: phase.label, isActive, isCompleted, logs };
    });

    const flatElements = groups.flatMap(g => [
      { type: 'milestone' as const, id: g.id, label: g.label, isActive: g.isActive },
      ...g.logs.map(l => ({ type: 'log' as const, ...l }))
    ]);
    const latestActiveIndex = flatElements.reduce((acc, el, idx) => el.isActive ? idx : acc, -1);
    return { groups, flatElements, latestActiveIndex };
  }, [statusUpdates, currentStatus]);
}

// ─── Tracking Details Tab ───────────────────────────────────────────────

function TrackingDetailsPanel({ order }: { order: OrderProps }) {
  const normalizedCurrentStatus = order.status.toUpperCase() as OrderStatus;
  const reconciliation = useTrackingReconciliation(order.statusUpdates || [], normalizedCurrentStatus);
  const progress = GET_PROGRESS_CONFIG(normalizedCurrentStatus);

  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(() => {
    const latestActive = [...reconciliation.groups].reverse().find(g => g.isActive);
    return new Set(latestActive ? [latestActive.id] : ['ORDERED']);
  });
  const toggleMilestone = (id: string) => setExpandedMilestones(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <div className="flex flex-col gap-[12px] w-full">
      {/* Tracking Info Box */}
      <div className="flex w-full flex-col rounded-[12px] bg-[#FCFFF3] border border-[#EDF0E4] pt-[16px] pb-[8px]">
        <div className="flex w-full items-center">
          <div className="flex flex-1 flex-col items-start gap-[4px] border-r border-[#e2e8f0] px-[16px]">
            <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#242424]">Delivery Partner</span>
            <span className="font-titillium text-[14px] font-[600] leading-[18px] text-[#242424]">{order.carrierName || 'Unknown'}</span>
          </div>
          <div className="flex flex-1 flex-col items-start gap-[4px] px-[20px]">
            <span className="w-full font-titillium text-[14px] font-[400] leading-[18px] text-[#242424]">Tracking Number</span>
            <div className="flex items-center gap-[4px]">
              <span className="font-titillium text-[14px] font-[600] leading-[18px] text-[#242424] max-w-[130px] truncate">{order.trackingNumber || 'Unassigned'}</span>
              <CopyIcon className="h-[16px] w-[16px] text-[#308026]" />
            </div>
          </div>
        </div>
        <div className="w-full px-[16px] mt-[12px] pt-[8px] border-t border-[#e2e8f0]/50">
          <p className="font-titillium text-[11px] font-[400] leading-[15px] text-[#626262]">
            <span className="font-[600]">Note:</span> Carrier details are only available once the product has been shipped or dispatched from the warehouse.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex w-full items-start gap-[6px] rounded-[12px] bg-[#3f9633] p-[8px_16px] md:items-center">
        <div className="mt-[2px] shrink-0 md:mt-0"><InfoIcon className="h-[16px] w-[16px] text-white" /></div>
        <span className="flex-1 font-titillium text-[13px] font-[400] leading-[18px] text-[#ffffff]">
          This is the same tracking information our customer support can access
        </span>
      </div>

      {/* Timeline */}
      <div className="flex w-full flex-col flex-1 p-[24px_24px_20px] overflow-y-auto scrollbar-hide">
        {(order.statusUpdates || []).length === 0 ? (
          <div className="w-full text-center py-4 font-titillium text-[14px] text-[#626262]">No tracking updates available yet.</div>
        ) : (
          <div className="flex flex-col w-full relative pl-[60px]">
            {reconciliation.groups.map((group, groupIndex) => {
              const isExpanded = expandedMilestones.has(group.id);
              const milestoneIdx = reconciliation.flatElements.findIndex(el => el.type === 'milestone' && el.id === group.id);
              const isOutgoingActive = isExpanded
                ? (group.isActive && reconciliation.flatElements[milestoneIdx + 1]?.isActive || false)
                : (group.isActive && reconciliation.groups[groupIndex + 1]?.isActive || false);
              let isIncomingActive = false;
              if (groupIndex > 0) {
                const prevGroup = reconciliation.groups[groupIndex - 1];
                const prevExpanded = expandedMilestones.has(prevGroup.id);
                if (prevExpanded && prevGroup.logs.length > 0) isIncomingActive = group.isActive && prevGroup.logs[prevGroup.logs.length - 1].isActive;
                else isIncomingActive = group.isActive && prevGroup.isActive;
              }
              const isLastRenderedGroupNode = (groupIndex === reconciliation.groups.length - 1) && (!isExpanded || group.logs.length === 0);

              return (
                <motion.div layout key={group.id} className="flex flex-col w-full mb-[12px]">
                  <motion.div
                    layout
                    className={`relative flex items-center justify-between w-full h-[36px] ${group.isCompleted ? 'bg-[#ECF7E8]' : 'bg-[#f8fafc]'} rounded-[10px] px-[12px] cursor-pointer hover:bg-gray-100 transition-colors z-20`}
                    onClick={() => toggleMilestone(group.id)}
                  >
                    <TimelineSegment isIncomingActive={isIncomingActive} isOutgoingActive={isOutgoingActive} isFirst={groupIndex === 0} isLast={isLastRenderedGroupNode} progressColor={progress.color} />
                    <TimelineDot size="large" isActive={group.isActive} isLatest={milestoneIdx === reconciliation.latestActiveIndex} glowColor={group.id === 'SHIPPED' ? '#A16207' : progress.hex} progressColor={progress.color} />
                    <div className="flex items-center gap-[8px]">
                      <span className={`font-titillium text-[15px] font-[700] tracking-[0.2px] leading-[1] ${group.isActive ? 'text-[#242424]' : 'text-[#8a8e91]'}`}>{group.label}</span>
                    </div>
                    <ChevronIcon className="h-[16px] w-[16px] text-[#8a8e91]" rotated={isExpanded} />
                  </motion.div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                        className="overflow-hidden ml-[-60px] pl-[60px]"
                      >
                        <div className="flex flex-col gap-[6px] mt-[8px]">
                          {group.logs.map((log, logIdx) => {
                            const flatElement = reconciliation.flatElements.find(el => el.type === 'log' && el.id === log.id);
                            const idx = reconciliation.flatElements.indexOf(flatElement!);
                            const isLatest = idx === reconciliation.latestActiveIndex;
                            const isLastRenderedLog = (groupIndex === reconciliation.groups.length - 1) && (logIdx === group.logs.length - 1);
                            const isLogIncomingActive = logIdx === 0 ? (log.isActive && group.isActive) : (log.isActive && group.logs[logIdx - 1].isActive);
                            const isLogOutgoingActive = logIdx === group.logs.length - 1 ? (log.isActive && reconciliation.groups[groupIndex + 1]?.isActive || false) : (log.isActive && group.logs[logIdx + 1]?.isActive || false);
                            return (
                              <div key={log.id} className="relative flex flex-col py-[2px] pl-[12px]">
                                <TimelineSegment isIncomingActive={isLogIncomingActive} isOutgoingActive={isLogOutgoingActive} isFirst={false} isLast={isLastRenderedLog} progressColor={progress.color} />
                                <TimelineDot isActive={log.isActive} isLatest={isLatest} glowColor={progress.hex} progressColor={progress.color} />
                                <div className="flex flex-col items-start gap-[2px]">
                                  <span className={`font-titillium text-[12px] font-[700] tracking-[0.2px] ${log.isActive ? 'text-[#4a4a4a]' : 'text-[#8a8e91]'}`}>{log.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                                  <p className="font-titillium text-[11px] font-[400] leading-[15px] text-[#575757]">{log.data.message}</p>
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
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order Details Tab ──────────────────────────────────────────────────

function OrderDetailsPanel({ order }: { order: OrderProps }) {
  const config = STATUS_CONFIG[order.status];
  const address = order.shippingAddress;
  const addressDetails = address?.addressDetails || address;
  const firstItem = order.order_items?.[0];
  const otherItems = (order.order_items || []).slice(1);

  // Build readable address
  const fullName = ([addressDetails?.first_name, addressDetails?.last_name].filter(Boolean).join(' ') || order.customerName || '').trim();
  const phone = addressDetails?.phone || order.customerPhone;
  const email = addressDetails?.email || order.customerEmail;

  const streetAddress = addressDetails ? [
    addressDetails.address_line_1 || addressDetails.address || addressDetails.street,
    addressDetails.landmark ? `(Near ${addressDetails.landmark})` : null,
    addressDetails.area,
    addressDetails.city,
    addressDetails.district
  ].filter(Boolean).join(', ') : null;

  return (
    <div className="flex flex-col gap-[20px] w-full">
      {/* Primary Item */}
      {firstItem && (
        <div className="flex w-full items-center gap-[16px] min-h-[76px]">
          <div className="relative flex h-[76px] w-[65px] shrink-0 items-center justify-center rounded-[6px] border border-[#e2e8f0] p-[6px]">
            <div className="relative h-full w-full">
              <Image src={order.image} alt={order.title} fill className="object-contain" sizes="65px" />
            </div>
          </div>
          <div className="flex flex-1 flex-col items-start">
            <span className="font-titillium text-[12px] font-[400] leading-[18px] text-[#242424]/80 uppercase">{order.brand}</span>
            <h2 className="font-titillium text-[16px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">{order.title}</h2>
            <div className="flex flex-wrap items-center gap-[13px] mt-[4px]">
              <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#8a8e91]">Size : {order.size}</span>
              <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#8a8e91]">Flavour : {order.flavour}</span>
              <span className="font-titillium text-[14px] font-[400] leading-[18px] text-[#8a8e91]">Qty : {firstItem.quantity}</span>
            </div>
          </div>
        </div>
      )}

      {/* Other Shipment Items */}
      {otherItems.length > 0 && (
        <div className="flex flex-col gap-[12px] rounded-[12px] border border-[#e2e8f0] p-[16px]">
          <div className="flex h-[32px] w-fit items-center gap-[10px] rounded-[6px] bg-[#f4ffeb] px-[8px]">
            <h4 className="font-titillium text-[14px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">Other Items in this shipment</h4>
          </div>
          <ul className="flex flex-col gap-[16px]">
            {otherItems.map((item: any, idx: number) => (
              <li key={idx} className="flex w-full items-center gap-[12px]">
                <div className="relative flex h-[62px] w-[55px] shrink-0 items-center justify-center rounded-[6px] border border-[#e2e8f0] p-[6px]">
                  <div className="relative h-full w-full">
                    <Image src={item.products?.images?.[0] || "/images/protein.webp"} alt={item.products?.name} fill className="object-contain" sizes="55px" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-[4px]">
                  <span className="font-titillium text-[10px] font-[400] leading-[12px] text-[#242424]/80 uppercase">{item.products?.brands?.name || 'SNP Nutrition'}</span>
                  <span className="font-titillium text-[12px] font-[600] leading-[18px] tracking-[0.2px] text-[#242424] line-clamp-1">{item.products?.name}</span>
                  <div className="flex flex-wrap items-center gap-[10px]">
                    {item.selected_size && <span className="font-titillium text-[12px] font-[400] leading-[16px] text-[#8a8e91]">Size : {item.selected_size}</span>}
                    {item.selected_flavor && <span className="font-titillium text-[12px] font-[400] leading-[16px] text-[#8a8e91]">Flavour : {item.selected_flavor}</span>}
                    <span className="font-titillium text-[12px] font-[400] leading-[16px] text-[#8a8e91]">Qty : {item.quantity}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Order Status + Amount */}
      <div className="flex w-full items-center justify-between rounded-[12px] bg-[#FCFFF3] border border-[#EDF0E4] p-[16px]">
        <div className="flex flex-col gap-[2px]">
          <span className="font-titillium text-[12px] font-[400] text-[#626262]">Status</span>
          <span className={`font-titillium text-[16px] font-[700] ${config.color}`}>{config.text}</span>
        </div>
        <div className="flex flex-col gap-[2px] items-end">
          <span className="font-titillium text-[12px] font-[400] text-[#626262]">Total Amount</span>
          <span className="font-titillium text-[16px] font-[700] text-[#242424]">NPR {order.totalAmount?.toLocaleString() || '—'}</span>
        </div>
      </div>

      {/* Preferred Shipment Method */}
      <DetailCard title="Preferred Shipment Method">
        <p className="font-titillium text-[14px] text-[#242424] font-[600]">
          {address?.option === 'pickup' ? 'Pickup from station' : 'Home Delivery'}
        </p>
        {address?.option !== 'pickup' && order.carrierName && (
          <p className="font-titillium text-[13px] text-[#626262] mt-[4px]">Carrier: {order.carrierName}</p>
        )}
        {order.trackingNumber && (
          <p className="font-titillium text-[13px] text-[#626262] mt-[2px]">Tracking: {order.trackingNumber}</p>
        )}
      </DetailCard>

      {/* Shipping Address */}
      <DetailCard title="Shipping Address">
        {addressDetails ? (
          <div className="flex flex-col gap-[2px] font-titillium text-[14px]">
            <p className="font-[600] text-[#242424]">{fullName}</p>
            <p className="font-[400] text-[#626262]">{streetAddress}</p>
            {email && <p className="font-[400] text-[#626262]">{email}</p>}
            {phone && <p className="font-[600] text-[#242424] mt-[2px]">Ph: {phone}</p>}
          </div>
        ) : (
          <p className="font-titillium text-[14px] text-[#8a8e91]">Address not available</p>
        )}
      </DetailCard>

      {/* Payment Method */}
      <DetailCard title="Payment Method">
        <div className="flex items-center justify-between">
          <p className="font-titillium text-[14px] font-[600] text-[#242424]">{order.paymentMethod || 'N/A'}</p>
          {order.paymentStatus && (
            <span className={`font-titillium text-[12px] font-[600] px-[8px] py-[2px] rounded-[6px] ${order.paymentStatus === 'paid' ? 'bg-[#ECF7E8] text-[#308026]' : 'bg-[#FFF8E5] text-[#A16207]'}`}>
              {order.paymentStatus.toUpperCase()}
            </span>
          )}
        </div>
        {order.amountPaid !== undefined && order.amountPaid > 0 && (
          <p className="font-titillium text-[13px] text-[#626262] mt-[4px]">Amount Paid: NPR {order.amountPaid.toLocaleString()}</p>
        )}
      </DetailCard>

      {/* Sender Details */}
      <DetailCard title="Sender Details">
        <div className="flex flex-col gap-[2px]">
          <p className="font-titillium text-[14px] font-[600] text-[#242424]">Bright Nepcare Pvt. Ltd.</p>
          <p className="font-titillium text-[13px] text-[#626262]">Supplyment Nepal</p>
          <p className="font-titillium text-[13px] text-[#626262]">Kathmandu, Nepal</p>
          <p className="font-titillium text-[13px] text-[#626262]">support@supplymentnepal.com</p>
        </div>
      </DetailCard>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[8px] rounded-[12px] border border-[#f1f5f9] p-[16px]">
      <h4 className="font-titillium text-[13px] font-[700] text-[#242424] uppercase tracking-[0.5px]">{title}</h4>
      {children}
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────

type Tab = 'tracking' | 'order';

export default function TrackOrderClient({ initialOrderId }: { initialOrderId?: string }) {
  const [trackedOrder, setTrackedOrder] = useState<OrderProps | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tracking');
  const [orderIdToFetch, setOrderIdToFetch] = useState<string | undefined>(initialOrderId);

  // No longer needed to read URL params manually as they are passed from the server

  const handleResult = (order: OrderProps) => {
    setTrackedOrder(order);
    setActiveTab('tracking');
  };

  const handleBack = () => {
    setTrackedOrder(null);
    setActiveTab('tracking');
  };

  return (
    <main className="flex flex-col items-center justify-start font-titillium min-h-screen">
      <motion.div
        initial={{}}
        animate={{ y: 0 }}
        className="relative w-full max-w-[410px] lg:max-w-[900px] lg:min-h-[600px] bg-[#3f9633] flex flex-col lg:flex-row overflow-hidden lg:rounded-[32px] lg:border-4 lg:border-[#3f9633] lg:p-[4px]"
      >
        {/* ── LEFT: GREEN BRANDING PANEL (identical to LoginModal) ── */}
        <div className="absolute top-0 left-0 w-full h-[40%] lg:h-full opacity-40 pointer-events-none z-0">
          <Image src="/images/supplement-pattern.webp" alt="Supplement Pattern" fill className="object-cover object-top" priority />
        </div>
        <section className="relative z-10 flex-1 flex flex-col justify-between p-[24px] lg:p-[48px] lg:gap-[32px]">
          <div className="flex items-center justify-between lg:justify-start gap-[10px]">
            <div className="flex items-center gap-[10px]">
              <div className="relative w-[60px] h-[60px] shrink-0 rounded-[12px] p-[2px] bg-[linear-gradient(to_right,#3F9733,#EAFFCD)]">
                <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-[#3f9633]">
                  <Image src="/images/logo.png" alt="Supplement Nepal Logo" fill className="object-cover" />
                </div>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-custom text-[18px] leading-[24px] text-[#e8ffe5] [text-shadow:0_1px_2px_rgba(16,24,40,0.04)]">Supplyment Nepal</span>
                <span className="text-[10px] font-medium leading-[12px] text-[#b1e7aa] uppercase tracking-wider">Powered By Bright Nepcare Pvt. Ltd.</span>
              </div>
            </div>
            <button onClick={() => window.location.href = '/'} className="lg:hidden flex w-[44px] h-[44px] items-center justify-center bg-[#edffe7] rounded-[12px]">
              <CloseIcon className="w-[24px] h-[24px] text-[#3f9633]" />
            </button>
          </div>
          <div className="hidden lg:flex flex-col gap-[12px] text-left">
            <h2 className="font-custom text-[32px] text-white leading-tight">Track your order <br />in real time.</h2>
            <p className="text-[#b1e7aa] text-[16px]">Enter your Order ID and get instant shipment updates.</p>
          </div>
        </section>

        {/* ── RIGHT: WHITE CONTENT PANEL ── */}
        <section className="relative z-10 bg-white w-full lg:w-[450px] rounded-t-[32px] lg:rounded-[24px] flex flex-col shadow-lg lg:shadow-none overflow-hidden">
          <AnimatePresence mode="wait">
            {!trackedOrder ? (
              /* ── FORM STATE ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col"
              >
                <TrackModalForm onResult={handleResult} initialOrderId={orderIdToFetch} />
              </motion.div>
            ) : (
              /* ── RESULTS STATE ── */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col h-full max-h-[85vh] lg:max-h-[580px]"
              >
                {/* Back + Order ID Header */}
                <div className="flex items-center justify-between px-[24px] pt-[24px] pb-[12px]">
                  <div className="flex items-center gap-[6px]">
                    <button onClick={handleBack} className="flex items-center justify-center h-[28px] rounded-full hover:bg-gray-100 transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button onClick={handleBack} className="text-[14px] font-semibold text-[#242424] hover:underline bg-transparent border-none outline-none cursor-pointer">Track another</button>
                  </div>
                  <span className="font-titillium text-[13px] font-[400] text-[#8a8e91]">#{trackedOrder.shortId}</span>
                </div>

                {/* Tab Bar */}
                <div className="flex w-full border-b border-[#f1f5f9] px-[24px]">
                  <button
                    onClick={() => setActiveTab('tracking')}
                    className={`flex-1 py-[12px] text-center font-titillium text-[14px] font-[600] transition-colors relative ${activeTab === 'tracking' ? 'text-[#308026]' : 'text-[#8a8e91] hover:text-[#242424]'}`}
                  >
                    Tracking Details
                    {activeTab === 'tracking' && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#308026] rounded-full" />}
                  </button>
                  <button
                    onClick={() => setActiveTab('order')}
                    className={`flex-1 py-[12px] text-center font-titillium text-[14px] font-[600] transition-colors relative ${activeTab === 'order' ? 'text-[#308026]' : 'text-[#8a8e91] hover:text-[#242424]'}`}
                  >
                    Order Details
                    {activeTab === 'order' && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#308026] rounded-full" />}
                  </button>
                </div>

                {/* Tab Content (scrollable) */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-[24px] py-[16px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'tracking' ? (
                      <motion.div key="tab-tracking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <TrackingDetailsPanel order={trackedOrder} />
                      </motion.div>
                    ) : (
                      <motion.div key="tab-order" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <OrderDetailsPanel order={trackedOrder} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>

      {/* Custom Page Footer with Fraud Warning */}
      <div className="w-full max-w-[410px] lg:max-w-[900px] mt-[80px] lg:mt-[32px] ">
        <div className="flex flex-col gap-[12px] bg-[#FCFFF3]  p-[16px] pt-[32px] lg:p-[24px] rounded-t-[24px]">
          <div className="flex flex-col gap-[4px] text-center lg:text-left">
            <h3 className="font-custom text-[18px] text-[#308026] leading-tight">Thank you for shopping with us!</h3>
            <p className="font-titillium text-[13px] text-[#626262]">Your high-performance supplements are being prepared with care.</p>
          </div>

          <div className="flex items-start gap-[10px] bg-[#FFF8E5] border border-[#FBE6A2] rounded-[12px] p-[12px] mt-[4px]">
            <div className="mt-[2px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A16207" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
              </svg>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-titillium font-bold text-[13px] text-[#A16207] uppercase tracking-[0.5px]">Important Security Notice</span>
              <span className="font-titillium text-[13px] text-[#626262]">
                Supplyment Nepal will <strong>never</strong> call you to ask for your OTP, passwords, or direct payments over the phone. Please beware of fraudulent calls.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
