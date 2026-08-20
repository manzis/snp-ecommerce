'use client';

import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderProps } from '@/components/orders/OrderCard';
import { Printer, X } from 'lucide-react';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderProps[];
}

export default function LabelPrintModal({ isOpen, onClose, orders }: LabelPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex flex-col bg-gray-100/95 backdrop-blur-sm font-rubik overflow-hidden print:bg-white print:static print:inset-auto print:z-auto print:backdrop-blur-none">
        
        {/* Top Action Bar (Hidden when printing) */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 print:hidden"
        >
          <div>
            <h2 className="text-lg font-semibold text-[#242424]">Generate Shipping Labels</h2>
            <p className="text-sm text-[#71717a]">{orders.length} label{orders.length !== 1 ? 's' : ''} ready to print.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#242424] rounded-lg hover:bg-black transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Labels
            </button>
          </div>
        </motion.div>

        {/* Labels Preview Area (visible on screen) */}
        <div className="flex-1 overflow-y-auto p-8 print:hidden flex flex-col items-center gap-8">
          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {orders.map((order) => {
              const addr = order.shippingAddress;
              const addressDetails = addr?.addressDetails || addr || {};
              const fullAddress = [
                addressDetails.streetAddress, 
                addressDetails.area, 
                addressDetails.city,
                addressDetails.province
              ].filter(Boolean).join(', ');
              const totalItems = order.order_items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

              return (
                <div key={order.id} className="w-full max-w-[340px] h-[300px] mx-auto bg-white p-6 border border-gray-100 rounded-sm flex flex-col justify-between overflow-hidden">
                  {/* Order & Payment Meta */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] text-gray-500 font-normal uppercase tracking-widest mb-1">Order ID</p>
                      <p className="text-[13px] font-medium text-black tracking-tight">#{order.shortId}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                         {new Date(order.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] text-gray-500 font-normal uppercase tracking-widest mb-1">Payment</p>
                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-sm border border-gray-200">
                          <span className="text-[11px] font-medium text-black uppercase">
                            {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' 
                              ? `COD: NPR ${order.totalAmount?.toLocaleString()}` 
                              : order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-gray-50 p-4 mb-6">
                    <p className="text-[9px] text-gray-500 font-normal uppercase tracking-widest mb-2">Ship To:</p>
                    <p className="text-[13px] font-medium text-black leading-tight mb-1">{order.customerName}</p>
                    <p className="text-[11px] text-black font-normal mb-2">{order.customerPhone}</p>
                    <p className="text-[11px] text-black leading-snug max-w-[280px]">
                      {fullAddress || 'Address not provided'}
                    </p>
                    {addressDetails.landmark && (
                      <p className="text-[11px] text-black mt-1"><span className="font-normal text-gray-500">Landmark:</span> {addressDetails.landmark}</p>
                    )}
                  </div>

                  {/* Order Summary & Footer */}
                  <div className="flex justify-between items-end pt-4 border-t border-gray-200 mt-auto">
                    <div>
                      <p className="text-[9px] text-gray-500 font-normal uppercase tracking-widest mb-1">Total Items</p>
                      <p className="text-[13px] font-medium text-black">{totalItems}</p>
                    </div>
                    <div className="text-right text-[9px] text-gray-400 font-normal">
                       Bright Nepcare, Butwal <br/> 
                       +977-9767609390
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AnimatePresence>
    
    {/* Portal the Print Output directly to the body to avoid Next.js layout clipping */}
    {typeof document !== 'undefined' && createPortal(
      <div id="print-portal" className="hidden print:block w-full font-rubik">
        <div ref={printRef} className="w-full flex flex-col print:items-stretch items-center print:gap-[2vh]">
          {orders.map((order) => {
              
              const addr = order.shippingAddress;
              const addressDetails = addr?.addressDetails || addr || {};
              const fullAddress = [
                addressDetails.streetAddress, 
                addressDetails.area, 
                addressDetails.city,
                addressDetails.province
              ].filter(Boolean).join(', ');

              const totalItems = order.order_items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;

              return (
                <div key={order.id} className="w-full max-w-full mx-auto bg-white p-4 print:h-[48vh] print:break-inside-avoid flex flex-col justify-between overflow-hidden">
                  
                  {/* Order & Payment Meta */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[9px] text-gray-600 font-normal uppercase tracking-widest mb-0.5">Order ID</p>
                      <p className="text-[13px] font-medium text-black tracking-tight">#{order.shortId}</p>
                      <p className="text-[8px] text-gray-500 mt-0.5">
                         {new Date(order.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] text-gray-600 font-normal uppercase tracking-widest mb-0.5">Payment</p>
                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-sm border border-gray-200">
                          <span className="text-[10px] font-medium text-black uppercase">
                            {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' 
                              ? `COD: NPR ${order.totalAmount?.toLocaleString()}` 
                              : order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-transparent p-2 mb-2">
                    <p className="text-[9px] text-gray-600 font-normal uppercase tracking-widest mb-1">Ship To:</p>
                    <p className="text-[13px] font-medium text-black leading-tight mb-0.5">{order.customerName}</p>
                    <p className="text-[10px] text-black font-normal mb-1">{order.customerPhone}</p>
                    <p className="text-[10px] text-black leading-snug max-w-[280px]">
                      {fullAddress || 'Address not provided'}
                    </p>
                    {addressDetails.landmark && (
                      <p className="text-[9px] text-black mt-0.5"><span className="font-normal text-gray-500">Landmark:</span> {addressDetails.landmark}</p>
                    )}
                  </div>

                  {/* Order Summary & Footer */}
                  <div className="flex justify-between items-end pt-2 border-t border-gray-200 mt-auto">
                    <div>
                      <p className="text-[9px] text-gray-600 font-normal uppercase tracking-widest mb-0.5">Total Items</p>
                      <p className="text-[13px] font-medium text-black">{totalItems}</p>
                    </div>
                    <div className="text-right text-[7px] text-gray-500 font-normal">
                       Bright Nepcare, Butwal <br/> 
                       +977-9767609390
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Print Styles injected locally to hide non-label elements when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide the Next.js app root and everything except our portal */
          body > *:not(#print-portal) {
            display: none !important;
          }
          
          /* Reset properties for safety */
          html, body {
            background: white;
            margin: 0;
            padding: 0;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
          }

          @page {
            margin: 4mm;
          }
        }
      `}} />
    </>
  );
}
