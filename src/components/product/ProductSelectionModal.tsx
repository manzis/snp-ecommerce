'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import CloseIcon from '@/components/icons/CloseIcon';
import SearchIcon from '@/components/icons/SearchIcon';
import { fetchProducts, Product } from '@/services/productService';
import ProductVariantPicker from './ProductVariantPicker';

interface VariantInfo {
  size: string | null;
  flavor: string | null;
  image_url: string | null;
  price: number;
  mrp: number;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product, variantInfo: VariantInfo) => void;
  onSelectBulk?: (product: Product, selections: VariantInfo[]) => void;
  initialSearch?: string;
  bulkCount?: number;
  mainProduct?: Product;
}

const isProductOutOfStock = (p: Product) => {
  if (!p.stock_status) return false;
  const status = p.stock_status.toLowerCase().replace(/[^a-z]/g, '');
  return status === 'outofstock' || status === 'soldout' || status === 'out';
};

interface ProductVariantSelectorProps {
  product: Product;
  bulkCount: number;
  bulkSelections: VariantInfo[];
  onSelect: (product: Product, variantInfo: VariantInfo) => void;
  onSelectBulk?: (product: Product, selections: VariantInfo[]) => void;
  onProgressBulk: (newSelections: VariantInfo[]) => void;
  onClose: () => void;
}

