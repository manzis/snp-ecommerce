'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import GreenCheckIcon from '@/components/icons/DiscountIcon2';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[80px]">
      <DynamicPageNav title="Order Confirmed" showBack={false} />

      <main className="mx-auto w-full max-w-[600px] px-[24px] pt-[40px]">
        <div className="flex flex-col items-center bg-white rounded-[24px] p-[40px] shadow-sm border border-[#f1f5f9]">
          
          {/* Success Icon */}
          <div className="w-[80px] h-[80px] bg-[#eaffcc] rounded-full flex items-center justify-center mb-[24px]">
            <GreenCheckIcon className="w-[40px] h-[40px] text-[#3F9733]" />
          </div>

          <h1 className="font-custom text-[28px] text-[#242424] text-center mb-[8px] leading-tight">
            Thank You for Your Order!
          </h1>
          
          <p className="font-titillium text-[16px] text-[#8a8e91] text-center mb-[32px]">
            Your order has been placed successfully. We'll send you a confirmation email with your order details shortly.
          </p>

          {/* Order Details Card */}
          <div className="w-full bg-[#f8fafc] rounded-[16px] p-[24px] mb-[32px] border border-[#f1f5f9]">
            <div className="flex justify-between items-center mb-[12px] pb-[12px] border-b border-[#e2e8f0]">
              <span className="font-titillium text-[14px] text-[#64748b]">Order ID</span>
              <span className="font-titillium text-[14px] font-semibold text-[#242424] uppercase">#{orderId?.slice(-8) || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-titillium text-[14px] text-[#64748b]">Status</span>
              <div className="flex items-center gap-[6px]">
                <div className="w-[8px] h-[8px] bg-[#3F9733] rounded-full animate-pulse"></div>
                <span className="font-titillium text-[14px] font-semibold text-[#3F9733]">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-[12px]">
            <button 
              onClick={() => router.push('/')}
              className="w-full flex h-[54px] items-center justify-center rounded-[16px] bg-[#3F9733] hover:bg-[#347d2a] font-titillium text-[16px] font-semibold text-white transition-all active:scale-[0.98] outline-none shadow-md"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => router.push('/track-order')}
              className="w-full flex h-[54px] items-center justify-center rounded-[16px] bg-white border border-[#3F9733] font-titillium text-[16px] font-semibold text-[#3F9733] hover:bg-[#f7faf6] transition-all active:scale-[0.98] outline-none"
            >
              Track Order
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-[40px] text-center">
          <p className="font-titillium text-[14px] text-[#8a8e91]">
            Need help? <a href="/contact" className="text-[#3F9733] font-semibold hover:underline">Contact Support</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
