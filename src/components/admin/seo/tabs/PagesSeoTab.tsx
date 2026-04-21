"use client";

import React, { useState, useEffect } from 'react';
import { SeoPage } from '@/lib/seo/seoTypes';
import { fetchAllSeoPagesAction, upsertSeoPageAction } from '@/app/actions/seoActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

const STATIC_PAGES = [
  { id: 'home', label: 'Home Page', path: '/' },
  { id: 'products', label: 'All Products', path: '/products' },
  { id: 'brands', label: 'Brands Directory', path: '/brands' }
];

export default function PagesSeoTab() {
  const { showAdminToast } = useAdminToast();
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SeoPage>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadPages = async () => {
    setIsLoading(true);
    const res = await fetchAllSeoPagesAction();
    if (res.success) setPages(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleSelect = (pageId: string) => {
    const existing = pages.find((p) => p.page_identifier === pageId);
    setSelectedPage(pageId);
    setFormData(existing || { page_identifier: pageId, title: '', description: '', keywords: '', canonical_url: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { ...formData, page_identifier: selectedPage };
      const res = await upsertSeoPageAction(payload);
      if (res.success) {
        showAdminToast("Page SEO settings saved!", "success");
        loadPages();
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
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-4 h-fit">
        <div>
          <h2 className="text-[16px] font-medium text-[#242424]">Static Pages</h2>
          <p className="text-[12px] text-[#52525b] mt-1">Select a core route to override.</p>
        </div>
        
        {isLoading ? (
          <div className="text-[13px] text-[#71717a] py-4">Loading...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {STATIC_PAGES.map((sp) => {
              const hasOverride = pages.some(p => p.page_identifier === sp.id && (p.title || p.description));
              const isSelected = selectedPage === sp.id;
              
              return (
                <button
                  key={sp.id}
                  onClick={() => handleSelect(sp.id)}
                  className={`flex flex-col items-start px-4 py-3 rounded-[8px] text-left transition-colors border ${isSelected ? 'border-black bg-gray-50' : 'border-[#e5e5e5] hover:border-gray-400'}`}
                >
                  <div className="flex items-center justify-between w-full">
                     <span className="text-[14px] font-medium text-[#242424]">{sp.label}</span>
                     {hasOverride && <span className="w-2 h-2 bg-green-500 rounded-full" title="Override Active" />}
                  </div>
                  <span className="text-[11px] text-[#71717a] font-mono mt-1">{sp.path}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="w-full md:w-2/3 bg-white p-6 flex flex-col gap-5 rounded-[12px] border border-[#e5e5e5] shadow-sm">
        {!selectedPage ? (
           <div className="flex flex-col items-center justify-center h-[300px] text-center gap-3 text-[#71717a]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <span className="text-[14px]">Select a page from the left to edit its SEO metadata.</span>
           </div>
        ) : (
           <>
             <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-[16px] font-medium text-[#242424]">Edit SEO: {STATIC_PAGES.find(p => p.id === selectedPage)?.label}</h3>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`bg-[#242424] text-white px-4 py-2 rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
             </div>

             <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                 <label className="text-[12px] font-medium text-[#242424]">Meta Title Override</label>
                 <input type="text" name="title" value={formData.title || ''} onChange={handleChange} placeholder="e.g. Premium Nutrition Store" className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
               </div>

               <div className="flex flex-col gap-1.5">
                 <label className="text-[12px] font-medium text-[#242424]">Meta Description</label>
                 <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} placeholder="Description tailored specifically for this page..." className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black resize-none" />
               </div>

               <div className="flex flex-col gap-1.5">
                 <label className="text-[12px] font-medium text-[#242424]">Keywords (Comma separated)</label>
                 <input type="text" name="keywords" value={formData.keywords || ''} onChange={handleChange} placeholder="protein, creatine, nepal supplements" className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
               </div>

               <div className="flex flex-col gap-1.5">
                 <label className="text-[12px] font-medium text-[#242424]">Custom Canonical URL</label>
                 <input type="url" name="canonical_url" value={formData.canonical_url || ''} onChange={handleChange} placeholder="https://example.com/canonical-path" className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
               </div>
             </div>
           </>
        )}
      </div>
    </div>
  );
}
