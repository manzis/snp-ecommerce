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
}

export default function PriceDetails({
    total, mrp, discount, shipping, method, paymentStatus = 'pending',
    discountOnMrp = 0, couponDiscount = 0, couponCode, bundleDiscount = 0, codFees = 0, taxAmount = 0
}: PriceDetailsProps) {
    const [isDiscountsExpanded, setIsDiscountsExpanded] = useState(false);
    const [isFeesExpanded, setIsFeesExpanded] = useState(false);

    return (
        <section id="price-details-section" className="flex w-full flex-col items-start gap-[16px] bg-[#ffffff] p-[24px]">
            <h2 className="font-titillium text-[18px] font-[600] leading-[22px] tracking-[0.2px] text-[#242424]">
                Price Details
            </h2>
            <div className="flex w-full flex-col items-start rounded-[16px] border border-[#f1f5f9] bg-[#ffffff] p-[6px]">
                <div className="flex w-full flex-col items-start">
                    {/* MRP */}
                    <div className="flex w-full items-center justify-between border-b border-[#f1f5f9] p-[18px_13px]">
                        <span className="font-titillium text-[16px] font-[400] leading-[18px] text-[#242424]">MRP</span>
                        <span className="font-titillium text-[16px] font-[400] leading-[18px] text-[#242424] text-right">Rs. {mrp}</span>
                    </div>

                    {/* Discounts (Expandable) */}
                    <div className="flex w-full flex-col border-b border-[#f1f5f9]">
                        <button
                            onClick={() => setIsDiscountsExpanded(!isDiscountsExpanded)}
                            className="flex w-full items-center justify-between p-[18px_13px] transition-colors"
                        >
                            <div className="flex items-center gap-[6px]">
                                <span className="font-titillium text-[16px] font-[400] leading-[18px] text-[#242424]">Discounts</span>
                                <motion.div
                                    animate={{ rotate: isDiscountsExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <CaretDownIcon className="w-4 h-4 text-[#8a8e91]" />
                                </motion.div>
                            </div>
                            <span className="font-titillium text-[16px] font-[400] leading-[18px] text-[#308026] text-right">- Rs. {discount}</span>
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
                                            <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Discount on MRP</span>
                                            <span className="font-titillium text-[14px] font-[400] text-[#64748b]">- Rs. {discountOnMrp || discount}</span>
                                        </div>
                                        {bundleDiscount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Bundle Savings</span>
                                                <span className="font-titillium text-[14px] font-[400] text-[#308026] text-right">- Rs. {bundleDiscount}</span>
                                            </div>
                                        )}
                                        {couponDiscount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col items-start">
                                                    <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Coupon Savings</span>
                                                    {couponCode && <span className="text-[10px] text-[#308026] font-bold">Code: {couponCode}</span>}
                                                </div>
                                                <span className="font-titillium text-[14px] font-[400] text-[#308026]">- Rs. {couponDiscount}</span>
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
                                <span className="font-titillium text-[16px] font-[400] leading-[18px] text-[#242424]">Fees & Taxes</span>
                                <motion.div
                                    animate={{ rotate: isFeesExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <CaretDownIcon className="w-4 h-4 text-[#8a8e91]" />
                                </motion.div>
                            </div>
                            <span className="font-titillium text-[16px] font-[400] leading-[18px] text-[#242424] text-right">+ Rs. {shipping + codFees + taxAmount}</span>
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
                                            <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Shipping Fees</span>
                                            <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Rs. {shipping}</span>
                                        </div>
                                        {codFees > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Cash on Delivery Fee</span>
                                                <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Rs. {codFees}</span>
                                            </div>
                                        )}
                                        {taxAmount > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="font-titillium text-[14px] font-[400] text-[#64748b]">Tax Amount</span>
                                                <span className="font-titillium text-[14px] font-[400] text-[#64748b] text-right">Inc. in price</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Total Amount */}
                    <div className="flex w-full items-center justify-between p-[18px_13px] h-[54px]">
                        <span className="font-titillium text-[16px] font-[600] leading-[18px] text-[#242424]">Total Amount</span>
                        <span className="font-titillium text-[16px] font-[600] leading-[18px] text-[#242424]">Rs. {total}</span>
                    </div>
                </div>

                {/* Payment Method Banner */}
                <div className="flex w-full flex-col items-start pt-[4px] gap-[10px]">
                    <div className="flex w-full items-center justify-between rounded-[12px] bg-[#eaffcc] p-[18px_16px]">
                        <div className="flex items-center gap-[8px]">
                            <span className="font-titillium text-[16px] font-[600] leading-[18px] tracking-[-0.64px] text-[#242424]">
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
                        <span className="font-titillium text-[16px] font-[600] leading-[18px] text-[#242424] capitalize">
                            {method?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
