"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CheckConfirmicon from "@/components/icons/CheckTickIcon";
import { fetchOrderDetails } from "@/services/orderService";

// --- TYPES ---
export interface OrderConfirmationProps {
  orderId?: string;
  amount?: string;
  date?: string;
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
        const delay = 0.6 + (Math.random() * 0.1);
        const distance = 160 + Math.random() * 60;
        const duration = 1.0 + Math.random() * 0.5;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: angle }}
            animate={{
              scale: [0, 1.2, 0.4],
              opacity: [0, 1, 1, 0],
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance + (distance * 0.2),
              rotate: angle + 90
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: [0.23, 1, 0.32, 1]
            }}
            style={{
              width: `${15 + Math.random() * 15}px`,
              height: '4px',
              backgroundColor: color,
              borderRadius: '20px',
              position: 'absolute',
              transformOrigin: 'center',
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

  // Only the fields that strictly require the order object will show skeletons
  const amount = order ? `Rs. ${order.total_amount.toLocaleString()}` : null;
  const dateStr = order ? new Date(order.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  }) : null;
  const paymentMethod = order?.payment_method === 'cod' ? "Cash on Delivery" : order?.payment_method === 'qr' ? "QR Payment" : order?.payment_method;

  return (
    <main className="fixed inset-0 flex flex-col w-full h-full justify-between items-center bg-[#3f9633] font-['Rajdhani',sans-serif] overflow-hidden z-[9999]">

      {/* Animated Background Text Effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[0]"
      >
        <span className="text-[20vw] font-bold text-white whitespace-nowrap tracking-tighter">SUCCESS</span>
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
          className="text-[14px] font-[500] leading-[24px] text-[#ffffff] tracking-[-0.2px] text-center whitespace-nowrap"
        >
          Redirecting you in {countdown} {countdown === 1 ? 'second' : 'seconds'}
        </motion.p>
      </header>

      {/* --- MIDDLE SECTION --- */}
      <section className="flex flex-1 w-full max-w-[410px] items-start justify-center relative z-[10] pt-[20px] pb-[60px]">
        <div className="relative">
          <ConfettiDoodles hasMounted={hasMounted} />
          {hasMounted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.5
              }}
              className="flex items-center justify-center w-[140px] h-[140px]"
            >
              <MemoizedCheckConfirmicon className="w-full h-full text-white" />
            </motion.div>
          )}
        </div>
      </section>

      {/* --- BOTTOM SECTION --- */}
      <motion.section
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex w-full max-w-[410px] px-[16px] py-[24px] items-center shrink-0 relative z-[1]"
      >
        <article className="flex w-full py-[24px] flex-col gap-[30px] items-start bg-[#ffffff] rounded-[16px] shadow-[0px_8px_24px_rgba(0,0,0,0.1)] relative z-[2]">
          <div className="flex flex-col gap-[24px] items-start self-stretch shrink-0 relative z-[3]">

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
              className="flex px-[24px] flex-col gap-[10px] items-start self-stretch shrink-0 relative z-[4]"
            >
              <div className="flex justify-between items-start self-stretch shrink-0 relative z-[5]">
                <h2 className="text-[18px] font-[700] leading-[27px] tracking-[-0.07px] bg-clip-text text-transparent bg-[linear-gradient(46.44deg,#242424,#7d857b)] whitespace-nowrap">
                  ORDER: {hasMounted ? displayOrderId : "..."}
                </h2>
                <span className="text-[18px] font-[700] leading-[27px] tracking-[-0.07px] bg-clip-text text-transparent bg-[linear-gradient(46.44deg,#242424,#7d857b)] whitespace-nowrap">
                  {hasMounted && amount ? amount : <div className="w-[80px] h-[20px] bg-gray-200 animate-pulse rounded-md" />}
                </span>
              </div>

              {/* PRODUCT PREVIEW SECTION */}
              {hasMounted && order?.order_items?.length > 0 && (
                <div className="flex gap-[12px] items-center self-stretch py-[4px]">
                  <div className="w-[60px] h-[60px] bg-[#f8f9fa] shrink-0 border border-[#f1f5f9] overflow-hidden rounded-[8px] relative">
                    <Image 
                      src={order.order_items[0].products?.images?.[0] || "/images/product-placeholder.png"} 
                      alt="Product"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[10px] font-[600] text-[#3f9633] uppercase tracking-[0.4px] leading-tight opacity-90">
                      {order.order_items[0].products?.brands?.name || order.order_items[0].products?.brand_name || "SNP Nutrition"}
                    </span>
                    <h3 className="text-[14px] font-[600] leading-[20px] text-[#242424] truncate max-w-[180px]">
                      {order.order_items[0].products?.name}
                    </h3>
                  </div>
                  {(order.order_items.length - 1) > 0 && (
                    <div className="ml-auto flex items-center h-[24px] px-[8px] bg-[#f0fff0] border border-[#d1f0d1] rounded-none">
                      <span className="text-[11px] font-[700] text-[#3f9633] whitespace-nowrap">
                        +{order.order_items.length - 1} more items
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col items-start self-stretch relative">
                <div className="w-full text-[14px] font-[500] leading-[22px] text-[#68727d] whitespace-nowrap">
                  {hasMounted && dateStr ? dateStr : <div className="w-[120px] h-[16px] bg-gray-100 animate-pulse rounded-md mt-[4px]" />}
                </div>
                <div className="w-full text-[14px] font-[600] leading-[22px] text-[#575757] whitespace-nowrap">
                  Paid By : {hasMounted && paymentMethod ? paymentMethod : <span className="inline-block w-[60px] h-[14px] bg-gray-100 animate-pulse rounded-md translate-y-[2px] ml-[4px]" />}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col gap-[12px] items-start self-stretch shrink-0 relative z-[9]"
            >
              <div className="flex px-[24px] flex-col gap-[12px] items-start self-stretch shrink-0 relative z-[10]">
                <div className="flex w-full gap-[12px] items-start self-stretch shrink-0 relative z-[11]">
                  <Link
                    href={`/account/orders/${orderId}`}
                    className="flex py-[12px] gap-[10px] justify-center items-center flex-1 bg-[#ffe900] hover:bg-[#ebd700] rounded-[12px] transition-all duration-[200ms] active:scale-95 "
                  >
                    <span className="text-[14px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                      Track Order
                    </span>
                  </Link>
                  <Link
                    href="/"
                    className="flex py-[12px] gap-[10px] justify-center items-center flex-1 rounded-[12px] border-[1px] border-[#e4e4e7] hover:bg-[#f9fafb] transition-all duration-[200ms] active:scale-95"
                  >
                    <span className="text-[14px] font-[600] leading-[24px] text-[#242424] tracking-[-0.2px] whitespace-nowrap">
                      Go Back Home
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </article>
      </motion.section>
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
