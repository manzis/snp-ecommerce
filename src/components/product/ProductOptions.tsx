"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlavourSelection from './FalvourSelction';
import SizeSelection from './SizeSelction';
import OfferCard from './OfferCard';
import BundleDealCard from './BundleDealCard';
import DeliveryDetails from './DeliveryDetails';
import { useToast } from '@/components/ui/ToastProvider';
import type { ProductSize, ProductFlavour, Seller, Product } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';
import { useProductSelectionStore } from '@/store/productSelectionStore';
import { getCartItemId } from '@/services/cartService';

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

  const {
    selectedSize,
    selectedFlavorId,
    currentPrice,
    originalPrice,
    setSizeError,
    setFlavorError,
    setFlavorId,
    setPrice,
    setActiveVariantImage
  } = useProductSelectionStore();
  const { addItem } = useCartStore();

  // Handle Dynamic Variant Pricing and Image
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
      
      // Try to find the most specific image for this selection
      const flavorImage = (matchingVariant as any).image_url || product.product_flavours?.find(f => f.id === matchingVariant.flavour_id)?.image_url;
      const sizeImage = product.product_sizes?.find(s => s.id === matchingVariant.size_id)?.image_url;
      
      if (flavorImage) {
        setActiveVariantImage(flavorImage);
      } else if (sizeImage) {
        setActiveVariantImage(sizeImage);
      }
    } else {
      // Use standard product prices if no specific variant combo is selected/found
      const discount = parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10);
      const original = parseInt((product.original_price || '0').replace(/\D/g, ''), 10);
      setPrice(discount, original);
    }
  }, [selectedSize, selectedFlavorId, product, setPrice, setActiveVariantImage]);

  useEffect(() => {
    useProductSelectionStore.getState().reset();
  }, [product.id]);

  const mappedSizes = React.useMemo(() => {
    if (!product.product_variants || product.product_variants.length === 0) return sizes;

    return sizes.map(s => {
      const variantsForSize = product.product_variants!.filter(v => v.size_id === s.id);
      if (variantsForSize.length === 0) return s;

      // A size is available if at least one of its variants is available
      const isAvailable = variantsForSize.some(v => v.is_available !== false);
      return {
        ...s,
        is_available: isAvailable
      };
    });
  }, [product.product_variants, sizes]);

  const filteredFlavours = React.useMemo(() => {
    if (!product.product_variants || product.product_variants.length === 0) return flavours;
    if (!selectedSize) return flavours; // Without a size, we leave flavours purely available

    const selectedSizeObj = sizes.find(s => s.size_label === selectedSize);
    if (!selectedSizeObj) return flavours;

    // Scan variants mapped uniquely to this exact Size
    // Do NOT filter out unavailable variants, so we can show them as disabled
    const validVariantRows = product.product_variants.filter(
      v => v.size_id === selectedSizeObj.id
    );

    const validFlavourIds = validVariantRows.map(v => v.flavour_id);

    // Limit down main flavours only to those represented in validVariantRows
    // and explicitly set is_available based on the variant status
    return flavours
      .filter(f => validFlavourIds.includes(f.id))
      .map(f => {
        const variant = validVariantRows.find(v => v.flavour_id === f.id);
        return {
          ...f,
          is_available: variant ? variant.is_available : f.is_available,
          image_url: (variant as any)?.image_url || f.image_url
        };
      });
  }, [product.product_variants, flavours, sizes, selectedSize]);

  useEffect(() => {
    // If the currently selected flavour ceases to exist or becomes unavailable
    if (selectedFlavorId && filteredFlavours.length > 0) {
      const isStillValid = filteredFlavours.some(f => f.id === selectedFlavorId && f.is_available !== false);
      if (!isStillValid) {
        const firstAvailable = filteredFlavours.find(f => f.is_available !== false);
        if (firstAvailable) {
          setFlavorId(firstAvailable.id); // Auto-force nearest valid available item
        } else {
          setFlavorId(null);
        }
      }
    } else if (filteredFlavours.length === 0 && selectedFlavorId !== null) {
      setFlavorId(null); // Size mapping dictates 'No Flavour'
    }
  }, [filteredFlavours, selectedFlavorId, setFlavorId]);

  const executeAddToCart = () => {
    let isValid = true;
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      isValid = false;
    }
    if (filteredFlavours.length > 0 && !selectedFlavorId) {
      setFlavorError(true);
      isValid = false;
    }

    if (!isValid) {
      setTimeout(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return; // <-- Block cart addition
    }

    const { currentPrice, originalPrice } = useProductSelectionStore.getState();

    const itemData = {
      product_id: product.id,
      selected_size: selectedSize,
      selected_flavor: flavours.find(f => f.id === selectedFlavorId)?.flavour_name || 'Unflavoured'
    };

    const selectedFlavour = flavours.find(f => f.id === selectedFlavorId);
    const itemImage = (selectedFlavour?.image_url || product.images?.[0] || '/images/protein.webp').trim();

    addItem({
      id: getCartItemId(itemData),
      ...itemData,
      name: product.name,
      slug: product.slug,
      brand: product.brands?.name || 'Store Product',
      price: currentPrice || parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10),
      mrp: originalPrice || parseInt((product.original_price || '0').replace(/\D/g, ''), 10),
      image: itemImage,
      quantity: 1,
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

  useEffect(() => {
    const handleBuyNow = () => {
      let isValid = true;
      if (sizes.length > 0 && !selectedSize) { setSizeError(true); isValid = false; }
      if (filteredFlavours.length > 0 && !selectedFlavorId) { setFlavorError(true); isValid = false; }
      if (!isValid) {
        setTimeout(() => {
          document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
        return;
      }
      const { currentPrice, originalPrice } = useProductSelectionStore.getState();
      const itemData = {
        product_id: product.id,
        selected_size: selectedSize,
        selected_flavor: flavours.find(f => f.id === selectedFlavorId)?.flavour_name || 'Unflavoured'
      };
      const itemId = getCartItemId(itemData);
      const alreadyInCart = useCartStore.getState().items.some(i => i.id === itemId);

      if (!alreadyInCart) {
        const selectedFlavour = flavours.find(f => f.id === selectedFlavorId);
        const itemImage = (selectedFlavour?.image_url || product.images?.[0] || '/images/protein.webp').trim();

        addItem({
          id: itemId,
          ...itemData,
          name: product.name,
          slug: product.slug,
          brand: product.brands?.name || 'Store Product',
          price: currentPrice || parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10),
          mrp: originalPrice || parseInt((product.original_price || '0').replace(/\D/g, ''), 10),
          image: itemImage,
          quantity: 1,
          stock_status: product.stock_status || 'in_stock'
        });

        window.dispatchEvent(new CustomEvent('addToCartSuccess'));
      }
      window.dispatchEvent(new CustomEvent('buyNowCartSuccess'));
    };
    window.addEventListener('requestBuyNow', handleBuyNow);
    return () => window.removeEventListener('requestBuyNow', handleBuyNow);
  }, [selectedSize, selectedFlavorId, product, sizes.length, filteredFlavours.length, setSizeError, setFlavorError, addItem, flavours]);

  // Prefetch /cart for snappy Buy Now navigation
  useEffect(() => {
    router.prefetch('/cart');
  }, [router]);

  const handleAddToCart = () => {
    if (!isInCart) {
      executeAddToCart();
    } else {
      if (window.innerWidth >= 1024) {
        useCartStore.getState().setCartOpen(true);
      } else {
        router.push('/cart');
      }
    }
  };

  const handleDesktopBuyNow = async () => {
    // Validate selections
    let isValid = true;
    if (sizes.length > 0 && !selectedSize) { setSizeError(true); isValid = false; }
    if (filteredFlavours.length > 0 && !selectedFlavorId) { setFlavorError(true); isValid = false; }
    if (!isValid) {
      setTimeout(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    const { currentPrice, originalPrice } = useProductSelectionStore.getState();
    const itemData = {
      product_id: product.id,
      selected_size: selectedSize,
      selected_flavor: flavours.find(f => f.id === selectedFlavorId)?.flavour_name || 'Unflavoured'
    };
    const itemId = getCartItemId(itemData);
    const alreadyInCart = useCartStore.getState().items.some(i => i.id === itemId);

    if (!alreadyInCart) {
      const selectedFlavour = flavours.find(f => f.id === selectedFlavorId);
      const itemImage = (selectedFlavour?.image_url || product.images?.[0] || '/images/protein.webp').trim();
      addItem({
        id: itemId,
        ...itemData,
        name: product.name,
        slug: product.slug,
        brand: product.brands?.name || 'Store Product',
        price: currentPrice || parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10),
        mrp: originalPrice || parseInt((product.original_price || '0').replace(/\D/g, ''), 10),
        image: itemImage,
        quantity: 1,
        stock_status: product.stock_status || 'in_stock'
      });
      window.dispatchEvent(new CustomEvent('addToCartSuccess'));
    }

    // Wait for Zustand persist middleware to flush to localStorage
    await new Promise(resolve => setTimeout(resolve, 100));
    if (window.innerWidth >= 1024) {
      useCartStore.getState().setCartOpen(true);
    } else {
      router.push('/cart');
    }
  };

  return (
    <section className="relative flex w-full lg:max-w-none flex-col items-start gap-[30px] lg:gap-[40px] mx-auto lg:mx-0 px-[24px]">
      <FlavourSelection flavours={filteredFlavours} baseImage={product.images?.[0]} />
      <SizeSelection sizes={mappedSizes} />
      {/* Inline CTA (Mobile + Desktop) */}
      <div id="inline-cta-container" className="flex w-full flex-row gap-[12px] lg:gap-[16px] mt-[-4px] mb-0 lg:mt-[-8px] lg:mb-[-4px]">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock_status === 'out_of_stock'}
          className={`flex-1 h-[56px] lg:h-[60px] rounded-[10px] lg:rounded-[12px] border border-[#E8E8E8] font-rajdhani text-[17px] lg:text-[18px] uppercase font-bold tracking-[-0.015em] transition-all outline-none ${product.stock_status === 'out_of_stock' ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white text-[#4d4d4d] active:scale-[0.98]'}`}
        >
          {product.stock_status === 'out_of_stock' ? "Out of Stock" : (isInCart ? "Go to cart" : "Add to cart")}
        </button>
        <button
          type="button"
          onClick={handleDesktopBuyNow}
          disabled={product.stock_status === 'out_of_stock'}
          className={`flex-1 h-[56px] lg:h-[60px] rounded-[10px] lg:rounded-[12px] font-rajdhani text-[17px] lg:text-[18px] uppercase font-bold tracking-[-0.015em] transition-all outline-none ${product.stock_status === 'out_of_stock' ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50' : 'bg-[#ffe900] text-[#1e1e1e] active:scale-[0.98]'}`}
        >
          {product.stock_status === 'out_of_stock' ? "Unavailable" : "Buy Now"}
        </button>
      </div>

      <OfferCard />

      {product.stock_status !== 'out_of_stock' && (
        <BundleDealCard
          mainProduct={product}
          currentProductImage={flavours.find(f => f.id === selectedFlavorId)?.image_url || product.images?.[0]}
        />
      )}

      <DeliveryDetails seller={seller} stockStatus={product.stock_status} />
    </section>
  );
};

export default ProductOptions;
