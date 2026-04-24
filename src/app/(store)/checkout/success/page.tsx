"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CheckConfirmicon from "@/components/icons/CheckTickIcon";
import { fetchOrderDetails } from "@/services/orderService";
import { mapStatus, mapToOrderProps } from "@/services/orderService";

// --- TYPES ---
export interface OrderConfirmationProps {
  orderId?: string;
  amount?: string;
  date?: string;
  items?: any[];
  paymentMethod?: string;
  redirectSeconds?: number;
}

// --- MEMOIZED COMPONENTS ---
const MemoizedCheckConfirmicon = React.memo(CheckConfirmicon);

function ConfettiDoodles({ hasMounted }: { hasMounted: boolean }) {
  if (!hasMounted) return null;

  const lineCount = 20;
  const colors = ['#ffffff', '#8BFF84', '#ffe900', '#ffffff'];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: lineCount }).map((_, i) => {
        const angle = (i * 360) / lineCount + (Math.random() * 20 - 10);
        const color = colors[i % colors.length];
        const delay = 0.5 + (Math.random() * 0.1);
        const distance = 140 + Math.random() * 80; // Splash radius
        const duration = 1.2 + Math.random() * 0.8;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: angle }}
            animate={{
              scale: [0, 1.4, 0.6],
              opacity: [0, 1, 1, 0],
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance + (distance * 0.3), // Gravity dip
              rotate: angle + (Math.random() * 180 - 90)
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: [0.16, 1, 0.3, 1] // Organic splash easing
            }}
            style={{
              width: `${12 + Math.random() * 25}px`,
              height: '3px',
              backgroundColor: color,
              borderRadius: '10px',
              position: 'absolute',
              transformOrigin: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        );
      })}
    </div>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    if (!orderId) {
      router.replace('/');
      return;
    }

    const viewedKey = `order_success_viewed_${orderId}`;
    
    // Lock background color to prevent flickers on mobile viewport changes
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#3f9633';
    
    // Only fetch if not already done
    if (!order) {
      fetchOrderDetails(orderId).then(data => {
        setOrder(data);
        setIsLoading(false);
      }).catch((err) => {
        console.error("Order fetch error:", err);
        setIsLoading(false);
      });
    }

    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, [orderId, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Mark as viewed ONLY after countdown ends, or if user leaves manually
      const viewedKey = `order_success_viewed_${orderId}`;
      sessionStorage.setItem(viewedKey, 'true');
      router.push('/');
    }
  }, [countdown, orderId, router]);

  // Optimistic data from search params if possible (or just the ID)
  const displayOrderId = orderId ? `# ${orderId.split('-')[0].toUpperCase()}` : "N/A";
  
  // Mapping to props for display
  const orderProps = order ? mapToOrderProps(order) : null;
  const amount = orderProps ? `Rs. ${orderProps.totalAmount?.toLocaleString()}` : null;
  const dateStr = orderProps ? new Date(orderProps.createdAt!).toLocaleString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
  }) : null;
  const paymentMethodDisplay = orderProps?.paymentMethod === 'cod' ? "Cash on Delivery" : orderProps?.paymentMethod === 'qr' ? "QR Payment" : orderProps?.paymentMethod;

  return (
    <main className="fixed inset-0 flex flex-col w-full h-full justify-between items-center bg-[#3f9633] font-['Titillium_Web',sans-serif] overflow-hidden z-[9999]">
      
      {/* Animated Background Text Effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1 }} // Speed up background entry
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[0]"
      >
        <span className="text-[20vw] font-bold text-white whitespace-nowrap">SUCCESS</span>
      </motion.div>

      {/* --- TOP SECTION --- */}
      <header className="flex flex-col w-full max-w-[410px] items-center justify-center pt-[70px] px-[20px] relative z-[16]">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[24px] font-[700] leading-[36px] text-[#ffffff] tracking-[-0.2px] text-center whitespace-nowrap"
        >
          Order Placed Successfully
        </motion.h1>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[14px] font-[400] leading-[24px] text-[#ffffff] tracking-[-0.2px] text-center whitespace-nowrap"
        >
          Redirecting you in {countdown} {countdown === 1 ? 'second' : 'seconds'}
        </motion.p>
      </header>

      {/* --- MIDDLE SECTION --- */}
      <section className="flex flex-1 w-full max-w-[410px] items-start justify-center relative z-[10] pt-[20px] pb-[60px]">
        <div className="relative">
          <ConfettiDoodles hasMounted={hasMounted} />
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
            className="flex items-center justify-center w-[140px] h-[140px] drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
          >
            <MemoizedCheckConfirmicon className="w-full h-full text-white" />
          </motion.div>
        </div>
      </section>

      {/* --- BOTTOM SECTION: Pull-up Drawer --- */}
      <div className="flex w-full max-w-[410px] px-[16px] items-end justify-center relative z-[15] h-[55%]">
        <motion.section
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ 
            type: "spring",
            damping: 30,
            stiffness: 200,
            delay: 0.6
          }}
          className="w-full bg-[#ffffff] rounded-t-[24px] shadow-[0px_-8px_30px_rgba(0,0,0,0.15)] flex flex-col relative z-[2] overflow-hidden"
        >
          {/* Decorative Drag Handle */}
          <div className="w-full flex justify-center py-3">
            <div className="w-12 h-1 bg-gray-100 rounded-full" />
          </div>

          <div className="flex flex-col gap-[20px] items-start self-stretch px-[24px] pb-[40px] pt-2">
            
            {/* Header: Order ID & Amount */}
            <div className="flex justify-between items-end self-stretch shrink-0 relative z-[5]">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-[600] uppercase tracking-wider text-[#3f9633]/60">Order ID</span>
                <h2 className="text-[20px] font-[700] leading-none tracking-[-0.5px] text-[#242424]">
                  {hasMounted ? displayOrderId : "..."}
                </h2>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-[600] uppercase tracking-wider text-[#3f9633]/60">Total Paid</span>
                <span className="text-[22px] font-[700] leading-none tracking-[-0.5px] text-[#3f9633]">
                  {hasMounted && amount ? amount : "..."}
                </span>
              </div>
            </div>

            {/* ITEM SUMMARY BOX (Like OrderCard) */}
            <div className={`w-full p-4 rounded-[12px] border border-[#f1f5f9] bg-[#fafbfc] transition-all duration-500 overflow-hidden ${orderProps ? 'opacity-100' : 'opacity-0'}`}>
              <AnimatePresence mode="wait">
                {orderProps && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                  >
                    {/* PRODUCT IMAGE BORDER BOX */}
                    <div className="relative flex w-[70px] h-[70px] items-center justify-center rounded-[8px] border border-[#e2e8f0] bg-white p-[4px] shrink-0">
                      <div className="relative h-full w-full">
                        <Image src={orderProps.image} alt={orderProps.title} fill className="object-contain" />
                      </div>
                      {orderProps.extraItemsCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 z-10 flex h-[20px] w-[20px] items-center justify-center rounded-full border border-white bg-[#3f9633] shadow-sm">
                          <span className="font-titillium text-[10px] font-bold text-white">
                            +{orderProps.extraItemsCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-titillium text-[12px] font-[500] text-[#68727d] uppercase tracking-wide">
                        {orderProps.brand}
                      </span>
                      <span className="font-titillium text-[16px] font-[700] text-[#242424] truncate leading-tight mt-0.5">
                        {orderProps.title}
                      </span>
                      {orderProps.extraItemsCount > 0 && (
                        <span className="font-titillium text-[12px] font-[600] text-[#3f9633] mt-1">
                          + {orderProps.extraItemsCount} more items included
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Details Footer */}
            <div className="flex flex-col gap-1 items-start self-stretch">
              <div className="w-full text-[13px] font-[500] text-[#68727d]">
                Placed on {hasMounted && dateStr ? dateStr : "..."}
              </div>
              <div className="w-full text-[13px] font-[600] text-[#242424] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3f9633]" />
                Paid via {hasMounted && paymentMethodDisplay ? paymentMethodDisplay : "..."}
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full gap-[12px] mt-2">
              <Link
                href={`/account/orders/${orderId}`}
                className="flex py-[14px] gap-[10px] justify-center items-center flex-1 bg-[#ffe900] hover:bg-[#ebd700] rounded-[14px] transition-all duration-[200ms] active:scale-95 shadow-sm"
              >
                <span className="text-[15px] font-[700] text-[#242424] tracking-[-0.2px]">
                  Track Order
                </span>
              </Link>
              <Link
                href="/"
                className="flex py-[14px] gap-[10px] justify-center items-center flex-1 rounded-[14px] border border-[#e4e4e7] hover:bg-gray-50 transition-all duration-[200ms] active:scale-95 bg-white"
              >
                <span className="text-[15px] font-[600] text-[#242424] tracking-[-0.2px]">
                  Back to Shop
                </span>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#3f9633] z-[10000]" />}>
      <SuccessContent />
    </Suspense>
  );
}