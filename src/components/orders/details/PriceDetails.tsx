import React, { useState } from 'react';
import CaretDownIcon from '@/components/icons/CaretDownIcon';
import CaretUpIcon from '@/components/icons/CaretUpIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceDetailsProps {
    total: number;
    mrp: number;
    discount: number;
    shipping: number;
    method: string;
    paymentStatus?: string;
    // Granular breakdown
    discountOnMrp?: number;
    couponDiscount?: number;
    couponCode?: string | null;
    bundleDiscount?: number;
    codFees?: number;
    taxAmount?: number;
    items?: any[];
}

export default function PriceDetails({
    total, mrp, discount, shipping, method, paymentStatus = 'pending',
    discountOnMrp = 0, couponDiscount = 0, couponCode, bundleDiscount = 0, codFees = 0, taxAmount = 0,
    items = []
}: PriceDetailsProps) {
    const [isDiscountsExpanded, setIsDiscountsExpanded] = useState(false);
    const [isFeesExpanded, setIsFeesExpanded] = useState(false);

    return (
        <section id="price-details-section" className="flex w-full flex-col items-start gap-[16px] bg-[#ffffff] p-[24px]">
            <h2 className="font-rajdhani text-[18px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                Price Details
            </h2>
            <div className="flex w-full flex-col items-start rounded-[16px] border border-[#f1f5f9] bg-[#ffffff] p-[6px]">
                <div className="flex w-full flex-col items-start">
                    {/* ORDERED ITEMS INDIVIDUAL PRICE BREAKDOWN */}
                    {items && items.length > 0 && (
                        <div className="flex w-full flex-col border-b border-[#f1f5f9] p-[16px_14px] gap-[12px] bg-[#fafdf8] rounded-t-[12px]">
                            <div className="flex items-center justify-between">
                                <span className="font-rajdhani text-[13px] font-[700] uppercase tracking-wider text-[#475569]">
                                    Ordered Items
                                </span>
                                <span className="font-rajdhani text-[12px] font-[600] text-[#308026] bg-[#eaffcc] px-[8px] py-[2px] rounded-[6px]">
                                    {items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)} {items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-[10px] divide-y divide-[#f1f5f9]">
                                {items.map((item: any, idx: number) => {
                                    const qty = item.quantity || 1;
                                    const name = item.products?.name || item.title || 'Product Item';
                                    const unitPrice = Number(item.price || 0);
                                    const totalPrice = unitPrice * qty;
                                    const variantParts = [item.selected_size, item.selected_flavor].filter(Boolean);
                                    const variantText = variantParts.join(' • ');

                                    return (
                                        <div key={idx} className={`flex items-start justify-between gap-[12px] ${idx > 0 ? 'pt-[10px]' : ''}`}>
                                            <div className="flex flex-col flex-1 min-w-0 pr-[4px]">
                                                <span className="font-rajdhani text-[15px] font-[600] leading-[20px] text-[#242424]">
                                                    <span className="font-[700] text-[#308026] mr-1.5">{qty}x</span>
                                                    {name}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px] mt-[2px]">
                                                    {variantText && (
                                                        <span className="font-rajdhani text-[12px] font-[500] leading-[16px] text-[#8a8e91]">
                                                            {variantText}
                                                        </span>
                                                    )}
                                                    {qty > 1 && (
                                                        <span className="font-rajdhani text-[12px] font-[600] leading-[16px] text-[#64748b]">
                                                            (Rs. {unitPrice.toLocaleString()} each)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <span className="font-rajdhani text-[15px] font-[600] leading-[20px] text-[#242424]">
                                                    Rs. {totalPrice.toLocaleString()}
                                                </span>
                                                {item.mrp && Number(item.mrp) > unitPrice && (
                                                    <span className="font-rajdhani text-[11px] font-[500] text-[#8a8e91] line-through">
                                                        Rs. {(Number(item.mrp) * qty).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* MRP */}
                    <div className="flex w-full items-center justify-between border-b border-[#f1f5f9] p-[18px_13px]">
                        <span className="font-rajdhani text-[16px] font-[500] leading-[18px] text-[#242424]">MRP</span>
                        <span className="font-rajdhani text-[16px] font-[500] leading-[18px] text-[#242424] text-right">Rs. {Number(mrp || 0).toLocaleString()}</span>
                    </div>

                    {/* Discounts (Expandable) */}
                    <div className="flex w-full flex-col border-b border-[#f1f5f9]">
                        <button
                            onClick={() => setIsDiscountsExpanded(!isDiscountsExpanded)}
                            className="flex w-full items-center justify-between p-[18px_13px] transition-colors"
                        >
                            <div className="flex items-center gap-[6px]">
                                <span className="font-rajdhani text-[16px] font-[500] leading-[18px] text-[#242424]">Discounts</span>
                                <motion.div
                                    animate={{ rotate: isDiscountsExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <CaretDownIcon className="w-4 h-4 text-[#8a8e91]" />
                                </motion.div>
                            </div>
                            <span className="font-rajdhani text-[16px] font-[500] leading-[18px] text-[#308026] text-right">- Rs. {Number(discount || 0).toLocaleString()}</span>
                        </button>

                        <AnimatePresence initial={false}>
                            {isDiscountsExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden bg-[#f9fcf8]"
                                >
                                    <div className="flex flex-col gap-[12px] px-[24px] pb-[12px] pt-[12px]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Discount on MRP</span>
                                            <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">- Rs. {Number(discountOnMrp || discount || 0).toLocaleString()}</span>
                                        </div>
                                        {bundleDiscount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Bundle Savings</span>
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#308026] text-right">- Rs. {Number(bundleDiscount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {couponDiscount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col items-start">
                                                    <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Coupon Savings</span>
                                                    {couponCode && <span className="text-[10px] text-[#308026] font-bold">Code: {couponCode}</span>}
                                                </div>
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#308026]">- Rs. {Number(couponDiscount).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Fees & Taxes (Expandable) */}
                    <div className="flex w-full flex-col border-b border-dashed border-[#f1f5f9]">
                        <button
                            onClick={() => setIsFeesExpanded(!isFeesExpanded)}
                            className="flex w-full items-center justify-between p-[18px_13px] transition-colors"
                        >
                            <div className="flex items-center gap-[6px]">
                                <span className="font-rajdhani text-[16px] font-[500] leading-[18px] text-[#242424]">Fees & Taxes</span>
                                <motion.div
                                    animate={{ rotate: isFeesExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <CaretDownIcon className="w-4 h-4 text-[#8a8e91]" />
                                </motion.div>
                            </div>
                            <span className="font-rajdhani text-[16px] font-[500] leading-[18px] text-[#242424] text-right">+ Rs. {Number(shipping + codFees + taxAmount).toLocaleString()}</span>
                        </button>

                        <AnimatePresence initial={false}>
                            {isFeesExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden bg-[#f9fcf8]"
                                >
                                    <div className="flex flex-col gap-[12px] px-[24px] pb-[12px] pt-[12px]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Shipping Fees</span>
                                            <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Rs. {Number(shipping).toLocaleString()}</span>
                                        </div>
                                        {codFees > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Cash on Delivery Fee</span>
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Rs. {Number(codFees).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {taxAmount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#64748b]">Tax Amount</span>
                                                <span className="font-rajdhani text-[14px] font-[500] text-[#64748b] text-right">Inc. in price</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Total Amount */}
                    <div className="flex w-full items-center justify-between p-[18px_13px] h-[54px]">
                        <span className="font-rajdhani text-[16px] font-[600] leading-[18px] text-[#242424]">Total Amount</span>
                        <span className="font-rajdhani text-[16px] font-[600] leading-[18px] text-[#242424]">Rs. {Number(total || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* Payment Method Banner */}
                <div className="flex w-full flex-col items-start pt-[4px] gap-[10px]">
                    <div className="flex w-full items-center justify-between rounded-[12px] bg-[#eaffcc] p-[18px_16px]">
                        <div className="flex items-center gap-[8px]">
                            <span className="font-rajdhani text-[16px] font-[600] leading-[18px] tracking-[-0.64px] text-[#242424]">
                                Paid By
                            </span>
                            {/* Payment Status Tag */}
                            <div className={`flex items-center h-[20px] px-[8px] rounded-[6px] border ${
                                paymentStatus?.toLowerCase() === 'paid' 
                                    ? 'bg-[#308026]/10 border-[#308026]/20 text-[#308026]' 
                                    : paymentStatus?.toLowerCase() === 'partially_paid'
                                    ? 'bg-[#A16207]/10 border-[#A16207]/20 text-[#A16207]'
                                    : 'bg-[#71717a]/10 border-[#71717a]/20 text-[#71717a]'
                            }`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                                    {paymentStatus?.replace(/_/g, ' ') || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <span className="font-rajdhani text-[16px] font-[600] leading-[18px] text-[#242424] capitalize">
                            {method?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
