"use client";

import React, { useState, useTransition } from "react";
import { trackOrderByIdAction } from "@/app/actions/orderActions";
import type { OrderProps } from "@/components/orders/OrderCard";
import LikeIcon from "@/components/icons/LikeIcon";
import ArrowRightIcon from "@/components/icons/RightBackIcon";
import { motion, AnimatePresence } from "framer-motion";

interface TrackModalFormProps {
    onResult: (order: OrderProps) => void;
    initialOrderId?: string;
}

export default function TrackModalForm({ onResult, initialOrderId }: TrackModalFormProps) {
    const [orderId, setOrderId] = useState(initialOrderId || "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLiked, setIsLiked] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const idToSearch = orderId || initialOrderId;
        if (!idToSearch || !idToSearch.trim()) { setError("Please enter your Order ID."); return; }
        setError(null);
        startTransition(async () => {
            const result = await trackOrderByIdAction(idToSearch.trim());
            if (!result.success || !result.order) {
                setError(result.message || "Order not found.");
            } else {
                onResult(result.order);
            }
        });
    };

    React.useEffect(() => {
        if (initialOrderId && !orderId) {
            setOrderId(initialOrderId);
            handleSubmit();
        }
    }, [initialOrderId]);

    const handleLikeClick = () => {
        if (!isLiked) {
            setIsLiked(true);
            // Play a nice light bubble pop / like sound
            try {
                // A short pop sound in base64
                const audio = new Audio("data:audio/wav;base64,UklGRjgAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAABAgL+A/4D/gP+A/4B/AAAAAAA=");
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) {
                // Ignore audio errors if browser blocks autoplay
            }
        }
    };

    return (
        <section className="flex flex-col w-full max-w-[410px] mx-auto pt-[36px] pb-[0px] gap-[30px] items-start bg-[#ffffff] rounded-t-[32px] sm:rounded-[32px]  relative font-['Rajdhani',sans-serif]">

            {/* --- FORM SECTION --- */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-[30px] items-start self-stretch shrink-0 relative w-full"
            >
                {/* Header */}
                <header className="flex flex-col w-full px-[24px] gap-[10px] items-start shrink-0 relative z-[1]">
                    <h2 className="text-[24px] font-[700] leading-[36.5px] bg-clip-text text-transparent bg-[linear-gradient(46.44deg,#242424,#7d857b)] whitespace-nowrap">
                        Track My Order
                    </h2>
                    <p className="w-full text-[14px] font-[500] leading-[22px] text-[#68727d] text-left">
                        Enter the necessary details to track your order below
                    </p>
                </header>

                {/* Inputs & Actions */}
                <div className="flex flex-col gap-[12px] items-start self-stretch shrink-0 relative z-[4] w-full">

                    {/* Input Wrapper */}
                    <div className="flex flex-col gap-[16px] items-start self-stretch shrink-0 relative z-[5]">
                        <div className="flex flex-col w-full px-[24px] gap-[12px] items-start self-stretch shrink-0 relative z-[6]">

                            {/* Floating Label Input */}
                            <div className={`flex w-full h-[54px] px-[12px] py-[16px] gap-[8px] items-center self-stretch rounded-[12px] border-[1px] ${error ? 'border-red-400' : 'border-[#eaebf0]'} focus-within:border-[#242424] transition-colors duration-[200ms] relative z-[7] bg-[#ffffff]`}>

                                <label
                                    htmlFor="orderId"
                                    className="absolute -top-[11px] left-[14px] flex h-[22px] px-[4px] gap-[8px] items-start bg-[#ffffff] z-[8]"
                                >
                                    <span className="text-[12px] font-[600] leading-[22px] text-[#68727d] whitespace-nowrap">
                                        Enter Order ID
                                    </span>
                                </label>

                                <input
                                    id="orderId"
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => { setOrderId(e.target.value); setError(null); }}
                                    className="w-full h-full bg-transparent outline-none text-[16px] text-[#242424] placeholder-[#a1a1aa]"
                                    placeholder="e.g. SNP-12346"
                                    required
                                />
                            </div>
                            {error && <span className="text-red-500 text-[12px] font-rajdhani mt-[2px]">{error}</span>}

                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="flex flex-col w-full px-[24px] gap-[12px] items-start self-stretch shrink-0 relative z-[10]">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full py-[12px] gap-[10px] justify-center items-center bg-[#ffe900] hover:bg-[#ebd700] rounded-[12px] transition-colors duration-[200ms] ease-in-out relative z-[11] disabled:opacity-60"
                        >
                            <span className="text-[16px] font-[600] leading-[24px] text-[#242424] whitespace-nowrap">
                                {isPending ? 'Searching...' : 'Track Order'}
                            </span>
                        </button>
                        <span className="w-full text-[14px] font-[500] leading-[22px] text-[#68727d] text-left">
                            Note : Find your Order ID in the confirmation email or My Orders page.
                        </span>
                    </div>

                </div>
            </form>

            {/* --- RATING SECTION --- */}
            <div className="flex flex-col w-full py-[20px] gap-[10px] justify-center items-center bg-[#ffffff] relative z-[14] sm:rounded-b-[32px]">
                <div className="flex flex-col w-full px-[24px] gap-[16px] justify-center items-start shrink-0 relative z-[15]">
                    <h3 className="text-[18px] font-[600] leading-[22px] text-[#242424] whitespace-nowrap">
                        Rate your Experience
                    </h3>

                    <div className="flex flex-col w-full gap-[10px] items-start shrink-0 relative z-[17]">
                        <button
                            type="button"
                            onClick={handleLikeClick}
                            className={`group flex w-full px-[16px] py-[14px] justify-between items-center ${isLiked ? 'bg-[#308026] shadow-md border-transparent' : 'bg-[#eaffcc] hover:bg-[#d8f7a1] border border-transparent'} rounded-[12px] transition-all duration-[300ms] ease-in-out relative z-[18]`}
                        >
                            <div className="flex gap-[12px] items-center shrink-0 relative z-[19]">
                                <motion.div
                                    className={`flex items-center justify-center w-[24px] h-[24px] shrink-0 relative z-[20] ${isLiked ? 'text-[#ffe900]' : 'text-[#308026]'}`}
                                    animate={isLiked ? { scale: [1, 1.4, 0.9, 1.1, 1], rotate: [0, -15, 15, -10, 0] } : { scale: 1 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                    <LikeIcon isFilled={isLiked} className="w-full h-full" />
                                </motion.div>
                                <span className={`text-[16px] font-[500] leading-[18px] whitespace-nowrap transition-colors duration-300 ${isLiked ? 'text-white' : 'text-[#242424]'}`}>
                                    {isLiked ? 'Glad you found it helpful!' : 'Did you find this page Helpful?'}
                                </span>
                            </div>

                            <motion.div
                                className={`flex items-center justify-center w-[16px] h-[16px] shrink-0 relative z-[22] transition-colors duration-[300ms] group-hover:translate-x-1 ${isLiked ? 'text-white' : 'text-[#308026]'}`}
                                animate={isLiked ? { x: 5, opacity: 0 } : { x: 0, opacity: 1 }}
                            >
                                {!isLiked && <ArrowRightIcon className="w-full h-full" />}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </div>

        </section>
    );
}
