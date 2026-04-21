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
import { useCheckoutStore } from '@/store/checkoutStore';
import { validateCoupon } from '@/services/couponService';
import { placeOrderAction } from '@/app/actions/orderActions';
import { uploadFileAction } from '@/app/actions/storageActions';
import { supabase } from '@/lib/supabase/client';
import CheckoutPrompt from '@/components/checkout/CheckoutPrompt';

export default function CheckoutPage() {
  // 0. AVOID HYDRATION MISMATCH FOR LOCALSTORAGE
  const [isMounted, setIsMounted] = useState(false);


  // 1. STATE MANAGEMENT
  const activeStep = useCheckoutStore((state) => state.activeStep);
  const setActiveStep = useCheckoutStore((state) => state.setActiveStep);
  const completedSteps = useCheckoutStore((state) => state.completedSteps);
  const setCompletedSteps = useCheckoutStore((state) => state.setCompletedSteps);
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

  const contactData = useCheckoutStore((state) => state.contactData);
  const setContactData = useCheckoutStore((state) => state.setContactData);
  
  const deliveryData = useCheckoutStore((state) => state.deliveryData);
  const setDeliveryData = useCheckoutStore((state) => state.setDeliveryData);
  
  const selectedPaymentId = useCheckoutStore((state) => state.selectedPaymentId);
  const setSelectedPaymentId = useCheckoutStore((state) => state.setSelectedPaymentId);
  const resetCheckout = useCheckoutStore((state) => state.reset);

  // Validation error triggers
  const [contactError, setContactError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // 2. REFS FOR UX (Smooth Scroll)
  const deliveryRef = useRef<HTMLDivElement>(null);
  const paymentsRef = useRef<HTMLDivElement>(null);
  const [qrData, setQrData] = useState<{ qrFile: File | null; qrRemarks: string }>({ qrFile: null, qrRemarks: 'Shopping Payment' });

  useEffect(() => {
    setIsMounted(true);
    
    // Reset selections on fresh entry to ensure no stale data from old checkouts
    const isNewCheckout = !sessionStorage.getItem('checkout_initiated');
    if (isNewCheckout) {
      useCheckoutStore.getState().clearSelections();
      sessionStorage.setItem('checkout_initiated', 'true');
    }
  }, []);

  // Monitor cart items - if cart becomes empty, reset checkout state completely
  useEffect(() => {
    if (isMounted && items.length === 0) {
      resetCheckout();
      sessionStorage.removeItem('checkout_initiated');
    }
  }, [items.length, isMounted, resetCheckout]);

  // 3. HANDLERS
  const handleContactConfirm = (data: { value: string; marketing: boolean }) => {
    setContactData(data);
    setContactError(null);
    setCompletedSteps((prev) => [...new Set([...prev, 'contact'])]);
    setActiveStep('delivery');
  };

  const handleDeliveryConfirm = (address: any, option: string) => {
    const shippingPrice = option === 'home' ? 150 : 100;
    setDeliveryData({ addressId: address.id, option, shippingPrice, addressDetails: address });
    setDeliveryError(null);
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
    setActiveStep(activeStep === step ? null : step);
  };

  const handlePlaceOrder = async (overrideQrData?: { qrFile?: File | null; qrRemarks?: string }) => {
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // ... Auth and Step validations ...
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      currentUserId = user.id;
    }

    // 1. Validate Contact - If missing or not confirmed, go to contact step and stop
    if (!contactData.value || contactData.value.trim() === '' || !completedSteps.includes('contact')) {
      setContactError("Required: Please confirm your contact details");
      setActiveStep('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Ensure contact is marked as completed if valid
    if (!completedSteps.includes('contact')) {
      setCompletedSteps(prev => [...new Set([...prev, 'contact'])]);
    }

    // 2. Validate Delivery - If missing, go to delivery step and stop
    if (!deliveryData || !completedSteps.includes('delivery')) {
      setDeliveryError("Please complete delivery details to continue");
      setActiveStep('delivery');
      deliveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 3. Validate Payments - If missing, go to payments step and stop
    if (!selectedPaymentId) {
      setPaymentError("Choose a payment method to continue");
      setActiveStep('payments');
      paymentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // NEW: Block unintegrated methods (Removed 'qr' from here)
    const unavailableMethods = ['cards', 'netbanking', 'wallets'];
    if (unavailableMethods.includes(selectedPaymentId)) {
      alert("This payment method is currently undergoing maintenance. Please choose another method.");
      setActiveStep('payments');
      return;
    }

    setIsProcessing(true);
    try {
      const finalQrData = overrideQrData || qrData;
      let paymentScreenshotUrl = null;
      
      // Handle QR Screenshot Upload & Validation
      if (selectedPaymentId === 'qr') {
        if (!finalQrData.qrFile) {
          setPaymentError("Please upload payment receipt to continue");
          setActiveStep('payments');
          setIsProcessing(false);
          paymentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const formData = new FormData();
        formData.append('file', finalQrData.qrFile);
        formData.append('bucket', 'payment-proofs');
        formData.append('path', `orders/${currentUserId}`);
        
        const uploadRes = await uploadFileAction(formData);
        if (uploadRes.success) {
          paymentScreenshotUrl = uploadRes.url;
        } else {
          setPaymentError("Screenshot upload failed. Please try again.");
          setIsProcessing(false);
          return;
        }
      }

      const result = await placeOrderAction({
        user_id: currentUserId,
        total_amount: finalTotal,
        mrp_amount: totalMRP,
        discount_amount: totalMRP - subtotal + couponDiscountValue,
        shipping_amount: shippingCharge,
        discount_on_mrp: totalMRP - subtotal - bundleDiscount,
        bundle_discount: bundleDiscount,
        coupon_discount: couponDiscountValue,
        coupon_code: couponCodeValue || null,
        cod_fees: codCharge,
        tax_amount: 0,
        shipping_address: deliveryData,
        contact_details: contactData,
        payment_method: selectedPaymentId,
        payment_screenshot_url: paymentScreenshotUrl,
        payment_remarks: finalQrData?.qrRemarks || null
      }, items);

      if (result.success) {
        await clearCart();
        resetCheckout();
        sessionStorage.removeItem('checkout_initiated');
        router.push(`/checkout/success?orderId=${result.orderId}`);
      } else {
        alert(result.message || "Failed to place order. Please try again.");
      }
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

  const couponDiscountValue = getCouponDiscount();
  const couponCodeValue = coupon?.code || "";

  const bundleDiscount = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + ((item.bundle_discount || 0) * item.quantity), 0);
  }, [items]);

  const shippingCharge = deliveryData?.shippingPrice || 0;
  const codCharge = selectedPaymentId === 'cod' ? 13 : 0;
  const finalTotal = useMemo(() => subtotal + shippingCharge + codCharge - couponDiscountValue, [subtotal, shippingCharge, codCharge, couponDiscountValue]);

  const mainButtonText = useMemo(() => {
    if (isProcessing) return "Processing...";
    if (!completedSteps.includes('contact')) return "Continue";
    if (!completedSteps.includes('delivery')) return "Continue";
    return "Place Order";
  }, [isProcessing, completedSteps]);

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
            couponDiscount={couponDiscountValue}
            couponCode={couponCodeValue}
            bundleDiscount={bundleDiscount}
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
              initialValue={contactData.value}
              initialMarketing={contactData.marketing}
              externalError={contactError}
            />

            {/* STEP 2: DELIVERY */}
            <div ref={deliveryRef}>
              <DeliverySection
                userId={userId!}
                isOpen={activeStep === 'delivery'}
                isConfirmed={completedSteps.includes('delivery')}
                disabled={!completedSteps.includes('contact')}
                onConfirm={handleDeliveryConfirm}
                onToggle={() => {
                  if (completedSteps.includes('contact')) handleToggle('delivery');
                }}
                externalError={deliveryError}
              />
            </div>

            {/* STEP 3: PAYMENTS */}
            <div ref={paymentsRef}>
              <PaymentSection
                isOpen={activeStep === 'payments'}
                isConfirmed={!!selectedPaymentId}
                disabled={!completedSteps.includes('delivery')}
                selectedId={selectedPaymentId}
                onSelect={(id) => {
                  setSelectedPaymentId(id);
                  setPaymentError(null);
                }}
                onToggle={() => {
                  if (completedSteps.includes('delivery')) handleToggle('payments');
                }}
                onPlaceOrder={handlePlaceOrder}
                onQrDataChange={(data) => setQrData({ qrFile: data.file, qrRemarks: data.remarks })}
                initialQrData={{ file: qrData.qrFile, remarks: qrData.qrRemarks }}
                hasQrError={selectedPaymentId === 'qr' && !!paymentError}
                externalError={paymentError}
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
                buttonText={mainButtonText}
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
        buttonText={mainButtonText}
        onCheckout={handlePlaceOrder}
      />
    </div>
  );
}