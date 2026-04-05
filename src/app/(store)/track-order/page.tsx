"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { title: "Order Placed", date: "Apr 04, 2026", status: "completed" },
  { title: "Processing", date: "Apr 04, 2026", status: "completed" },
  { title: "Shipped", date: "Apr 05, 2026", status: "current" },
  { title: "Out for Delivery", date: "Out for delivery", status: "pending" },
  { title: "Delivered", date: "Expected by tomorrow", status: "pending" },
];

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId) {
      setIsTracking(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-[24px] lg:px-[60px] pt-[160px] pb-[80px]">
      <div className="mx-auto max-w-[800px]">
        {/* Header Section */}
        <div className="mb-[40px] text-center lg:text-left">
          <h1 className="font-titillium text-[32px] lg:text-[40px] font-bold tracking-tight text-[#242424]">
            Track Your Order
          </h1>
          <p className="mt-[12px] font-titillium text-[16px] lg:text-[18px] text-[#666666]">
            Enter your order ID below to check the real-time status of your shipment.
          </p>
        </div>

        <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start lg:gap-[48px]">
          {/* Tracking Form */}
          <div className="w-full lg:w-[400px]">
            <form onSubmit={handleTrack} className="rounded-2xl border border-[#E8E8E8] bg-white p-[24px] shadow-sm">
              <div className="flex flex-col gap-[20px]">
                <div>
                  <label htmlFor="orderId" className="mb-[8px] block font-titillium text-[14px] font-semibold text-[#242424]">
                    Order ID
                  </label>
                  <input
                    type="text"
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. #SNP-12345"
                    className="h-[52px] w-full rounded-xl border border-[#E8E8E8] px-[16px] font-titillium text-[16px] outline-none transition-all placeholder:text-[#999999] focus:border-[#3F9733] focus:ring-1 focus:ring-[#3F9733]/10"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="mb-[8px] block font-titillium text-[14px] font-semibold text-[#242424]">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    id="contact"
                    placeholder="hello@example.com"
                    className="h-[52px] w-full rounded-xl border border-[#E8E8E8] px-[16px] font-titillium text-[16px] outline-none transition-all placeholder:text-[#999999] focus:border-[#3F9733] focus:ring-1 focus:ring-[#3F9733]/10"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-[8px] h-[56px] w-full rounded-xl bg-[#ffe900] font-titillium text-[18px] font-bold text-[#1e1e1e] transition-all hover:bg-[#ffe000] active:scale-[0.98]"
                >
                  Track Now
                </button>
              </div>
            </form>
          </div>

          {/* Results Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {!isTracking ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="empty-state"
                  className="flex h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E8E8] bg-[#FAFAFA] p-[40px] text-center"
                >
                  <div className="mb-[16px] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white shadow-sm">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3F9733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <p className="font-titillium text-[16px] text-[#666666]">
                    Your order tracking details will appear here once you enter your information correctly.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="results"
                  className="rounded-2xl border border-[#E8E8E8] bg-white p-[24px] lg:p-[32px] shadow-sm"
                >
                  <div className="mb-[24px] flex flex-wrap items-center justify-between gap-[16px] border-b border-[#F5F5F5] pb-[20px]">
                    <div>
                      <p className="font-titillium text-[14px] text-[#666666]">Order ID</p>
                      <p className="font-titillium text-[20px] font-bold text-[#242424]">{orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-titillium text-[14px] text-[#666666]">Status</p>
                      <p className="font-titillium text-[18px] font-bold text-[#3F9733]">Shipped</p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="flex flex-col">
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative flex gap-[20px] last:pb-0 pb-[32px]">
                        {/* Status Icon & Line */}
                        <div className="flex flex-col items-center">
                          <div className={`relative z-10 flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 
                            ${step.status === 'completed' ? 'border-[#3F9733] bg-[#3F9733]' : 
                              step.status === 'current' ? 'border-[#3F9733] bg-white ring-4 ring-[#3F9733]/10' : 
                              'border-[#E8E8E8] bg-white'}`}
                          >
                            {step.status === 'completed' && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                            {step.status === 'current' && (
                              <div className="h-[8px] w-[8px] rounded-full bg-[#3F9733]" />
                            )}
                          </div>
                          {idx !== steps.length - 1 && (
                            <div className={`mt-[4px] h-[calc(100%-12px)] w-[2px] 
                              ${(step.status === 'completed' || step.status === 'current') ? 'bg-[#3F9733]' : 'bg-[#E8E8E8]'}`} 
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-[4px] pt-[2px]">
                          <span className={`font-titillium text-[16px] font-bold 
                            ${step.status === 'pending' ? 'text-[#999999]' : 'text-[#242424]'}`}
                          >
                            {step.title}
                          </span>
                          <span className="font-titillium text-[14px] text-[#666666]">
                            {step.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipment Details Box */}
                  <div className="mt-[32px] rounded-xl bg-[#F8FDF7] p-[20px] border border-[#E8F5E6]">
                    <div className="flex items-center gap-[12px] mb-[12px]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F9733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <h4 className="font-titillium text-[16px] font-bold text-[#242424]">Shipment Details</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-[16px]">
                      <div>
                        <p className="text-[13px] text-[#666666] font-titillium">Carrier</p>
                        <p className="text-[15px] text-[#242424] font-semibold font-titillium">Delhivery</p>
                      </div>
                      <div>
                        <p className="text-[13px] text-[#666666] font-titillium">Est. Delivery</p>
                        <p className="text-[15px] text-[#242424] font-semibold font-titillium">Apr 07, 2026</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
