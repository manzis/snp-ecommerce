'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import CloseIcon from '@/components/icons/CloseIcon';
import Image from 'next/image';
import ProductSelectionModal from './ProductSelectionModal';
import { Product } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/ToastProvider';
import { useProductSelectionStore } from '@/store/productSelectionStore';
import CartIcon from '@/components/icons/CartIcon';
import { getCartItemId, CartItemType } from '@/services/cartService';



interface BundleDealCardProps {
  mainProduct?: Product;
  currentProductImage?: string;
}

interface SelectedProduct {
  product: Product;
  size: string | null;
  flavor: string | null;
  price: number;
  mrp: number;
}

const SavingsBadge = ({ text, type = 'saved' }: { text: string, type?: 'saved' | 'available' }) => {
  const [particles, setParticles] = React.useState<{ x: number, y: number, rotate: number, scale: number }[]>([]);

  React.useEffect(() => {
    if (type === 'saved') {
      setParticles([...Array(6)].map(() => ({
        x: (Math.random() - 0.5) * 60,
        y: -(Math.random() * 30 + 10),
        rotate: Math.random() * 360,
        scale: Math.random() * 0.5 + 1
      })));
    }
  }, [type]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 5 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
    >
      <div className="relative min-h-[20px]">
        <span 
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border block transition-all ${
            type === 'saved' 
              ? 'bg-gradient-to-r from-[#f0fff4] to-[#f0fff4] border-[#318126]/10 text-[#318126]' 
              : 'bg-white/80 border-dashed border-zinc-200 text-[#71717a]'
          }`}
        >
          {text}
        </span>
        {/* Particle explosion rendered only for 'saved' type on client */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{ 
              scale: [0, p.scale, 0],
              x: p.x,
              y: p.y,
              rotate: p.rotate
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute top-1/2 left-1/2 w-1 h-1 rounded-sm ${i % 2 === 0 ? 'bg-[#33D81D]' : 'bg-[#318126]'}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

const BundleDealCard: React.FC<BundleDealCardProps> = ({ mainProduct, currentProductImage }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const { 
    selectedSize, 
    selectedFlavorId, 
    currentPrice: storePrice, 
    originalPrice: storeMrp,
    setSizeError,
    setFlavorError,
    sizeError,
    flavorError 
  } = useProductSelectionStore();

  const handleSelectProduct = (product: Product, variantInfo: { size: string | null, flavor: string | null, price: number, mrp: number }) => {
    if (selectedProducts.length < 2) {
      setSelectedProducts([...selectedProducts, {
        product,
        ...variantInfo
      }]);
    }
    setIsModalOpen(false);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const totalDiscount = selectedProducts.length === 1 ? 20 : selectedProducts.length === 2 ? 50 : 0;
  const itemsPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const itemsMRP = selectedProducts.reduce((sum, p) => sum + p.mrp, 0);

  const basePrice = mainProduct ? parseInt((mainProduct.discounted_price || '0').replace(/\D/g, ''), 10) : 0;
  const baseMrp = mainProduct ? parseInt((mainProduct.original_price || '0').replace(/\D/g, ''), 10) : 0;

  const currentPrice = (storePrice || basePrice) + itemsPrice - totalDiscount;
  const totalMRPValue = (storeMrp || baseMrp) + itemsMRP;

  const handleAddBundleToCart = () => {
    if (!mainProduct) return;

    // 1. Validation for Main Product (same as ProductOptions.tsx)
    let isValid = true;
    if ((mainProduct.product_sizes?.length || 0) > 0 && !selectedSize) {
      setSizeError(true);
      isValid = false;
    }
    if ((mainProduct.product_flavours?.length || 0) > 0 && !selectedFlavorId) {
      setFlavorError(true);
      isValid = false;
    }

    if (!isValid) {
      // Small delay to let React render the error state before scrolling
      setTimeout(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 10);
      return;
    }

    const mainFlavorName = mainProduct.product_flavours?.find(f => f.id === selectedFlavorId)?.flavour_name || 'Regular';
    const bundleId = `bundle_${Date.now()}`;

    const mainItem = {
      product_id: mainProduct.id,
      selected_size: selectedSize,
      selected_flavor: mainFlavorName,
      bundle_id: bundleId,
      bundle_discount: totalDiscount
    };


    const bundleItems: CartItemType[] = [];

    // 1. Prepare Main Product
    bundleItems.push({
      id: getCartItemId(mainItem),
      ...mainItem,
      name: mainProduct.name,
      slug: mainProduct.slug,
      brand: mainProduct.brands?.name || 'Store Product',
      price: storePrice || basePrice, // Full price
      mrp: storeMrp || baseMrp,
      image: currentProductImage || mainProduct.images?.[0] || '',
      quantity: 1,
      stock_status: mainProduct.stock_status || 'in_stock',
      bundle_discount: totalDiscount // Global bundle discount stored here
    });

    // 2. Prepare Selected Products
    selectedProducts.forEach((p) => {
      const subItem = {
        product_id: p.product.id,
        selected_size: p.size,
        selected_flavor: p.flavor || 'Unflavored',
        bundle_id: bundleId
      };
      
      bundleItems.push({
        id: getCartItemId(subItem),
        ...subItem,
        name: p.product.name,
        slug: p.product.slug,
        brand: p.product.brands?.name || 'Store Product',
        price: p.price,
        mrp: p.mrp,
        image: p.product.images?.[0] || '',
        quantity: 1,
        stock_status: p.product.stock_status || 'in_stock',
        bundle_discount: 0 // Secondary items have no individual discount
      });
    });


    // 3. Add entire bundle batch at once
    const { addItemsBatch } = useCartStore.getState();
    addItemsBatch(bundleItems);



    setIsAddedToCart(true);
    showToast(`Bundle added to cart! Total: Rs. ${currentPrice}`, "success");
    
    // Auto reset "added" state after 3 seconds
    setTimeout(() => setIsAddedToCart(false), 3000);
  };

  return (
    <div
      className="w-full max-w-[700px] flex flex-col rounded-[16px] overflow-hidden border border-[#E8E8E8] font-titillium"
      style={{
        background: 'linear-gradient(87.93deg, #318126 10.71%, #33D81D 124.28%)'
      }}
    >
      {/* Header with Brand Gradient */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-[52px] px-5 flex items-center justify-between text-white transition-all active:opacity-90 relative"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-[24px] h-[24px] flex items-center justify-center">
            <Image
              src="/images/icons/options.png"
              alt="options"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-[16px] font-semibold">Apply offers for maximum savings</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </motion.div>
      </button>

      {/* Body with Light Theme */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-[8px] flex flex-col gap-4 bg-[#FAFAFA] rounded-t-[12px]">
              {/* Main Price matched with ProductHeader pricing style */}
              <div className="flex items-baseline gap-2 px-3 pt-2">
                <h2 className="text-[24px] font-bold bg-[linear-gradient(90deg,#242424_0%,#535353_117.72%)] bg-clip-text text-transparent">
                  Buy at Rs. {currentPrice}
                </h2>
                <span className="text-[16px] text-[#71717a] line-through">
                  Rs. {totalMRPValue}
                </span>
              </div>

              {/* Section 1: Buy More Save More */}
              <div className="bg-white rounded-[12px] p-[16px] flex flex-col gap-3 border border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#71717a]">Buy More Save More</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={selectedProducts.length >= 2}
                    className="text-[#318126] text-[15px] font-bold hover:underline disabled:text-gray-300 disabled:no-underline"
                  >
                    Add Item
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[44px] h-[44px] bg-[#f4f4f5] rounded-[10px] flex items-center justify-center border border-zinc-100 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-bold text-[#242424]">
                      {selectedProducts.length === 0 ? 'Rs. 20 off' : selectedProducts.length === 1 ? 'Rs. 50 off' : 'Rs. 50 Saved!'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] text-[#71717a]">
                        {selectedProducts.length === 0 ? 'Add 1 more item to unlock Rs. 20 off' :
                          selectedProducts.length === 1 ? 'Add 1 more to unlock total Rs. 50 off' :
                            'Maximum bundle discount applied!'}
                      </span>
                      {selectedProducts.length < 2 && <ChevronLeftIcon className="w-3 h-3 text-[#71717a] rotate-180" />}
                    </div>
                  </div>
                </div>

                {/* Item Connection UI */}
                <div className="flex items-center gap-4 mt-2 overflow-x-auto pb-10 no-scrollbar">
                  {/* Fixed First Item (Current Product) */}
                  <div className="flex flex-col items-center gap-1 shrink-0 relative">
                    <div className="w-[60px] h-[60px] bg-white rounded-[12px] border border-zinc-200 p-1 flex items-center justify-center relative shrink-0">
                        {currentProductImage && (
                        <Image src={currentProductImage} alt="current product" width={48} height={48} className="object-contain" />
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </div>
                        {selectedProducts.length === 0 && (
                        <SavingsBadge text="Current" type="available" />
                        )}
                    </div>
                    {((sizeError && !selectedSize) || (flavorError && !selectedFlavorId)) && (
                        <motion.span 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-500 font-bold"
                        >
                            Select Variant
                        </motion.span>
                    )}
                  </div>

                  <div className="shrink-0 h-[2px] w-[16px] bg-[#E8E8E8]" />

                  {/* Second Slot */}
                  <div
                    onClick={!selectedProducts[0] ? () => setIsModalOpen(true) : undefined}
                    className={`w-[60px] h-[60px] rounded-[12px] relative shrink-0 transition-colors ${!selectedProducts[0] ? 'cursor-pointer hover:bg-[#FAFAFA]' : 'bg-white border border-zinc-200'}`}
                    style={!selectedProducts[0] ? {
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23E8E8E8' stroke-width='2' stroke-dasharray='6%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`
                    } : {}}
                  >
                    <div className="w-full h-full p-1 flex items-center justify-center">
                      {selectedProducts[0] ? (
                        <>
                          <SavingsBadge text="Rs. 20 Saved" type="saved" />
                          <Image src={selectedProducts[0].product.images[0]} alt={selectedProducts[0].product.name} width={48} height={48} className="object-contain" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProduct(0);
                            }}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200 shadow-sm text-red-500 hover:bg-red-50 transform hover:scale-110 transition-transform"
                          >
                            <CloseIcon className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5 text-[#d1d1d6]" />
                          <SavingsBadge text="Save Rs. 20" type="available" />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 h-[2px] w-[16px] bg-[#E8E8E8]" />

                  {/* Third Slot */}
                  <div
                    onClick={!selectedProducts[1] ? () => setIsModalOpen(true) : undefined}
                    className={`w-[60px] h-[60px] rounded-[12px] relative shrink-0 transition-colors ${!selectedProducts[1] ? 'cursor-pointer hover:bg-[#FAFAFA]' : 'bg-white border border-zinc-200'}`}
                    style={!selectedProducts[1] ? {
                      backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23E8E8E8' stroke-width='2' stroke-dasharray='6%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`
                    } : {}}
                  >
                    <div className="w-full h-full p-1 flex items-center justify-center">
                      {selectedProducts[1] ? (
                        <>
                          <SavingsBadge text="Rs. 50 Saved" type="saved" />
                          <Image src={selectedProducts[1].product.images[0]} alt={selectedProducts[1].product.name} width={48} height={48} className="object-contain" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProduct(1);
                            }}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200 shadow-sm text-red-500 hover:bg-red-50 transform hover:scale-110 transition-transform"
                          >
                            <CloseIcon className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5 text-[#d1d1d6]" />
                          <SavingsBadge text="Save Rs. 50" type="available" />
                        </>
                      )}
                    </div>
                  </div>


                </div>

                {/* Add to Cart Button for Bundle */}
                <button
                  onClick={handleAddBundleToCart}
                  className={`w-full h-[52px] rounded-[14px] border border-[#E8E8E8] flex items-center justify-center gap-2 group transition-all active:scale-[0.98] mt-2 overflow-hidden relative ${isAddedToCart ? 'bg-[#f0fff4] border-[#318126]' : 'bg-gradient-to-r from-white via-white to-[#f0fff4]/50 hover:border-[#318126]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shine-once" />
                  <CartIcon className={`w-5 h-5 transition-colors ${isAddedToCart ? 'text-[#318126]' : 'text-[#4d4d4d]'}`} />
                  <span className={`text-[15px] font-bold transition-colors ${isAddedToCart ? 'text-[#318126]' : 'text-[#4d4d4d]'}`}>
                    {isAddedToCart ? 'Bundle Added!' : 'Add Bundle to Cart'}
                  </span>
                </button>
              </div>
            </div>

            <ProductSelectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSelect={handleSelectProduct}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BundleDealCard;
