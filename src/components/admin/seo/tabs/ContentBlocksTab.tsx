"use client";

import React, { useState, useEffect } from 'react';
import { SeoContentBlock } from '@/lib/seo/seoTypes';
import { 
  upsertSeoContentBlockAction, 
  fetchAllSeoContentBlocksAction, 
  deleteSeoContentBlockAction 
} from '@/app/actions/seoActions';
import { fetchCategories, fetchProductsPaginated, Category, Product } from '@/services/productService';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function ContentBlocksTab() {
  const { showAdminToast } = useAdminToast();
  
  // State
  const [blocks, setBlocks] = useState<SeoContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SeoContentBlock>>({
    entity_type: 'category',
    entity_id: '',
    content_html: '',
    faq_json: []
  });

  // Selection Lookups
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const loadInitialData = async () => {
    setIsLoading(true);
    const [blocksRes, cats] = await Promise.all([
      fetchAllSeoContentBlocksAction(),
      fetchCategories()
    ]);
    if (blocksRes.success) setBlocks(blocksRes.data);
    setCategories(cats);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Product Search Debounce
  useEffect(() => {
    if (formData.entity_type !== 'product') return;
    const timeout = setTimeout(async () => {
      const { products: found } = await fetchProductsPaginated(1, 10, { search: productSearch });
      setProducts(found);
    }, 400);
    return () => clearTimeout(timeout);
  }, [productSearch, formData.entity_type]);

  const handleEdit = (block: SeoContentBlock) => {
    setActiveId(block.id);
    setFormData(block);
    if (block.entity_type === 'product') {
       // Try to find product title if possible or just show ID
       setProductSearch(block.entity_id);
    }
  };

  const handleCreateNew = () => {
    setActiveId('new');
    setFormData({
      entity_type: 'category',
      entity_id: '',
      content_html: '',
      faq_json: []
    });
    setProductSearch('');
  };

  const handleSave = async () => {
    if (!formData.entity_id) {
      showAdminToast("Please select an entity (Product or Category).", "error");
      return;
    }
    setIsSaving(true);
    const res = await upsertSeoContentBlockAction(formData);
    if (res.success) {
      showAdminToast("SEO Content Block saved!", "success");
      loadInitialData();
      setActiveId(null);
    } else {
      showAdminToast(`Error: ${res.error}`, "error");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO block?")) return;
    const res = await deleteSeoContentBlockAction(id);
    if (res.success) {
      showAdminToast("Block deleted.", "success");
      loadInitialData();
      if (activeId === id) setActiveId(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-220px)]">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-4 overflow-hidden h-full">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-[16px] font-medium text-[#242424]">Content Strategy</h2>
            <p className="text-[12px] text-[#52525b] mt-1">Managed text blocks for templates.</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="text-[12px] font-medium bg-black text-white px-3 py-1.5 rounded-[6px]"
          >
            + New
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 pt-2">
          {isLoading ? (
            <div className="text-[13px] text-[#71717a] py-8 text-center">Loading context...</div>
          ) : blocks.length > 0 ? (
            blocks.map((b) => (
              <button
                key={b.id}
                onClick={() => handleEdit(b)}
                className={`flex flex-col items-start px-4 py-3 rounded-[8px] text-left transition-colors border ${activeId === b.id ? 'border-black bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2 w-full">
                   <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${b.entity_type === 'product' ? 'bg-blue-50 text-blue-700' : b.entity_type === 'category' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                      {b.entity_type}
                   </span>
                   <span className="text-[13px] font-medium text-[#242424] truncate flex-1">{b.entity_id}</span>
                </div>
                <span className="text-[11px] text-[#71717a] mt-1 line-clamp-1">{b.content_html?.replace(/<[^>]*>/g, '').substring(0, 50)}...</span>
              </button>
            ))
          ) : (
            <div className="text-[13px] text-[#71717a] py-8 text-center border border-dashed rounded-[8px]">
              No content blocks created yet.
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="w-full md:w-2/3 bg-white p-6 flex flex-col gap-5 rounded-[12px] border border-[#e5e5e5] shadow-sm overflow-hidden h-full">
        {!activeId ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 text-[#71717a]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span className="text-[14px]">Select a block to edit or create a new strategy block.</span>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
             <div className="flex justify-between items-center border-b pb-4 shrink-0">
                <h3 className="text-[16px] font-medium text-[#242424]">
                  {activeId === 'new' ? 'Create New Block' : `Edit Content: ${formData.entity_id}`}
                </h3>
                <div className="flex gap-2">
                  {activeId !== 'new' && (
                    <button 
                      onClick={() => handleDelete(formData.id!)}
                      className="text-red-500 hover:text-red-700 text-[13px] font-medium px-3"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`bg-[#242424] text-white px-4 py-2 rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
                  >
                    {isSaving ? 'Saving...' : 'Save Block'}
                  </button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20">
                <div className="flex flex-col gap-6 max-w-[800px]">
                   {/* Entity Selection */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-medium text-[#242424]">Target Entity Type</label>
                        <select 
                          value={formData.entity_type} 
                          onChange={(e) => setFormData(prev => ({ ...prev, entity_type: e.target.value as any, entity_id: '' }))}
                          className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black bg-white"
                        >
                           <option value="category">Category</option>
                           <option value="product">Product</option>
                           <option value="landing">Global Landing</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-medium text-[#242424]">Target Identifier</label>
                        {formData.entity_type === 'category' ? (
                          <select 
                            value={formData.entity_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, entity_id: e.target.value }))}
                            className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black bg-white"
                          >
                             <option value="">Select Category...</option>
                             {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                          </select>
                        ) : formData.entity_type === 'product' ? (
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="Search Product Slug/ID..."
                              value={productSearch}
                              onChange={(e) => {
                                setProductSearch(e.target.value);
                                setFormData(prev => ({ ...prev, entity_id: e.target.value }));
                              }}
                              className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black"
                            />
                            {products.length > 0 && productSearch && (
                               <div className="absolute z-10 top-full left-0 right-0 bg-white border border-[#e5e5e5] shadow-lg rounded-[6px] mt-1 max-h-[150px] overflow-y-auto">
                                  {products.map(p => (
                                    <button 
                                      key={p.id}
                                      onClick={() => {
                                        setFormData(prev => ({ ...prev, entity_id: p.slug }));
                                        setProductSearch(p.slug);
                                        setProducts([]);
                                      }}
                                       className="w-full text-left px-3 py-2 hover:bg-gray-100 text-[12px]"
                                    >
                                       {p.title} ({p.slug})
                                    </button>
                                  ))}
                               </div>
                            )}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="landing-page-id"
                            value={formData.entity_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, entity_id: e.target.value }))}
                            className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black"
                          />
                        )}
                      </div>
                   </div>

                   {/* Content Editor */}
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[12px] font-medium text-[#242424]">SEO Content HTML (Bottom of Template)</label>
                     <textarea 
                        rows={10}
                        value={formData.content_html || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, content_html: e.target.value }))}
                        placeholder="<h2 class='text-2xl'>Why Choose Our Products?</h2><p>Our supplements are authentic...</p>"
                        className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-4 py-3 outline-none focus:border-black font-mono leading-relaxed" 
                     />
                     <p className="text-[11px] text-[#71717a]">This HTML will be injected into the specific page template before the footer for SEO heavy text.</p>
                   </div>

                   {/* FAQ JSON */}
                   <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <label className="text-[12px] font-medium text-[#242424]">Targeted FAQ Schema (JSON)</label>
                        <button 
                          onClick={() => {
                            const current = Array.isArray(formData.faq_json) ? formData.faq_json : [];
                            setFormData(prev => ({ ...prev, faq_json: [...current, { question: '', answer: '' }] }));
                          }}
                          className="text-[11px] text-blue-600 font-medium hover:underline"
                        >
                          + Add QA Pair
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                         {Array.isArray(formData.faq_json) && formData.faq_json.map((qa, idx) => (
                            <div key={idx} className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-100 rounded-[6px] relative group">
                               <button 
                                onClick={() => {
                                  const filtered = (formData.faq_json as any[]).filter((_, i) => i !== idx);
                                  setFormData(prev => ({ ...prev, faq_json: filtered }));
                                }}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                               </button>
                               <input 
                                  value={qa.question}
                                  onChange={(e) => {
                                    const updated = [...(formData.faq_json as any[])];
                                    updated[idx].question = e.target.value;
                                    setFormData(prev => ({ ...prev, faq_json: updated }));
                                  }}
                                  placeholder="Question..."
                                  className="bg-transparent text-[13px] font-medium border-b border-gray-200 outline-none focus:border-black" 
                               />
                               <textarea 
                                  value={qa.answer}
                                  onChange={(e) => {
                                    const updated = [...(formData.faq_json as any[])];
                                    updated[idx].answer = e.target.value;
                                    setFormData(prev => ({ ...prev, faq_json: updated }));
                                  }}
                                  placeholder="Answer..."
                                  rows={2}
                                  className="bg-transparent text-[12px] outline-none focus:border-black resize-none" 
                               />
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
