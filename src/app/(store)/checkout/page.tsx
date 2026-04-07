'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CheckoutPriceHeader from '@/components/checkout/CheckoutPriceHeader';
import ContactSection from '@/components/checkout/ContactSection';
import DeliverySection from '@/components/checkout/DeliverySection';
import PaymentSection from '@/components/checkout/PaymentSection';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';
import { useCartStore } from '@/store/cartStore';
import { validateCoupon } from '@/services/couponService';
import { createOrder } from '@/services/orderService';
import { supabase } from '@/lib/supabase/client';
import CheckoutPrompt from '@/components/checkout/CheckoutPrompt';

export default function CheckoutPage() {
  // 0. AVOID HYDRATION MISMATCH FOR LOCALSTORAGE
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. STATE MANAGEMENT
  const [activeStep, setActiveStep] = useState<'contact' | 'delivery' | 'payments' | null>('contact');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const router = useRouter();

  // Data persistence for validation & order processing
  const {
    items,
    userId,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    getCouponDiscount
  } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

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

  const handleApplyCoupon = async (code: string) => {
    setIsValidating(true);
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const result = await validateCoupon(code, subtotal, items);
    setIsValidating(false);

    if (result.isValid && result.coupon) {
      applyCoupon(result.coupon);
    } else {
      alert(result.message || "Invalid Coupon Code");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handleToggle = (step: 'contact' | 'delivery' | 'payments') => {
    setActiveStep((prev) => (prev === step ? null : step));
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // GATEKEEPER 0: Auth
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      currentUserId = user.id;
    }

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
      return;
    }

    setIsProcessing(true);
    try {
      const order = await createOrder({
        user_id: currentUserId,
        total_amount: finalTotal,
        mrp_amount: totalMRP,
        discount_amount: totalMRP - subtotal + couponDiscount,
        shipping_amount: shippingCharge,
        shipping_address: deliveryData,
        contact_details: contactData,
        payment_method: selectedPaymentId
      }, items);

      await clearCart();
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (error) {
      console.error("Order processing failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
  const totalMRP = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + ((item.mrp || item.price) * item.quantity), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }, [items]);

  const couponDiscount = getCouponDiscount();
  const couponCode = coupon?.code || "";

  const shippingCharge = deliveryData?.shippingPrice || 0;
  const codCharge = selectedPaymentId === 'cod' ? 13 : 0;
  const finalTotal = useMemo(() => subtotal + shippingCharge + codCharge - couponDiscount, [subtotal, shippingCharge, codCharge, couponDiscount]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[80px]">
      <DynamicPageNav title="Checkout" />

      <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px] mb-[48px] lg:mb-0">

        {/* LEFT COLUMN: Checkout Flow */}
        <div className="flex-1 flex flex-col gap-[12px]">

          <CheckoutPriceHeader
            totalAmount={`NPR ${finalTotal.toLocaleString()}`}
            mrp={totalMRP}
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            couponCode={couponCode}
            shippingCharge={shippingCharge}
            codCharge={codCharge}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
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
                onPlaceOrder={handlePlaceOrder}
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
                mrpAmount={`NPR ${totalMRP.toLocaleString()}`}
                buttonText={isProcessing ? "Processing..." : "Place Order"}
                onCheckout={handlePlaceOrder}
              />
            </div>
          </div>
        </aside>
      </main>

      <CheckoutPrompt />

      {/* Mobile Sticky Bar */}
      <CartCheckoutBar
        totalAmount={`NPR ${finalTotal.toLocaleString()}`}
        mrpAmount={`NPR ${totalMRP.toLocaleString()}`}
        buttonText={isProcessing ? "Processing..." : "Place Order"}
        onCheckout={handlePlaceOrder}
      />
    </div>
  );
}