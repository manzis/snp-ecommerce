'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import DeliveryAddress from '@/components/cart/DeliveryAddress';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';
import CartCoupons from '@/components/cart/CartCoupons';

const MOCK_CART = [
  { id: 1, name: "Asitis atom whey protein concerntrate", brand: "Asitis Nutrition", image: "/images/atom-whey.jpg", originalPrice: "RS. 5000", discountedPrice: "1890", size: "2Kg", flavor: "Vanilla", qty: 1, deliveryDate: "Apr 22, Thu" },
  { id: 2, name: "Naturaltein Omega 3 fish oil", brand: "Naturltein", image: "/images/magnesium.jpg", originalPrice: "RS. 5000", discountedPrice: "1890", size: "1Kg", flavor: "No Flavour", qty: 1, deliveryDate: "Apr 22, Thu" }
];

export default function CartPage() {

  const router = useRouter();
  // 1. PRICE LOGIC STATE
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');

  // 2. CALCULATE TOTALS
  // baseSubtotal is the sum of discountedPrice of all items in cart
  const baseSubtotal = useMemo(() => {
    return MOCK_CART.reduce((acc, item) => acc + parseInt(item.discountedPrice), 0);
  }, []);

  const totalMRP = useMemo(() => {
    return MOCK_CART.reduce((acc, item) => acc + parseInt(item.originalPrice.replace(/\D/g, '')), 0);
  }, []);

  const finalTotal = baseSubtotal - couponDiscount;

  // 3. HANDLERS
  const handleApplyCoupon = (amt: number, code: string) => {
    setCouponDiscount(amt);
    setAppliedCode(code);
  };

  const handleCheckout = () => {
    console.log("Proceeding to checkout with total:", finalTotal);
  };

  return (
    <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[80px]">
      {/* STICKY NAV */}
      <DynamicPageNav title="My Cart" subtitle={`${MOCK_CART.length} Items`} />

      <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px]">
        
        {/* LEFT COLUMN: Items, Delivery, and Coupons */}
        <div className="flex-1 flex flex-col gap-[12px]">
          <DeliveryAddress 
            name="Manjish" 
            phoneSuffix="273164" 
            address="Baneshwor, Kathmandu, Bus Stop Area" 
            type="Home" 
            onChange={() => console.log("Change address")} 
          />

          {/* List of Cart Items */}
          <div className="flex flex-col gap-[12px]">
            {MOCK_CART.map(item => (
              <CartItem 
                key={item.id} 
                item={{...item, discountedPrice: `RS. ${item.discountedPrice}`}} 
              />
            ))}
          </div>

          {/* COUPONS SECTION: Placed between items and summary as requested */}
          <CartCoupons onApply={handleApplyCoupon} />
        </div>

        {/* RIGHT COLUMN: Summary & Desktop Checkout (Sticky) */}
        <aside className="w-full lg:w-[380px] mt-[12px] lg:mt-0 h-fit">
          <div className="lg:sticky lg:top-[105px] flex flex-col gap-[16px]">
            
            {/* Pass dynamic values to summary for reactive UI */}
            <CartSummary 
              mrp={totalMRP} 
              subtotal={baseSubtotal} 
              discount={couponDiscount}
              appliedCode={appliedCode}
            />
            
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
      </main>

      {/* Mobile Fixed Bar: Hidden on Desktop via component logic */}
   <CartCheckoutBar 
  totalAmount={`NPR ${finalTotal}`}
  mrpAmount={`NPR ${totalMRP}`}
  buttonText="Checkout"
  onCheckout={() => router.push('/checkout')} 
/>
    </div>
  );
}