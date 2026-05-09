'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CheckoutPriceHeader from '@/components/checkout/CheckoutPriceHeader';
import ContactSection, { ContactSectionHandle } from '@/components/checkout/ContactSection';
import DeliverySection, { DeliverySectionHandle } from '@/components/checkout/DeliverySection';
import PaymentSection from '@/components/checkout/PaymentSection';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';
import CheckoutLoader from '@/components/checkout/CheckoutLoader';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { validateCoupon } from '@/services/couponService';
import { placeOrderAction } from '@/app/actions/orderActions';
import { uploadFileAction } from '@/app/actions/storageActions';
import { supabase } from '@/lib/supabase/client';
import CheckoutPrompt from '@/components/checkout/CheckoutPrompt';
import CheckoutCancelModal from '@/components/checkout/CheckoutCancelModal';
import { recordAbandonedCheckoutAction } from '@/app/actions/marketingActions';
import { useUIStore } from '@/store/uiStore';

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);

  // 1. STATE MANAGEMENT
  const activeStep = useCheckoutStore((state) => state.activeStep);
  const setActiveStep = useCheckoutStore((state) => state.setActiveStep);
  const completedSteps = useCheckoutStore((state) => state.completedSteps);
  const setCompletedSteps = useCheckoutStore((state) => state.setCompletedSteps);
  const router = useRouter();

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
  const [processingMessage, setProcessingMessage] = useState("Processing your order...");
  const [isValidating, setIsValidating] = useState(false);

  const contactData = useCheckoutStore((state) => state.contactData);
  const setContactData = useCheckoutStore((state) => state.setContactData);
  
  const deliveryData = useCheckoutStore((state) => state.deliveryData);
  const setDeliveryData = useCheckoutStore((state) => state.setDeliveryData);
  
  const selectedPaymentId = useCheckoutStore((state) => state.selectedPaymentId);
  const setSelectedPaymentId = useCheckoutStore((state) => state.setSelectedPaymentId);
  const resetCheckout = useCheckoutStore((state) => state.reset);

  const [contactError, setContactError] = useState<string | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // ABANDONED CART RECOVERY
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const setHideBottomNav = useUIStore((state) => state.setHideBottomNav);

  // REFS
  const contactRef = useRef<ContactSectionHandle>(null);
  const deliveryRef = useRef<DeliverySectionHandle>(null);
  const deliveryScrollRef = useRef<HTMLDivElement>(null);
  const paymentsRef = useRef<HTMLDivElement>(null);
  const [qrData, setQrData] = useState<{ qrFile: File | null; qrRemarks: string }>({ qrFile: null, qrRemarks: 'Shopping Payment' });

  useEffect(() => {
    setIsMounted(true);
    const isNewCheckout = !sessionStorage.getItem('checkout_initiated');
    if (isNewCheckout) {
      useCheckoutStore.getState().clearSelections();
      sessionStorage.setItem('checkout_initiated', 'true');
    }
  }, []);

  useEffect(() => {
    if (isMounted && items.length === 0) {
      resetCheckout();
      sessionStorage.removeItem('checkout_initiated');
    }
  }, [items.length, isMounted, resetCheckout]);

  // HANDLERS
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

  // SMART NEXT STEP DRIVER
  const handlePlaceOrder = async (overrideQrData?: { qrFile?: File | null; qrRemarks?: string }) => {
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // 1. Contact Validation
    const isContactValid = completedSteps.includes('contact') && contactData.value?.trim();
    if (!isContactValid) {
      const success = contactRef.current?.validateAndConfirm();
      if (!success) {
        setContactError("Required: Please confirm your contact details");
        setActiveStep('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      return; 
    }

    // 2. Delivery Validation
    const isDeliveryValid = completedSteps.includes('delivery') && deliveryData?.addressId && deliveryData?.option;
    if (!isDeliveryValid) {
      const success = deliveryRef.current?.handleConfirm();
      if (success !== true) {
        setDeliveryError("Please complete delivery details to continue");
        setActiveStep('delivery');
        deliveryScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      return;
    }

    // 3. Payments Step Focus
    if (!selectedPaymentId) {
      setPaymentError("Choose a payment method to continue");
      setActiveStep('payments');
      paymentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const unavailableMethods = ['cards', 'netbanking', 'wallets'];
    if (unavailableMethods.includes(selectedPaymentId)) {
      alert("This payment method is currently undergoing maintenance. Please choose another method.");
      setActiveStep('payments');
      return;
    }

    // --- FINAL ORDER PLACEMENT ---
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      currentUserId = user.id;
    }

    setIsProcessing(true);
    setProcessingMessage("Initializing...");
    try {
      const finalQrData = overrideQrData || qrData;
      let paymentScreenshotUrl = null;
      
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
        
        setProcessingMessage("Uploading receipt...");
        const uploadRes = await uploadFileAction(formData);
        if (uploadRes.success) {
          paymentScreenshotUrl = uploadRes.url;
        } else {
          setPaymentError("Screenshot upload failed. Please try again.");
          setIsProcessing(false);
          return;
        }
      }

      setProcessingMessage("Securing your order...");
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
        setProcessingMessage("Finalizing...");
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

  const handleBackAttempt = () => {
    // Only show modal if delivery is filled
    if (completedSteps.includes('delivery')) {
      setShowCancelModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmExit = async () => {
    setIsAbandoning(true);
    try {
      // Record Abandoned Checkout
      await recordAbandonedCheckoutAction({
        user_id: userId,
        customer_details: {
          ...contactData,
          ...deliveryData,
          ...deliveryData?.addressDetails,
          contact_value: contactData.value // Explicitly store value
        },
        items: items,
        total_amount: finalTotal,
        session_id: typeof window !== 'undefined' ? localStorage.getItem('cart_session_id') : null
      });
      
      // Clear flags and prepare for jump
      sessionStorage.removeItem('checkout_initiated');
      resetCheckout();
      
      // If we have pushed an extra state for back-button interception, go back 3 times
      // to land on the Product page (skipping dummy, checkout, and cart).
      if (completedSteps.includes('delivery')) {
        window.history.go(-3);
      } else {
        router.back();
      }

      // Small delay fallback to ensure we leave checkout
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/checkout')) {
          window.location.replace('/cart');
        }
      }, 150);

    } catch (error) {
      console.error("Failed to record abandonment:", error);
      window.location.replace('/cart');
    } finally {
      setIsAbandoning(false);
      setShowCancelModal(false);
    }
  };

  const hasPushedState = useRef(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (completedSteps.includes('delivery') && !showCancelModal) {
        // Stop browser back
        window.history.pushState(null, '', window.location.href);
        setShowCancelModal(true);
      }
    };

    if (completedSteps.includes('delivery') && !hasPushedState.current) {
      window.history.pushState(null, '', window.location.href);
      hasPushedState.current = true;
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [completedSteps, showCancelModal]);

  useEffect(() => {
    if (activeStep === 'delivery' && deliveryScrollRef.current) {
      deliveryScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (activeStep === 'payments' && paymentsRef.current) {
      paymentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeStep]);

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
    <>
      <CheckoutLoader isLoading={isProcessing} message={processingMessage} />
      
      <div className={`min-h-screen bg-[#f7faf6] pt-[81px] pb-[80px] transition-all duration-500 ${isProcessing ? 'blur-[4px] pointer-events-none grayscale-[0.2]' : ''}`}>
        <DynamicPageNav title="Checkout" onBack={handleBackAttempt} />
        
        <CheckoutCancelModal 
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmExit}
          isProcessing={isAbandoning}
        />
        
        <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px] mb-[48px] lg:mb-0">
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
              <ContactSection
                ref={contactRef}
                isOpen={activeStep === 'contact'}
                isConfirmed={completedSteps.includes('contact')}
                onConfirm={handleContactConfirm}
                onToggle={() => handleToggle('contact')}
                initialValue={contactData.value}
                initialMarketing={contactData.marketing}
                externalError={contactError}
              />

              <div ref={deliveryScrollRef}>
                <DeliverySection
                  ref={deliveryRef}
                  userId={userId!}
                  isOpen={activeStep === 'delivery'}
                  isConfirmed={completedSteps.includes('delivery')}
                  disabled={!completedSteps.includes('contact')}
                  onConfirm={handleDeliveryConfirm}
                  onToggle={() => {
                    if (completedSteps.includes('contact')) handleToggle('delivery');
                  }}
                  initialAddressId={deliveryData?.addressId}
                  initialOption={deliveryData?.option}
                  externalError={deliveryError}
                />
              </div>

              <div ref={paymentsRef}>
                <PaymentSection
                  isOpen={activeStep === 'payments'}
                  isConfirmed={!!selectedPaymentId}
                  disabled={!completedSteps.includes('delivery') || isProcessing}
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

        <CartCheckoutBar
          totalAmount={`NPR ${finalTotal.toLocaleString()}`}
          mrpAmount={`NPR ${totalMRP.toLocaleString()}`}
          buttonText={mainButtonText}
          onCheckout={handlePlaceOrder}
        />
      </div>
    </>
  );
}
