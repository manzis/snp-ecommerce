"use client";

import React, { useState } from 'react';
import { SeoGlobal } from '@/lib/seo/seoTypes';
import { updateSeoGlobalAction } from '@/app/actions/seoActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

interface GlobalSeoTabProps {
  initialData: SeoGlobal | null;
}

export default function GlobalSeoTab({ initialData }: GlobalSeoTabProps) {
  const { showAdminToast } = useAdminToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<SeoGlobal>>({
    title_template: initialData?.title_template || '%s | SNP Store',
    default_description: initialData?.default_description || '',
    default_robots: initialData?.default_robots || 'index, follow',
    default_hreflang: initialData?.default_hreflang || 'en-NP',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSeoGlobalAction(formData);
      if (res.success) {
        showAdminToast("Global SEO settings saved securely!", "success");
      } else {
        showAdminToast(`Failed to save: ${res.error}`, "error");
      }
    } catch (err) {
      showAdminToast("An unexpected error occurred.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm">
        <div>
          <h2 className="text-[16px] font-medium text-[#242424]">Global Settings</h2>
          <p className="text-[13px] text-[#52525b] mt-1">
            Configure the baseline defaults applied to metadata across your entire platform.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`bg-[#242424] hover:bg-black text-white px-5 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-5">
           <h3 className="text-[14px] font-medium text-[#242424] border-b pb-2">Primary Formats</h3>
           
           <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-medium text-[#242424]">Title Template</label>
             <input type="text" name="title_template" value={formData.title_template} onChange={handleChange} placeholder="%s | SNP Store" className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
             <p className="text-[11px] text-[#71717a]">%s is automatically replaced by the specific page or product name.</p>
           </div>

           <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-medium text-[#242424]">Default Description</label>
             <textarea name="default_description" value={formData.default_description} onChange={handleChange} rows={4} placeholder="The leading genuine supplement provider in Nepal." className="w-full resize-none text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-5">
           <h3 className="text-[14px] font-medium text-[#242424] border-b pb-2">Technical Defaults</h3>
           
           <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-medium text-[#242424]">Default Robots Directive</label>
             <select name="default_robots" value={formData.default_robots} onChange={handleChange} className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black bg-white">
                <option value="index, follow">index, follow (Recommended)</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
             </select>
             <p className="text-[11px] text-[#71717a]">Controls if Google indexes your store globally.</p>
           </div>

           <div className="flex flex-col gap-1.5">
             <label className="text-[12px] font-medium text-[#242424]">Default Canonical Hreflang</label>
             <input type="text" name="default_hreflang" value={formData.default_hreflang} onChange={handleChange} placeholder="en-NP" className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" />
           </div>
        </div>
      </div>
    </div>
  );
}