function ProductVariantSelector({
  product,
  bulkCount,
  bulkSelections,
  onSelect,
  onSelectBulk,
  onProgressBulk,
  onClose
}: ProductVariantSelectorProps) {
  const sizes = product.product_sizes || [];
  const flavours = product.product_flavours || [];
  const variants = product.product_variants || [];

  // Calculate available sizes based strictly on is_available flags
  const mappedSizes = useMemo(() => {
    if (variants.length === 0) {
      return sizes.map(s => ({
        ...s,
        is_available: s.is_available !== false
      }));
    }

    return sizes.map(s => {
      const variantsForSize = variants.filter(v => v.size_id === s.id);
      if (variantsForSize.length === 0) return { ...s, is_available: false };

      const isAvailable = variantsForSize.some(v => v.is_available !== false);
      return {
        ...s,
        is_available: isAvailable && s.is_available !== false
      };
    });
  }, [sizes, variants]);

  // Initial size selection
  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    const firstAvail = mappedSizes.find(s => s.is_available);
    return firstAvail?.size_label || (sizes[0]?.size_label ?? null);
  });

  // Calculate available flavours filtered by selected size
  const filteredFlavours = useMemo(() => {
    if (variants.length === 0) {
      return flavours.map(f => ({
        ...f,
        is_available: f.is_available !== false
      }));
    }

    if (!selectedSize) {
      return flavours.map(f => {
        const variantsForFlavour = variants.filter(v => v.flavour_id === f.id);
        const isAvailable = variantsForFlavour.some(v => v.is_available !== false);
        return {
          ...f,
          is_available: isAvailable && f.is_available !== false
        };
      });
    }

    const selectedSizeObj = sizes.find(s => s.size_label === selectedSize);
    if (!selectedSizeObj) return flavours;

    // Filter flavours to ONLY those that have a variant entry for this size
    const validVariantsForSize = variants.filter(v => v.size_id === selectedSizeObj.id);
    const validFlavourIds = validVariantsForSize.map(v => v.flavour_id);

    return flavours
      .filter(f => validFlavourIds.includes(f.id))
      .map(f => {
        const variant = validVariantsForSize.find(v => v.flavour_id === f.id);
        const isAvailable = variant ? (variant.is_available !== false) : false;
        return {
          ...f,
          is_available: isAvailable && f.is_available !== false,
          image_url: (variant as any)?.image_url || f.image_url
        };
      });
  }, [flavours, sizes, variants, selectedSize]);

  // Initial flavor selection
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(() => {
    const firstAvailFlav = filteredFlavours.find(f => f.is_available);
    return firstAvailFlav?.id || (flavours[0]?.id ?? null);
  });

  // Keep flavor selection valid when size changes
  useEffect(() => {
    if (selectedFlavorId && filteredFlavours.length > 0) {
      const isStillValid = filteredFlavours.some(f => f.id === selectedFlavorId && f.is_available);
      if (!isStillValid) {
        const firstAvail = filteredFlavours.find(f => f.is_available);
        setSelectedFlavorId(firstAvail?.id || null);
      }
    } else if (filteredFlavours.length === 0 && selectedFlavorId !== null) {
      setSelectedFlavorId(null);
    }
  }, [filteredFlavours, selectedFlavorId]);

  // Matching variant logic
  const selectedSizeObj = sizes.find(s => s.size_label === selectedSize);
  const matchingVariant = variants.find(v => {
    const matchSize = !selectedSize || v.size_id === selectedSizeObj?.id;
    const matchFlavor = !selectedFlavorId || v.flavour_id === selectedFlavorId;
    return matchSize && matchFlavor;
  });

  let currentPrice = parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10);
  let originalPrice = parseInt((product.original_price || '0').replace(/\D/g, ''), 10);

  if (matchingVariant) {
    currentPrice = matchingVariant.discounted_price;
    originalPrice = matchingVariant.original_price;
  }

  const isSelectionValid = useMemo(() => {
    if (sizes.length > 0) {
      if (!selectedSize) return false;
      const sizeObj = mappedSizes.find(s => s.size_label === selectedSize);
      if (!sizeObj || !sizeObj.is_available) return false;
    }

    if (flavours.length > 0) {
      if (!selectedFlavorId) return false;
      const flavourObj = filteredFlavours.find(f => f.id === selectedFlavorId);
      if (!flavourObj || !flavourObj.is_available) return false;
    }

    if (variants.length > 0) {
      if (!matchingVariant) return false;
      if (matchingVariant.is_available === false) return false;
    }

    return true;
  }, [sizes, flavours, variants, selectedSize, selectedFlavorId, mappedSizes, filteredFlavours, matchingVariant]);

  const handleConfirm = () => {
    if (!isSelectionValid) return;

    const flavorObj = flavours.find(f => f.id === selectedFlavorId);
    const flavorName = flavorObj?.flavour_name || null;
    const variantInfo = {
      size: selectedSize,
      flavor: flavorName,
      image_url: flavorObj?.image_url || null,
      price: currentPrice,
      mrp: originalPrice
    };

    if (bulkCount > 0) {
      const newSelections = [...bulkSelections, variantInfo];
      if (newSelections.length === bulkCount) {
        onSelectBulk?.(product, newSelections);
        onClose();
      } else {
        onProgressBulk(newSelections);
      }
    } else {
      onSelect(product, variantInfo);
      onClose();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex flex-col gap-4 animate-page-enter">
      <ProductVariantPicker 
        sizes={mappedSizes}
        flavours={filteredFlavours}
        selectedSize={selectedSize}
        selectedFlavorId={selectedFlavorId}
        onSizeSelect={setSelectedSize}
        onFlavorSelect={setSelectedFlavorId}
      />

      <div className="flex flex-col gap-3">
        {bulkCount > 0 && bulkSelections.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {bulkSelections.map((sel, idx) => (
              <div key={idx} className="bg-[#f0fff4] text-[#318126] text-[11px] font-bold px-2 py-1 rounded-md border border-[#318126]/10 flex items-center gap-1">
                <span>Item {idx + 1}: {sel.flavor || 'Reg'}, {sel.size || 'One Size'}</span>
              </div>
            ))}
          </div>
        )}
        <button 
          onClick={handleConfirm}
          disabled={!isSelectionValid}
          className="w-full h-[44px] rounded-[10px] bg-[#318126] text-white font-bold text-[15px] hover:bg-[#2a6e20] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {!isSelectionValid
            ? 'Selection Unavailable'
            : bulkCount > 0 
              ? (bulkSelections.length + 1 === bulkCount ? 'Confirm & Add Pack' : `Confirm Item ${bulkSelections.length + 1} Selection`)
              : 'Select Choices'
          }
        </button>
      </div>
    </div>
  );
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onSelect,
  onSelectBulk,
  initialSearch = '',
  bulkCount = 0,
  mainProduct
}: ProductSelectionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Selection State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Bulk state
  const [bulkSelections, setBulkSelections] = useState<VariantInfo[]>([]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearch(initialSearch);
      setBulkSelections([]);
      
      if (bulkCount > 0 && mainProduct) {
        setProducts([mainProduct]);
        setExpandedId(mainProduct.id);
      } else {
        loadProducts(initialSearch);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialSearch, bulkCount, mainProduct]);

  const loadProducts = async (query: string) => {
    if (bulkCount > 0) return; // Don't load if in bulk mode
    setIsLoading(true);
    try {
      const data = await fetchProducts({ search: query });
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen && bulkCount === 0) loadProducts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen, bulkCount]);

  if (!mounted) return null;

  const content = (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-end lg:items-center justify-center p-0 lg:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-page-enter"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div
            className="relative w-full max-w-[500px] bg-white rounded-t-[24px] lg:rounded-[24px] h-[85vh] lg:h-[700px] flex flex-col overflow-hidden font-rajdhani animate-slide-up"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-[#242424]">
                  {bulkCount > 0 ? `Choose Items for Pack of ${bulkCount}` : 'Select Product Choice'}
                </h3>
                {bulkCount > 0 && (
                  <span className="text-[12px] text-[#318126] font-bold uppercase">
                    Item {bulkSelections.length + 1} of {bulkCount}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#71717a]"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar - Hidden in Bulk Mode */}
            {bulkCount === 0 && (
              <div className="px-6 py-4 bg-white border-b border-gray-50">
                <div className="relative flex items-center h-[48px] bg-[#f4f4f5] rounded-[12px] px-3 border border-transparent focus-within:border-[#318126] transition-all">
                  <SearchIcon className="w-5 h-5 text-[#71717a] mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-[16px] text-[#242424] outline-none placeholder:text-[#a1a1aa]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="p-1 rounded-full text-[#71717a] hover:text-[#242424] hover:bg-gray-200/50 transition-colors ml-1"
                      title="Clear search"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Product List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-[72px] bg-gray-50 animate-pulse rounded-[12px]" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="flex flex-col gap-3 pb-20">
                  {products.map(product => {
                    const isExpanded = expandedId === product.id;
                    const isOutOfStock = isProductOutOfStock(product);

                    let currentPrice = parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10);
                    let originalPrice = parseInt((product.original_price || '0').replace(/\D/g, ''), 10);

                    return (
                      <div 
                        key={product.id}
                        className={`flex flex-col rounded-[16px] border transition-all overflow-hidden ${
                          isOutOfStock 
                            ? 'opacity-65 bg-gray-50 border-[#F0F0F0]' 
                            : isExpanded 
                              ? 'border-[#318126] bg-[#fdfdfd]' 
                              : 'border-[#F0F0F0] hover:border-[#318126] bg-white'
                        }`}
                      >
                        <div 
                          className={`flex items-center gap-4 p-3 ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => !isOutOfStock && bulkCount === 0 && setExpandedId(isExpanded ? null : product.id)}
                        >
                          <div className="w-[56px] h-[56px] rounded-[12px] bg-[#FAFAFA] flex items-center justify-center p-1 border border-zinc-100 relative shrink-0">
                            {product.images?.[0] && (
                              <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-bold text-[#242424] truncate">{product.title || product.name}</span>
                              {isOutOfStock && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase shrink-0">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[14px] text-[#318126] font-bold">Rs. {currentPrice.toLocaleString()}</span>
                              {originalPrice > currentPrice && (
                                <span className="text-[12px] text-[#a1a1aa] line-through">Rs. {originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          {bulkCount === 0 && !isOutOfStock && (
                            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="#71717A" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {isExpanded && !isOutOfStock && (
                          <ProductVariantSelector 
                            product={product}
                            bulkCount={bulkCount}
                            bulkSelections={bulkSelections}
                            onSelect={onSelect}
                            onSelectBulk={onSelectBulk}
                            onProgressBulk={setBulkSelections}
                            onClose={onClose}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#71717a] py-12">
                  <p className="text-[16px]">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
}
