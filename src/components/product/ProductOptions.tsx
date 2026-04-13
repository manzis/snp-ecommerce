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
  seller: Seller | null;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({ product, sizes, flavours, seller }) => {
  const [isInCart, setIsInCart] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const { selectedSize, selectedFlavorId, setSizeError, setFlavorError, setPrice } = useProductSelectionStore();
  const { addItem } = useCartStore();

  // Handle Dynamic Variant Pricing
  useEffect(() => {
    if (!product.product_variants || product.product_variants.length === 0) {
      // Set base project price
      const discount = parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10);
      const original = parseInt((product.original_price || '0').replace(/\D/g, ''), 10);
      setPrice(discount, original);
      return;
    }

    const matchingVariant = product.product_variants.find(v => {
      const vSizeLabel = product.product_sizes?.find(s => s.id === v.size_id)?.size_label;
      const matchSize = !selectedSize || vSizeLabel === selectedSize;
      const matchFlavor = !selectedFlavorId || v.flavour_id === selectedFlavorId;
      return matchSize && matchFlavor;
    });

    if (matchingVariant) {
      setPrice(matchingVariant.discounted_price, matchingVariant.original_price);
    } else {
      // Use standard product prices if no specific variant combo is selected/found
      const discount = parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10);
      const original = parseInt((product.original_price || '0').replace(/\D/g, ''), 10);
      setPrice(discount, original);
    }
  }, [selectedSize, selectedFlavorId, product, setPrice]);

  useEffect(() => {
    useProductSelectionStore.getState().reset();
  }, [product.id]);

  const executeAddToCart = () => {
    let isValid = true;
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      isValid = false;
    }
    if (flavours.length > 0 && !selectedFlavorId) {
      setFlavorError(true);
      isValid = false;
    }

    if (!isValid) {
      document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return; // <-- Block cart addition
    }

    const { currentPrice, originalPrice } = useProductSelectionStore.getState();

    addItem({
      id: `${product.id}-${selectedSize || 'none'}-${selectedFlavorId || 'none'}`,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brands?.name || 'Store Product',
      price: currentPrice || parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10),
      mrp: originalPrice || parseInt((product.original_price || '0').replace(/\D/g, ''), 10),
      image: product.images?.[0] || '/images/protein.jpg',
      quantity: 1,
      selected_size: selectedSize,
      selected_flavor: flavours.find(f => f.id === selectedFlavorId)?.flavour_name || 'Unflavoured',
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
  }, [selectedSize, selectedFlavorId, product, sizes.length, flavours.length, setSizeError, setFlavorError, addItem, showToast]);

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
          disabled={product.stock_status === 'out_of_stock'}
          className={`flex-1 h-[60px] rounded-[12px] border border-[#E8E8E8] font-titillium text-[18px] font-semibold transition-all outline-none ${product.stock_status === 'out_of_stock' ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white text-[#4d4d4d] active:scale-[0.98]'}`}
        >
          {product.stock_status === 'out_of_stock' ? "Out of Stock" : (isInCart ? "Go to cart" : "Add to cart")}
        </button>
        <button
          type="button"
          disabled={product.stock_status === 'out_of_stock'}
          className={`flex-1 h-[60px] rounded-[12px] font-titillium text-[18px] font-semibold transition-all outline-none ${product.stock_status === 'out_of_stock' ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50' : 'bg-[#ffe900] text-[#1e1e1e] active:scale-[0.98]'}`}
        >
          {product.stock_status === 'out_of_stock' ? "Unavailable" : "Buy Now"}
        </button>
      </div>
      <OfferCard />

      <DeliveryDetails seller={seller} stockStatus={product.stock_status} />
    </section>
  );
};

export default ProductOptions;