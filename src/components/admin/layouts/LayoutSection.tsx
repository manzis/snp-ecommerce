'use client';

import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { Product, fetchProducts } from '@/services/productService';
import AdminProductCard from './AdminProductCard';
import SectionSearch from './SectionSearch';

interface LayoutSectionProps {
  title: string;
  sectionKey: string;
  initialProducts: Product[];
  onSave: (sectionKey: string, productIds: string[]) => Promise<void>;
  maxProducts?: number;
}

const LayoutSection: React.FC<LayoutSectionProps> = ({
  title,
  sectionKey,
  initialProducts,
  onSave,
  maxProducts
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with initialProducts when they change (e.g. after a global save)
  useEffect(() => {
    setSelectedProducts(initialProducts);
  }, [initialProducts]);

  const toggleProduct = (product: Product) => {
    setSelectedProducts(prev => {
      const isAlreadySelected = prev.some(p => p.id === product.id);
      if (isAlreadySelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (maxProducts && prev.length >= maxProducts) {
          alert(`Maximum ${maxProducts} products allowed for this section.`);
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(sectionKey, selectedProducts.map(p => p.id));
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-[20px] bg-white">
      <div className="flex items-center justify-between">
        <h3 className="font-rubik text-[18px] font-regular text-[#242424] tracking-tight">{title}</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-[16px] py-[8px] bg-[#242424] text-white rounded-[8px] text-[14px] font-medium hover:bg-black transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Section'}
        </button>
      </div>

      {/* SEARCH COMPONENT */}
      <SectionSearch onSelectProduct={toggleProduct} />

      {/* SELECTED PRODUCTS GRID */}
      <div className="flex flex-col gap-[12px]">
        <span className="text-[12px] font-medium text-[#71717a] uppercase tracking-wider">
          {selectedProducts.length} Selected Products {maxProducts ? `(Max ${maxProducts})` : ''}
        </span>

        {selectedProducts.length === 0 ? (
          <div className="py-[40px] flex flex-center border-2 border-dashed border-[#f1f5f9] rounded-[12px]">
            <span className="text-[#bebebe] text-[14px] text-center w-full block">No products selected. Search above to add products.</span>
          </div>
        ) : (
          <Reorder.Group 
            axis="x" 
            values={selectedProducts} 
            onReorder={setSelectedProducts} 
            className="flex overflow-x-auto gap-4 p-2 pb-4 subtle-scrollbar bg-gray-50/50 rounded-xl border border-gray-100"
          >
            {selectedProducts.map(product => (
              <Reorder.Item 
                key={product.id} 
                value={product}
                className="shrink-0 cursor-grab active:cursor-grabbing w-[160px] md:w-[200px]"
              >
                <div className="pointer-events-auto">
                  <AdminProductCard
                    product={product}
                    isSelected={true}
                    onToggle={() => toggleProduct(product)}
                  />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
};

export default LayoutSection;
