"use client";

import React, { useState, useEffect } from 'react';
import { SeoProduct } from '@/lib/seo/seoTypes';
import { fetchSeoOverrideForProductAction, upsertSeoProductAction } from '@/app/actions/seoActions';
import { fetchProductsPaginated, Product } from '@/services/productService';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function ProductsSeoTab() {
  const { showAdminToast } = useAdminToast();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Editor State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<SeoProduct>>({});
  const [isOverrideLoading, setIsOverrideLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debounced Search Loader
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { products: fetched } = await fetchProductsPaginated(1, 10, { search: searchQuery });
        setProducts(fetched);
      } catch (err) {
        console.error("Failed to search products", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Load Override When Product Selected
  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setIsOverrideLoading(true);
    try {
       const res = await fetchSeoOverrideForProductAction(product.id);
       if (res.success && res.data) {
           setFormData(res.data);
       } else {
           setFormData({ product_id: product.id, custom_title: '', custom_description: '', custom_slug: '' });
       }
    } catch (err) {
       showAdminToast("Failed to fetch product SEO data.", "error");
    } finally {
       setIsOverrideLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const payload = { ...formData, product_id: selectedProduct.id };
      const res = await upsertSeoProductAction(payload);
      if (res.success) {
        showAdminToast("Product SEO overridden successfully!", "success");
      } else {
        showAdminToast(`Failed: ${res.error}`, "error");
      }
    } catch (err) {
      showAdminToast("Unexpected error.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-220px)]">
      {/* Search Sidebar List */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-4 overflow-hidden h-full">
        <div className="shrink-0">
          <h2 className="text-[16px] font-medium text-[#242424]">Search Products</h2>
          <p className="text-[12px] text-[#52525b] mt-1 mb-3">Lookup the product to override its metadata.</p>
          <input 
            type="text" 
            placeholder="Search by name, brand..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-4 py-2.5 outline-none focus:border-black"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
            {isSearching ? (
               <div className="text-[13px] text-[#71717a] py-4 text-center">Searching...</div>
            ) : products.length > 0 ? (
               <div className="flex flex-col gap-2">
                 {products.map((p) => {
                   const isSelected = selectedProduct?.id === p.id;
                   return (
                     <button
                       key={p.id}
                       onClick={() => handleSelectProduct(p)}
                       className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left transition-colors border ${isSelected ? 'border-black bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                     >
                        <div className="w-10 h-10 rounded-[6px] bg-gray-100 shrink-0 overflow-hidden border border-[#e5e5e5]">
                           <img src={p.images?.[0] || '/placeholder.png'} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-[13px] font-medium text-[#242424] truncate">{p.title}</span>
                          <span className="text-[11px] text-[#71717a]">{p.brands?.name || 'SNP'}</span>
                        </div>
                     </button>
                   )
                 })}
               </div>
            ) : (
               <div className="text-[13px] text-[#71717a] py-4 text-center">No products found.</div>
            )}
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="w-full md:w-2/3 bg-white p-6 flex flex-col rounded-[12px] border border-[#e5e5e5] shadow-sm overflow-hidden h-full">
        {!selectedProduct ? (
           <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 text-[#71717a]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/></svg>
              <span className="text-[14px]">Search and select a product to edit its SEO metadata.</span>
           </div>
        ) : isOverrideLoading ? (
            <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-[13px] text-[#71717a]">Loading Product SEO Profile...</span>
            </div>
        ) : (
           <div className="flex flex-col h-full">
             <div className="flex justify-between items-center border-b pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[6px] bg-gray-100 overflow-hidden border border-[#e5e5e5]">
                         <img src={selectedProduct.images?.[0] || '/placeholder.png'} alt={selectedProduct.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-medium text-[#242424] line-clamp-1">{selectedProduct.title}</h3>
                        <p className="text-[12px] text-gray-500">SEO Overrides</p>
                    </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`bg-[#242424] text-white px-4 py-2 rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors shrink-0 ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save Overrides'}
                </button>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20">
                 <div className="flex flex-col gap-5 max-w-[800px]">
                   
                   {/* Auto-Fallback info box */}
                   <div className="bg-blue-50/50 text-blue-800 p-4 rounded-[8px] text-[12px] border border-blue-100">
                     <strong>Auto-Generation Active:</strong> If these fields are left blank, the frontend dynamically generates the title and description combining the actual product data and <span className="font-mono">Global Settings</span>.
                   </div>

                   <div className="flex flex-col gap-1.5">
                     <label className="text-[12px] font-medium text-[#242424]">Custom Meta Title Override</label>
                     <input type="text" name="custom_title" value={formData.custom_title || ''} onChange={handleChange} placeholder={`Leave empty for default: ${selectedProduct.title} - SNP Store`} className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
                   </div>

                   <div className="flex flex-col gap-1.5">
                     <label className="text-[12px] font-medium text-[#242424]">Custom Meta Description Override</label>
                     <textarea name="custom_description" value={formData.custom_description || ''} onChange={handleChange} rows={5} placeholder="Overrides the auto-generated description constructed from product benefits..." className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black resize-none" />
                   </div>

                   <div className="flex flex-col gap-1.5">
                     <label className="text-[12px] font-medium text-[#242424]">Custom Product Slug Override</label>
                     <input type="text" name="custom_slug" value={formData.custom_slug || ''} onChange={handleChange} placeholder="e.g. premium-whey-protein-5lbs" className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
                   </div>
                 </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
