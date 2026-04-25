'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutPriceHeader from '@/components/checkout/CheckoutPriceHeader';
import PaymentSection from '@/components/checkout/PaymentSection';
import { submitOrderPaymentAction } from '@/app/actions/paymentActions';
import CheckTickIcon from '@/components/icons/CheckTickIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import Link from 'next/link';

// --- Confetti Animation Component (from checkout success) ---
function ConfettiDoodles() {
   const lineCount = 20;
   const colors = ['#ffffff', '#8BFF84', '#ffe900', '#ffffff'];

   return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {Array.from({ length: lineCount }).map((_, i) => {
            const angle = (i * 360) / lineCount + (Math.random() * 20 - 10);
            const color = colors[i % colors.length];
            const delay = 0.5 + (Math.random() * 0.1);
            const distance = 140 + Math.random() * 80;
            const duration = 1.2 + Math.random() * 0.8;

            return (
               <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: angle }}
                  animate={{
                     scale: [0, 1.4, 0.6],
                     opacity: [0, 1, 1, 0],
                     x: Math.cos((angle * Math.PI) / 180) * distance,
                     y: Math.sin((angle * Math.PI) / 180) * distance + (distance * 0.3),
                     rotate: angle + (Math.random() * 180 - 90)
                  }}
                  transition={{
                     duration: duration,
                     delay: delay,
                     ease: [0.16, 1, 0.3, 1]
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

// --- Icons ---
function UnderReviewIcon({ className }: { className?: string }) {
   return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <circle cx="12" cy="12" r="10" />
         <polyline points="12 6 12 12 16 14" />
      </svg>
   );
}

export default function PaymentPageView({ order }: { order: any }) {
   const [isMounted, setIsMounted] = useState(false);
   const [selectedPayment, setSelectedPayment] = useState<string | null>('qr');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [isRetrying, setIsRetrying] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   const isPaid = order.paymentStatus?.toLowerCase() === 'paid';
   const isPending = order.paymentStatus?.toLowerCase() === 'pending';
   const isFailed = order.paymentStatus?.toLowerCase() === 'failed';
   const hasProof = !!order.payment_screenshot_url;

   // Only processed if Paid, Failed, OR Pending WITH a proof uploaded
   const isProcessed = (isPaid || isFailed || (isPending && hasProof)) && !isRetrying;
   const isQR = order.paymentMethod?.toLowerCase() === 'qr' || selectedPayment === 'qr';

   const handlePlaceOrder = async (data?: { qrFile?: File | null; qrRemarks?: string }) => {
      if (selectedPayment === 'qr' && !data?.qrFile) {
         setError('Please upload a payment screenshot to proceed.');
         return;
      }

      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('orderId', order.id);

      if (data?.qrFile) {
         formData.append('qrFile', data.qrFile);
      }
      if (data?.qrRemarks) {
         formData.append('qrRemarks', data.qrRemarks);
      }

      const res = await submitOrderPaymentAction(formData);
      if (res.success) {
         window.location.reload();
      } else {
         setError(res.message || 'Payment submission failed.');
         setIsSubmitting(false);
      }
   };

   if (!isMounted) return null;

   // Success / Pending Review / Failed State
   if (isProcessed) {
      return (
         <main className={`fixed inset-0 flex flex-col w-full h-full justify-between items-center ${isFailed ? 'bg-[#d92d20]' : 'bg-[#3f9633]'} font-titillium overflow-hidden z-[9999]`}>
            {/* Background text effect */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.1 }}
               className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
            >
               <span className="text-[20vw] font-bold text-white whitespace-nowrap">
                  {isFailed ? 'FAILED' : 'PAYMENT'}
               </span>
            </motion.div>

            {/* Header */}
            <header className="flex flex-col w-full max-w-[410px] items-center justify-center pt-[70px] px-[20px] relative z-10">
               <motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[24px] font-bold text-white text-center"
               >
                  {isPaid ? 'Payment Received' : isFailed ? 'Payment Verification Failed' : 'Payment Under Review'}
               </motion.h1>
               <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[14px] text-white/90 text-center mt-2 max-w-[300px]"
               >
                  {isPaid
                     ? 'The Payment for this order has already been received, Thank you for shopping with us!'
                     : isFailed
                        ? 'There was an issue verifying your payment. Please try again or contact support.'
                        : 'Your verification is being processed by our team.'}
               </motion.p>
            </header>

            {/* Middle Section with Confetti */}
            <section className="flex flex-1 w-full max-w-[410px] items-start justify-center relative z-10 pt-[40px]">
               <div className="relative">
                  {isPaid && <ConfettiDoodles />}
                  <motion.div
                     initial={{ scale: 0, rotate: -180 }}
                     animate={{ scale: 1, rotate: 0 }}
                     transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                     className="w-[140px] h-[140px] flex items-center justify-center"
                  >
                     {isPaid ? (
                        <CheckTickIcon className="w-full h-full text-white drop-shadow-xl" />
                     ) : isFailed ? (
                        <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-xl">
                           <ErrorIcon className="w-20 h-20 text-white" />
                        </div>
                     ) : (
                        <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-xl">
                           <UnderReviewIcon className="w-20 h-20 text-white" />
                        </div>
                     )}
                  </motion.div>
               </div>
            </section>

            {/* Info Card */}
            <motion.section
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
               className="flex w-full max-w-[410px] px-4 py-8 items-center relative z-10"
            >
               <div className="w-full p-6 flex flex-col gap-6 bg-white rounded-[24px] shadow-2xl">
                  <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center">
                        <h2 className="text-[18px] font-bold text-[#242424]">ORDER #{order.shortId}</h2>
                        <span className={`text-[18px] font-bold ${isFailed ? 'text-[#d92d20]' : 'text-[#3f9633]'}`}>NPR {Number(order.totalAmount || 0).toLocaleString()}</span>
                     </div>
                     <p className="text-sm text-zinc-500">
                        {order.dateText || (order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 'Today')}
                     </p>
                     <div className="text-sm font-semibold text-[#575757]">
                        Payment Method: <span className={`${isFailed ? 'text-[#d92d20]' : 'text-[#3f9633]'} uppercase`}>{order.paymentMethod || 'QR'}</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                     {isFailed ? (
                        <button
                           onClick={() => setIsRetrying(true)}
                           className="w-full py-3.5 bg-[#d92d20] hover:bg-[#b42318] rounded-xl flex items-center justify-center font-bold text-white transition-all active:scale-95"
                        >
                           Pay Again
                        </button>
                     ) : (
                        <Link
                           href={`/track-order?id=${order.shortId}`}
                           className="w-full py-3.5 bg-[#ffe900] hover:bg-[#ebd700] rounded-xl flex items-center justify-center font-bold text-[#242424] transition-all active:scale-95"
                        >
                           Track Shipment
                        </Link>
                     )}
                     <Link
                        href="/"
                        className="w-full py-3.5 border border-gray-200 rounded-xl flex items-center justify-center font-bold text-[#242424] hover:bg-gray-50 transition-all active:scale-95"
                     >
                        Go Back Home
                     </Link>
                  </div>
               </div>
            </motion.section>
         </main>
      );
   }

   return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center py-4 px-2 font-titillium">
         <div className="w-full max-w-[450px] rounded-[24px] overflow-hidden flex flex-col relative bg-transparent">
            {/* Custom header */}
            <div className="flex flex-col items-center bg-[#3f9633] text-white pt-8 pb-[80px] gap-2 rounded-[24px]">
               <h1 className="text-[28px] font-bold font-custom tracking-wide">Complete Payment</h1>
               <div className="flex gap-4">
                  <p className="text-white/90 text-sm font-semibold tracking-wide">Order #{order.shortId}</p>
                  <p className="text-white/90 text-sm font-semibold tracking-wide">
                     {order.dateText || (order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 'Today')}
                  </p>
               </div>
            </div>

            {/* Use existing price header */}
            <div className="absolute top-[120px] left-0 right-0 z-10 px-4">
               <div className="rounded-[16px] overflow-hidden border border-[#EDF0E4] bg-white">
                  <CheckoutPriceHeader
                     totalAmount={`NPR ${Number(order.totalAmount || 0).toLocaleString()}`}
                     mrp={Number(order.mrp_amount || 0)}
                     subtotal={Number(order.totalAmount || 0) + Number(order.discount_amount || 0)}
                     couponDiscount={Number(order.coupon_discount || 0)}
                     couponCode={order.coupon_code || ''}
                     shippingCharge={Number(order.shipping_amount || 0)}
                     codCharge={Number(order.cod_fees || 0)}
                     bundleDiscount={Number(order.bundle_discount || 0)}
                     onApplyCoupon={() => alert('Order is already placed. Coupons cannot be applied.')}
                     onRemoveCoupon={() => alert('Order is already placed. Coupons cannot be removed.')}
                  />
               </div>
            </div>

            {/* Payment Section Wrapper */}
            <div className="mt-[120px] lg:mt-[160px] rounded-b-[24px]">
               <PaymentSection
                  isOpen={true}
                  isConfirmed={true}
                  selectedId={selectedPayment}
                  onSelect={setSelectedPayment}
                  onToggle={() => { }}
                  onPlaceOrder={handlePlaceOrder}
                  excludeOptions={['cod']}
                  externalError={error}
                  hasQrError={!!error && selectedPayment === 'qr'}
                  disabled={isSubmitting}
               />
            </div>
         </div>
      </div>
   );
}
