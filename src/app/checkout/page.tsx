'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CheckoutPriceHeader from '@/components/checkout/CheckoutPriceHeader';
import ContactSection from '@/components/checkout/ContactSection';
import DeliverySection from '@/components/checkout/DeliverySection';
import PaymentSection from '@/components/checkout/PaymentSection';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';

export default function CheckoutPage() {
  // 1. STATE MANAGEMENT
  const [activeStep, setActiveStep] = useState<'contact' | 'delivery' | 'payments' | null>('contact');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Data persistence for validation & order processing
  const [contactData, setContactData] = useState({ value: '', marketing: true });
  const [deliveryData, setDeliveryData] = useState<{ addressId: string; option: string; shippingPrice: number } | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  // Validation error triggers
  const [contactError, setContactError] = useState<string | null>(null);

  // 2. REFS FOR UX (Smooth Scroll)
  const deliveryRef = useRef<HTMLDivElement>(null);
  const paymentsRef = useRef<HTMLDivElement>(null);

  // 3. HANDLERS
  const handleContactConfirm = (data: { value: string; marketing: boolean }) => {
    setContactData(data);
    setContactError(null);
    setCompletedSteps((prev) => [...new Set([...prev, 'contact'])]);
    setActiveStep('delivery');
  };

  const handleDeliveryConfirm = (address: any, option: string) => {
    const shippingPrice = option === 'home' ? 150 : 100;
    setDeliveryData({ addressId: address.id, option, shippingPrice });
    setCompletedSteps((prev) => [...new Set([...prev, 'delivery'])]);
    setActiveStep('payments');
  };

  const handlePaymentSelect = (id: string) => {
    setSelectedPaymentId(id);
    // Note: Payment confirmation usually happens on "Place Order", 
    // so we don't auto-close the accordion here to allow switching.
  };

  const handleToggle = (step: 'contact' | 'delivery' | 'payments') => {
    setActiveStep((prev) => (prev === step ? null : step));
  };

  const handlePlaceOrder = () => {
    // GATEKEEPER 1: Contact
    if (!contactData.value || contactData.value.trim() === '') {
      setContactError("Required: Please fill contact details");
      setActiveStep('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // GATEKEEPER 2: Delivery
    if (!deliveryData) {
      setActiveStep('delivery');
      deliveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // GATEKEEPER 3: Payment
    if (!selectedPaymentId) {
      setActiveStep('payments');
      paymentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Shake effect or error toast could be added here
      return;
    }

    // SUCCESS: Process Order
    console.log("Order Finalized", {
      contact: contactData,
      delivery: deliveryData,
      payment: selectedPaymentId,
      total: finalTotal
    });
  };

  // 4. AUTO-SCROLL EFFECT
  useEffect(() => {
    if (activeStep === 'delivery' && deliveryRef.current) {
      deliveryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeStep === 'payments' && paymentsRef.current) {
      paymentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeStep]);

  // 5. PERFORMANCE OPTIMIZED CALCULATIONS
  const baseAmount = 2500;
  const shippingCharge = deliveryData?.shippingPrice || 0;
  const finalTotal = useMemo(() => baseAmount + shippingCharge, [shippingCharge]);

  return (
    <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[80px]">
      <DynamicPageNav title="Checkout" />

      <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px]">
        
        {/* LEFT COLUMN: Checkout Flow */}
        <div className="flex-1 flex flex-col gap-[12px]">
          
          <CheckoutPriceHeader 
            totalAmount={`NPR ${finalTotal.toLocaleString()}`} 
            mrp={2800}
            subtotal={2600}
            couponDiscount={100}
            couponCode="PREPAID"
            shippingCharge={shippingCharge}
          />

          <div className="flex flex-col border-b border-[#f1f5f9]">
            
            {/* STEP 1: CONTACT */}
            <ContactSection 
              isOpen={activeStep === 'contact'}
              isConfirmed={completedSteps.includes('contact')}
              onConfirm={handleContactConfirm}
              onToggle={() => handleToggle('contact')}
              externalError={contactError}
            />

            {/* STEP 2: DELIVERY */}
            <div ref={deliveryRef}>
              <DeliverySection 
                isOpen={activeStep === 'delivery'}
                isConfirmed={completedSteps.includes('delivery')}
                disabled={!completedSteps.includes('contact')}
                onConfirm={handleDeliveryConfirm}
                onToggle={() => {
                  if (completedSteps.includes('contact')) handleToggle('delivery');
                }}
              />
            </div>

            {/* STEP 3: PAYMENTS */}
            <div ref={paymentsRef}>
              <PaymentSection 
                isOpen={activeStep === 'payments'}
                isConfirmed={!!selectedPaymentId}
                disabled={!completedSteps.includes('delivery')}
                selectedId={selectedPaymentId}
                onSelect={handlePaymentSelect}
                onToggle={() => {
                  if (completedSteps.includes('delivery')) handleToggle('payments');
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Sticky Sidebar */}
        <aside className="w-full lg:w-[380px] mt-[12px] lg:mt-0 h-fit">
          <div className="lg:sticky lg:top-[105px]">
            <div className="hidden lg:block">
              <CartCheckoutBar 
                isStatic={true}
                totalAmount={`NPR ${finalTotal.toLocaleString()}`}
                mrpAmount="NPR 2800"
                buttonText="Place Order"
                onCheckout={handlePlaceOrder}
              />
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky Bar */}
      <CartCheckoutBar 
        totalAmount={`NPR ${finalTotal.toLocaleString()}`}
        mrpAmount="NPR 2800"
        buttonText="Place Order"
        onCheckout={handlePlaceOrder}
      />
    </div>
  );
}