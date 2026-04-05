"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FlavourSelection from './FalvourSelction';
import SizeSelection from './SizeSelction';
import OfferCard from './OfferCard';
import DeliveryDetails from './DeliveryDetails';
import { useToast } from '@/components/ui/ToastProvider';

const ProductOptions: React.FC = () => {
  const [isInCart, setIsInCart] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleAddToCart = () => {
    if (!isInCart) {
      showToast("Successfully Added to Cart", "success");
      setIsInCart(true);
    } else {
      router.push('/cart');
    }
  };

  return (
    <section className="relative flex w-full lg:max-w-none flex-col items-start gap-[30px] lg:gap-[40px] mx-auto lg:mx-0">
      <FlavourSelection />
      <SizeSelection />
      {/* Desktop Only CTA */}
      <div className="hidden lg:flex w-full flex-row gap-[16px] mt-[-10px]">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 h-[60px] rounded-[12px] border border-[#E8E8E8] bg-white text-[#4d4d4d] font-titillium text-[18px] font-semibold transition-all active:scale-[0.98] outline-none"
        >
          {isInCart ? "Go to cart" : "Add to cart"}
        </button>
        <button
          type="button"
          className="flex-1 h-[60px] rounded-[12px] bg-[#ffe900] text-[#1e1e1e] font-titillium text-[18px] font-semibold transition-all active:scale-[0.98] outline-none"
        >
          Buy Now
        </button>
      </div>
      <OfferCard />



      <DeliveryDetails />
    </section>
  );
};

export default ProductOptions;