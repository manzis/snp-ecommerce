'use client';

import React from 'react';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import DeliveryAddress from '@/components/cart/DeliveryAddress';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';

const MOCK_CART = [
  { id: 1, name: "Asitis atom whey protein concerntrate", brand: "Asitis Nutrition", image: "/images/atom-whey.jpg", originalPrice: "RS. 5000", discountedPrice: "RS. 1890", size: "2Kg", flavor: "Vanilla", qty: 1, deliveryDate: "Apr 22, Thu" },
  { id: 2, name: "Naturaltein Omega 3 fish oil", brand: "Naturltein", image: "/images/magnesium.jpg", originalPrice: "RS. 5000", discountedPrice: "RS. 1890", size: "1Kg", flavor: "No Flavour", qty: 1, deliveryDate: "Apr 22, Thu" }
];

export default function CartPage() {
  const handleCheckout = () => console.log("Checkout...");

  return (
    <div className="min-h-screen bg-[#f7faf6] pt-[81px] pb-[80px]">
      <DynamicPageNav title="My Cart" subtitle={`${MOCK_CART.length} Items`} />

      <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px]">
        
        {/* LEFT COLUMN: Items & Delivery */}
        <div className="flex-1 flex flex-col gap-[12px]">
          <DeliveryAddress 
            name="Manjish" phoneSuffix="273164" 
            address="Baneshwor, Kathmandu, Bus Stop Area" 
            type="Home" onChange={() => {}} 
          />
          <div className="flex flex-col gap-[12px]">
            {MOCK_CART.map(item => <CartItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & Desktop Checkout */}
        <aside className="w-full lg:w-[380px] mt-[12px] lg:mt-0 h-fit">
          <div className="lg:sticky lg:top-[105px] flex flex-col">
            <CartSummary />
            
            {/* Desktop Static Bar: Only visible on large screens, with top margin */}
            <div className="hidden lg:block mt-[16px] ">
              <CartCheckoutBar 
                isStatic={true}
                totalAmount="NPR 2000"
                mrpAmount="NPR 2000"
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Fixed Bar: Only visible on small screens (lg:hidden is inside the component) */}
      <CartCheckoutBar 
        totalAmount="NPR 2000"
        mrpAmount="NPR 2000"
        onCheckout={handleCheckout}
      />
    </div>
  );
}