'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import DeliveryAddress from '@/components/cart/DeliveryAddress';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';
import CartCoupons from '@/components/cart/CartCoupons';
import { useCartStore } from '@/store/cartStore';
import CheckoutPrompt from '@/components/checkout/CheckoutPrompt';

export default function CartPage() {

  const router = useRouter();
  const { items, loadCart, getCouponDiscount } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // 1. CALCULATE TOTALS
  const subtotal = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }, [items]);

  const totalMRP = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + ((item.mrp || item.price) * item.quantity), 0);
  }, [items]);

  const couponDiscount = getCouponDiscount();
  const finalTotal = subtotal - couponDiscount;

  // 2. HANDLERS
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className={`min-h-screen bg-[#f7faf6] pt-[81px] ${items.length > 0 ? 'mb-[80px]' : ''}`}>
      {/* STICKY NAV */}
      <DynamicPageNav title="My Cart" subtitle={`${items.length} Items`} />

      <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px] mb-[48px] lg:mb-0">

        {/* LEFT COLUMN: Items, Delivery, and Coupons */}
        <div className="flex-1 flex flex-col gap-[12px]">
          {items.length > 0 && (
            <DeliveryAddress
              name="Manjish"
              phoneSuffix="273164"
              address="Baneshwor, Kathmandu, Bus Stop Area"
              type="Home"
              onChange={() => console.log("Change address")}
            />
          )}

          {/* List of Cart Items */}
          <div className="flex flex-col gap-[12px]">
            {items.map((item: any) => (
              <CartItem key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="flex flex-col w-full items-center justify-center py-[100px] px-[24px] gap-[16px]">
                <div className="relative w-[125px] h-[125px] lg:w-[150px] lg:h-[150px] mb-[8px]">
                  <Image
                    src="/images/empty-cart.png"
                    alt="Empty Cart"
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="font-custom text-[22px] text-[#242424] text-center leading-tight">
                  Your Cart is Empty
                </h2>
                <p className="font-titillium text-[16px] text-[#8a8e91] text-center mt-[-8px]">
                  Stack up your daily dose of fitness now!
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="mt-[12px] flex h-[48px] items-center justify-center rounded-[16px] bg-[#3F9733] hover:bg-[#347d2a] px-[32px] font-titillium text-[16px] font-semibold text-white transition-all active:scale-[0.98] outline-none shadow-sm"
                >
                  Shop Now
                </button>
              </div>
            )}
          </div>

          {/* COUPONS SECTION: Placed between items and summary as requested */}
          {items.length > 0 && (
            <div className="lg:hidden">
              <CartCoupons onApply={() => { }} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Summary & Desktop Checkout (Sticky) */}
        {items.length > 0 && (
          <aside className="w-full lg:w-[380px] mt-[12px] lg:mt-0 h-fit">
            <div className="lg:sticky lg:top-[105px] flex flex-col gap-[16px]">

              <CartSummary />
              <div className="hidden lg:block">
                <CartCoupons onApply={() => { }} />
              </div>

              {/* Desktop Static Bar: Hidden on Mobile */}
              <div className="hidden lg:block">
                <CartCheckoutBar
                  isStatic={true}
                  totalAmount={`NPR ${finalTotal}`}
                  mrpAmount={`NPR ${totalMRP}`}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </aside>
        )}
      </main>

      <CheckoutPrompt />

      {/* Mobile Fixed Bar: Hidden on Desktop via component logic */}
      {items.length > 0 && (
        <CartCheckoutBar
          totalAmount={`NPR ${finalTotal.toLocaleString()}`}
          mrpAmount={`NPR ${totalMRP.toLocaleString()}`}
          buttonText="Checkout"
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}