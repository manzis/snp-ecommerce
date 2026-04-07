"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlavourSelection from './FalvourSelction';
import SizeSelection from './SizeSelction';
import OfferCard from './OfferCard';
import DeliveryDetails from './DeliveryDetails';
import { useToast } from '@/components/ui/ToastProvider';
import type { ProductSize, ProductFlavour, Seller, Product } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';
import { useProductSelectionStore } from '@/store/productSelectionStore';

interface ProductOptionsProps {
  product: Product;
  sizes: ProductSize[];
  flavours: ProductFlavour[];
  seller: Seller;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({ product, sizes, flavours, seller }) => {
  const [isInCart, setIsInCart] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const { selectedSize, selectedFlavor, setSizeError, setFlavorError } = useProductSelectionStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    useProductSelectionStore.getState().reset();
  }, [product.id]);

  const executeAddToCart = () => {
    let isValid = true;
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      document.getElementById('size-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      isValid = false;
    }
    if (flavours.length > 0 && !selectedFlavor) {
      setFlavorError(true);
      if (isValid) {
        document.getElementById('flavour-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      isValid = false;
    }

    if (!isValid) return;

    addItem({
      id: `${product.id}-${selectedSize || 'none'}-${selectedFlavor || 'none'}`,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brands?.name || 'Store Product',
      price: parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10),
      mrp: parseInt((product.original_price || '0').replace(/\D/g, ''), 10),
      image: product.images?.[0] || '/images/protein.jpg',
      quantity: 1,
      selected_size: selectedSize,
      selected_flavor: flavours.find(f => f.id === selectedFlavor)?.flavour_name || selectedFlavor,
      stock_status: product.stock_status || 'in_stock'
    });

    showToast("Successfully Added to Cart", "success");
    setIsInCart(true);
    window.dispatchEvent(new CustomEvent('addToCartSuccess'));
  };

  useEffect(() => {
    const handleCustomAddToCart = () => executeAddToCart();
    window.addEventListener('requestAddToCart', handleCustomAddToCart);
    return () => window.removeEventListener('requestAddToCart', handleCustomAddToCart);
  }, [selectedSize, selectedFlavor, product, sizes.length, flavours.length, setSizeError, setFlavorError, addItem, showToast]);

  const handleAddToCart = () => {
    if (!isInCart) {
      executeAddToCart();
    } else {
      router.push('/cart');
    }
  };

  return (
    <section className="relative flex w-full lg:max-w-none flex-col items-start gap-[30px] lg:gap-[40px] mx-auto lg:mx-0 px-[24px]">
      <FlavourSelection flavours={flavours} />
      <SizeSelection sizes={sizes} />
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



      <DeliveryDetails seller={seller} />
    </section>
  );
};

export default ProductOptions;