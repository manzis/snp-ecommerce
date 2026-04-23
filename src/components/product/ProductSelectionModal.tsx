'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null);
  
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

  // Reset and Auto-select when expanding/changing product
  useEffect(() => {
    if (expandedId) {
        const product = products.find(p => p.id === expandedId);
        if (product) {
            // Auto-select first available flavor
            const firstFlavor = product.product_flavours?.find(f => f.is_available);
            setSelectedFlavorId(firstFlavor?.id || null);

            // Auto-select first available size
            const firstSize = product.product_sizes?.find(s => s.is_available);
            setSelectedSize(firstSize?.size_label || null);
        }
    } else {
        setSelectedSize(null);
        setSelectedFlavorId(null);
    }
  }, [expandedId, products]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-end lg:items-center justify-center p-0 lg:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-[500px] bg-white rounded-t-[24px] lg:rounded-[24px] h-[85vh] lg:h-[700px] flex flex-col overflow-hidden font-titillium"
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
                    
                    // Pricing Logic
                    let currentPrice = parseInt((product.discounted_price || '0').replace(/\D/g, ''), 10);
                    let originalPrice = parseInt((product.original_price || '0').replace(/\D/g, ''), 10);
                    
                    const matchingVariant = product.product_variants?.find(v => {
                        const vSizeLabel = product.product_sizes?.find(s => s.id === v.size_id)?.size_label;
                        const matchSize = !selectedSize || vSizeLabel === selectedSize;
                        const matchFlavor = !selectedFlavorId || v.flavour_id === selectedFlavorId;
                        return matchSize && matchFlavor;
                    });

                    if (matchingVariant) {
                        currentPrice = matchingVariant.discounted_price;
                        originalPrice = matchingVariant.original_price;
                    }

                    return (
                      <div 
                        key={product.id}
                        className={`flex flex-col rounded-[16px] border transition-all overflow-hidden ${isExpanded ? 'border-[#318126] bg-[#fdfdfd]' : 'border-[#F0F0F0] hover:border-[#318126] bg-white'}`}
                      >
                        <div 
                           className="flex items-center gap-4 p-3 cursor-pointer"
                           onClick={() => bulkCount === 0 && setExpandedId(isExpanded ? null : product.id)}
                        >
                            <div className="w-[56px] h-[56px] rounded-[12px] bg-[#FAFAFA] flex items-center justify-center p-1 border border-zinc-100 relative shrink-0">
                                {product.images?.[0] && (
                                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[15px] font-bold text-[#242424] truncate">{product.title || product.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] text-[#318126] font-bold">Rs. {currentPrice.toLocaleString()}</span>
                                    {originalPrice > currentPrice && (
                                        <span className="text-[12px] text-[#a1a1aa] line-through">Rs. {originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                            {bulkCount === 0 && (
                                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#71717A" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            )}
                        </div>

                        {isExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="px-4 pb-4 pt-2 border-t border-gray-50 flex flex-col gap-4"
                            >
                                <ProductVariantPicker 
                                    sizes={product.product_sizes || []}
                                    flavours={product.product_flavours || []}
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
                                        onClick={() => {
                                            const flavorObj = product.product_flavours?.find(f => f.id === selectedFlavorId);
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
                                                    setBulkSelections(newSelections);
                                                    // Reset picker for next item
                                                    const firstFlavor = product.product_flavours?.find(f => f.is_available);
                                                    setSelectedFlavorId(firstFlavor?.id || null);
                                                    const firstSize = product.product_sizes?.find(s => s.is_available);
                                                    setSelectedSize(firstSize?.size_label || null);
                                                }
                                            } else {
                                                onSelect(product, variantInfo);
                                                onClose();
                                            }
                                        }}
                                        disabled={(product.product_sizes?.length || 0) > 0 && !selectedSize || (product.product_flavours?.length || 0) > 0 && !selectedFlavorId}
                                        className="w-full h-[44px] rounded-[10px] bg-[#318126] text-white font-bold text-[15px] hover:bg-[#2a6e20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {bulkCount > 0 
                                            ? (bulkSelections.length + 1 === bulkCount ? 'Confirm & Add Pack' : `Confirm Item ${bulkSelections.length + 1} Selection`)
                                            : 'Select Choices'
                                        }
                                    </button>
                                </div>
                            </motion.div>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
