'use client';

import React, { useState } from 'react';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import DiscountIcon from '@/components/icons/DiscountIcon';
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

interface VariantInfo {
  size: string | null;
  flavor: string | null;
  image_url: string | null;
  price: number;
  mrp: number;
}

interface SelectedProduct {
  product: Product;
  size: string | null;
  flavor: string | null;
  image_url: string | null;
  price: number;
  mrp: number;
}

const SavingsBadge = ({ text, type = 'saved' }: { text: string, type?: 'saved' | 'available' }) => {
  return (
    <div
      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 animate-slide-up"
    >
      <div className="relative min-h-[20px]">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border block transition-all ${type === 'saved'
              ? 'bg-gradient-to-r from-[#f0fff4] to-[#f0fff4] border-[#318126]/10 text-[#318126]'
              : 'bg-white/80 border-dashed border-zinc-200 text-[#71717a]'
            }`}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

const BundleDealCard: React.FC<BundleDealCardProps> = ({ mainProduct, currentProductImage }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBulkQty, setPendingBulkQty] = useState<'buy2' | 'buy3' | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loadingBundle, setLoadingBundle] = useState<string | null>(null);

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

  const handleSelectProduct = (product: Product, variantInfo: VariantInfo) => {
    if (selectedProducts.length < 2) {
      setSelectedProducts([...selectedProducts, {
        product,
        ...variantInfo
      }]);
    }
    setIsModalOpen(false);
  };

  const handleSelectBulk = (product: Product, selections: VariantInfo[]) => {
    if (pendingBulkQty) {
      setLoadingBundle(pendingBulkQty);
      executeBundleAddition(pendingBulkQty, selections);
      setPendingBulkQty(null);
      setIsModalOpen(false);
    }
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const interactiveDiscount = selectedProducts.length === 1 ? 20 : selectedProducts.length === 2 ? 60 : 0;
  const itemsPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const itemsMRP = selectedProducts.reduce((sum, p) => sum + p.mrp, 0);

  const basePrice = mainProduct ? parseInt((mainProduct.discounted_price || '0').replace(/\D/g, ''), 10) : 0;
  const baseMrp = mainProduct ? parseInt((mainProduct.original_price || '0').replace(/\D/g, ''), 10) : 0;

  const currentPriceRaw = (storePrice || basePrice) + itemsPrice - interactiveDiscount;
  const displayPrice = selectedProducts.length === 0 ? currentPriceRaw - 100 : currentPriceRaw;
  const totalMRPValue = (storeMrp || baseMrp) + itemsMRP;

  const validateMainProduct = (isQtyBundle = false) => {
    if (!mainProduct) return false;
    let isValid = true;
    if ((mainProduct.product_sizes?.length || 0) > 0 && !selectedSize) {
      if (!isQtyBundle) setSizeError(true);
      isValid = false;
    }
    if ((mainProduct.product_flavours?.length || 0) > 0 && !selectedFlavorId) {
      if (!isQtyBundle) setFlavorError(true);
      isValid = false;
    }

    if (!isValid && !isQtyBundle) {
      setTimeout(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 10);
    }
    return isValid;
  };

  const handleAddBundleToCart = (type: 'interactive' | 'buy2' | 'buy3') => {
    if (!mainProduct) return;

    // For quantity bundles, open ProductSelectionModal in bulk mode
    if (type === 'buy2' || type === 'buy3') {
      setPendingBulkQty(type);
      setIsModalOpen(true);
      return;
    }

    if (type === 'interactive' && !validateMainProduct()) return;

    setLoadingBundle(type);
    executeBundleAddition(type);
  };

  const executeBundleAddition = (type: 'interactive' | 'buy2' | 'buy3', selectionsOverride?: VariantInfo[]) => {
    if (!mainProduct) return;

    const bundleId = `bundle_${Date.now()}`;
    const { addItemsBatch } = useCartStore.getState();

    let bundleItems: CartItemType[] = [];
    let discount = 0;
    let finalPrice = 0;

    if (type === 'interactive') {
      const selectedFlavourObj = mainProduct.product_flavours?.find(f => f.id === selectedFlavorId);
      const activeFlavor = selectedFlavourObj?.flavour_name || null;
      const mainImage = selectedFlavourObj?.image_url || currentProductImage || mainProduct.images?.[0] || '';
      
      discount = interactiveDiscount;
      finalPrice = currentPriceRaw;

      const totalInteractiveItems = selectedProducts.length + 1;
      const perItemDiscount = discount / totalInteractiveItems;

      bundleItems.push({
        id: getCartItemId({ product_id: mainProduct.id, selected_size: selectedSize, selected_flavor: activeFlavor, bundle_id: bundleId }),
        product_id: mainProduct.id,
        selected_size: selectedSize,
        selected_flavor: activeFlavor,
        bundle_id: bundleId,
        bundle_discount: perItemDiscount,
        name: mainProduct.name,
        slug: mainProduct.slug,
        brand: mainProduct.brands?.name || 'Store Product',
        price: storePrice || basePrice,
        mrp: storeMrp || baseMrp,
        image: mainImage,
        quantity: 1,
        stock_status: mainProduct.stock_status || 'in_stock'
      });

      selectedProducts.forEach(p => {
        const subItemData = { product_id: p.product.id, selected_size: p.size, selected_flavor: p.flavor || null, bundle_id: bundleId };
        bundleItems.push({
          id: getCartItemId(subItemData),
          ...subItemData,
          name: p.product.name,
          slug: p.product.slug,
          brand: p.product.brands?.name || 'Store Product',
          price: p.price,
          mrp: p.mrp,
          image: p.image_url || p.product.images?.[0] || '',
          quantity: 1,
          stock_status: p.product.stock_status || 'in_stock',
          bundle_discount: perItemDiscount
        });
      });
    } else {
      // Handle Buy 2/3 Pack with potential different variants per item
      const selections = selectionsOverride || [];
      discount = type === 'buy2' ? 50 : 100;

      finalPrice = selections.reduce((sum, s) => sum + s.price, 0) - discount;

      selections.forEach((s, i) => {
        const itemData = { product_id: mainProduct.id, selected_size: s.size, selected_flavor: s.flavor || null, bundle_id: bundleId };
        bundleItems.push({
          id: getCartItemId(itemData),
          ...itemData,
          name: mainProduct.name,
          slug: mainProduct.slug,
          brand: mainProduct.brands?.name || 'Store Product',
          price: s.price,
          mrp: s.mrp,
          image: s.image_url || currentProductImage || mainProduct.images?.[0] || '',
          quantity: 1,
          stock_status: mainProduct.stock_status || 'in_stock',
          bundle_discount: discount / selections.length
        });
      });
    }

    addItemsBatch(bundleItems);
    showToast(`Bundle added to cart! Total: Rs. ${finalPrice}`, "success");

    setTimeout(() => setLoadingBundle(null), 2000);
  };

  const buy2PriceMin = ((storePrice || basePrice) * 2) - 50;
  const buy3PriceMin = ((storePrice || basePrice) * 3) - 100;

  return (
    <div
      className="w-full max-w-[700px] flex flex-col rounded-[16px] overflow-hidden  font-rajdhani"
      style={{ background: 'linear-gradient(87.93deg, #318126 10.71%, #33D81D 124.28%)' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-[52px] px-5 flex items-center justify-between text-white transition-all active:opacity-90 relative"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-[24px] h-[24px] flex items-center justify-center">
            <Image src="/images/icons/options.png" alt="options" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-[16px] font-semibold">Apply offers for maximum savings</span>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </div>
      </button>

      <>
        {isExpanded && (
          <div className="overflow-hidden animate-page-enter">
            <div className="p-[8px] flex flex-col gap-2 bg-[#FAFAFA] rounded-t-[12px]">

              <div className="flex items-baseline gap-2 px-3 pt-2">
                <h2 className="font-rajdhani text-[24px] font-bold bg-[linear-gradient(90deg,#242424_0%,#535353_117.72%)] bg-clip-text text-transparent leading-none">
                  Buy at Rs. {displayPrice}
                </h2>
                <span className="text-[16px] text-[#71717a] line-through">
                  Rs. {totalMRPValue}
                </span>
              </div>

              {/* Mix & Match Section */}
              <div className="bg-white rounded-[12px] p-[16px] flex flex-col gap-3 border border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#71717a]">Mix & Match Bundle</span>
                  <button
                    onClick={() => {
                      setPendingBulkQty(null);
                      setIsModalOpen(true);
                    }}
                    disabled={selectedProducts.length >= 2}
                    className="text-[#318126] text-[15px] font-bold hover:underline disabled:text-gray-300 disabled:no-underline transition-colors"
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
                      {selectedProducts.length === 0 ? 'Rs. 20 off' : selectedProducts.length === 1 ? 'Rs. 40 off' : 'Rs. 60 Saved!'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] leading-none pt-[1px] text-[#71717a]">
                        {selectedProducts.length === 0 ? 'Add 1 more item to unlock Rs. 20 off' :
                          selectedProducts.length === 1 ? 'Add 1 more to get Rs. 40 more off' :
                            'Maximum bundle discount applied!'}
                      </span>
                      {selectedProducts.length < 2 && <DiscountIcon className="w-[14px] h-[14px] text-[#71717a] shrink-0" />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 overflow-x-auto pb-10 no-scrollbar">
                  <div className="flex flex-col items-center gap-1 shrink-0 relative">
                    <div className="w-[60px] h-[60px] bg-white rounded-[12px] border border-zinc-200 p-1 flex items-center justify-center relative shrink-0">
                      {currentProductImage && <Image src={currentProductImage} alt="main" width={48} height={48} className="object-contain" />}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </div>
                      {selectedProducts.length === 0 && <SavingsBadge text="Current" type="available" />}
                    </div>
                    {((sizeError && !selectedSize) || (flavorError && !selectedFlavorId)) && (
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-red-500 font-bold animate-slide-up">
                        Select Variant
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 h-[2px] w-[16px] bg-[#E8E8E8]" />

                  {/* Slot 1 */}
                  <div
                    onClick={!selectedProducts[0] ? () => { setPendingBulkQty(null); setIsModalOpen(true); } : undefined}
                    className={`w-[60px] h-[60px] rounded-[12px] relative shrink-0 transition-colors ${!selectedProducts[0] ? 'cursor-pointer hover:bg-[#f0fff4]' : 'bg-white border border-zinc-200'}`}
                  >
                    {!selectedProducts[0] && (
                      <div 
                        className="absolute inset-0 rounded-[12px] pointer-events-none animate-pulse" 
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23318126' stroke-width='2' stroke-dasharray='6%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")` }} 
                      />
                    )}
                    <div className="w-full h-full p-1 flex items-center justify-center relative z-10">
                      {selectedProducts[0] ? (
                        <>
                          <SavingsBadge text="Rs. 20 Saved" type="saved" />
                          <Image src={selectedProducts[0].image_url || selectedProducts[0].product.images[0]} alt="p1" width={48} height={48} className="object-contain" />
                          <button onClick={(e) => { e.stopPropagation(); removeProduct(0); }} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200 shadow-sm text-red-500 hover:bg-red-50 transition-transform hover:scale-110">
                            <CloseIcon className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-6 h-6 text-[#318126] animate-pulse" />
                          <SavingsBadge text="Save Rs. 20" type="available" />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 h-[2px] w-[16px] bg-[#E8E8E8]" />

                  {/* Slot 2 */}
                  <div
                    onClick={!selectedProducts[1] ? () => { setPendingBulkQty(null); setIsModalOpen(true); } : undefined}
                    className={`w-[60px] h-[60px] rounded-[12px] relative shrink-0 transition-colors ${!selectedProducts[1] ? 'cursor-pointer hover:bg-[#f0fff4]' : 'bg-white border border-zinc-200'}`}
                  >
                    {!selectedProducts[1] && (
                      <div 
                        className="absolute inset-0 rounded-[12px] pointer-events-none animate-pulse" 
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23318126' stroke-width='2' stroke-dasharray='6%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")` }} 
                      />
                    )}
                    <div className="w-full h-full p-1 flex items-center justify-center relative z-10">
                      {selectedProducts[1] ? (
                        <>
                          <SavingsBadge text="Rs. 60 Saved" type="saved" />
                          <Image src={selectedProducts[1].image_url || selectedProducts[1].product.images[0]} alt="p2" width={48} height={48} className="object-contain" />
                          <button onClick={(e) => { e.stopPropagation(); removeProduct(1); }} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-zinc-200 shadow-sm text-red-500 hover:bg-red-50 transition-transform hover:scale-110">
                            <CloseIcon className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-6 h-6 text-[#318126] animate-pulse" />
                          <SavingsBadge text="Save Rs. 40" type="available" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddBundleToCart('interactive')}
                  disabled={loadingBundle !== null}
                  className={`w-full h-[52px] rounded-[14px] border border-[#E8E8E8] flex items-center justify-center gap-2 group transition-all active:scale-[0.98] mt-2 overflow-hidden relative ${loadingBundle === 'interactive' ? 'bg-[#f0fff4] border-[#318126]' : 'bg-gradient-to-r from-white via-white to-[#f0fff4]/50 hover:border-[#318126]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shine-once" />
                  <CartIcon className={`w-5 h-5 transition-colors ${loadingBundle === 'interactive' ? 'text-[#318126]' : 'text-[#4d4d4d]'}`} />
                  <span className={`text-[15px] font-bold transition-colors ${loadingBundle === 'interactive' ? 'text-[#318126]' : 'text-[#4d4d4d]'}`}>
                    {loadingBundle === 'interactive' ? 'Bundle Added!' : 'Add Bundle to Cart'}
                  </span>
                </button>
              </div>

              {/* Quantity Presets Section */}
              <div className="bg-white rounded-[12px] p-[16px] flex flex-col gap-3 border border-[#F0F0F0]">
                <div className="flex flex-col gap-3">
                  {/* Buy 2 Pack */}
                  <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#F4F4F5] bg-[#FCFCFD] group hover:border-[#318126]/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex items-center justify-center bg-white rounded-lg border border-zinc-100 p-0.5 shrink-0">
                        {currentProductImage && <Image src={currentProductImage} alt="q2" width={32} height={32} className="object-contain" />}
                        <div className="absolute -top-1.5 -right-1.5 bg-[#242424] text-white text-[9px] font-semibold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">2</div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-bold text-[#242424]">Buy 2 Pack</span>
                        <span className="text-[11px] text-[#318126] font-bold text-nowrap">Save Rs. 50</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[14px] font-semibold text-[#242424]">Rs. {buy2PriceMin}</div>
                        <div className="text-[10px] text-[#a1a1aa] line-through leading-none">Rs. {(storeMrp || baseMrp) * 2}</div>
                      </div>
                      <button
                        onClick={() => handleAddBundleToCart('buy2')}
                        disabled={loadingBundle !== null}
                        className={`h-9 px-4 rounded-lg font-bold text-[12px] transition-all active:scale-95 ${loadingBundle === 'buy2' ? 'bg-[#318126] text-white' : 'bg-[#242424] text-white hover:bg-[#318126]'}`}
                      >
                        {loadingBundle === 'buy2' ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>

                  {/* Buy 3 Pack */}
                  <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#F4F4F5] bg-[#FCFCFD] group hover:border-[#318126]/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex items-center justify-center bg-white rounded-lg border border-zinc-100 p-0.5 shrink-0">
                        {currentProductImage && <Image src={currentProductImage} alt="q3" width={32} height={32} className="object-contain" />}
                        <div className="absolute -top-1.5 -right-1.5 bg-[#242424] text-white text-[9px] font-semibold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">3</div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-bold text-[#242424]">Buy 3 Pack</span>
                        <span className="text-[11px] text-[#318126] font-bold text-nowrap">Save Rs. 100</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[14px] font-semibold text-[#242424]">Rs. {buy3PriceMin}</div>
                        <div className="text-[10px] text-[#a1a1aa] line-through leading-none">Rs. {(storeMrp || baseMrp) * 3}</div>
                      </div>
                      <button
                        onClick={() => handleAddBundleToCart('buy3')}
                        disabled={loadingBundle !== null}
                        className={`h-9 px-4 rounded-lg font-bold text-[12px] transition-all active:scale-95 ${loadingBundle === 'buy3' ? 'bg-[#318126] text-white' : 'bg-[#242424] text-white hover:bg-[#318126]'}`}
                      >
                        {loadingBundle === 'buy3' ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ProductSelectionModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setPendingBulkQty(null);
              }}
              onSelect={handleSelectProduct}
              onSelectBulk={handleSelectBulk}
              bulkCount={pendingBulkQty === 'buy2' ? 2 : pendingBulkQty === 'buy3' ? 3 : 0}
              mainProduct={mainProduct}
              initialSearch={pendingBulkQty ? '' : ''}
            />
          </div>
        )}
      </>
    </div>
  );
};

export default BundleDealCard;
