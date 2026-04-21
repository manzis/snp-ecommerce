"use client";

import React, { useState, useEffect } from 'react';
import { SeoRedirect } from '@/lib/seo/seoTypes';
import { fetchSeoRedirectsAction, createSeoRedirectAction, toggleSeoRedirectAction, deleteSeoRedirectAction } from '@/app/actions/seoActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function RedirectsTab() {
  const { showAdminToast } = useAdminToast();
  const [redirects, setRedirects] = useState<SeoRedirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [fromUrl, setFromUrl] = useState('');
  const [toUrl, setToUrl] = useState('');
  const [type, setType] = useState<301 | 302>(301);
  const [isAdding, setIsAdding] = useState(false);

  const loadRedirects = async () => {
    setIsLoading(true);
    const res = await fetchSeoRedirectsAction();
    if (res.success) setRedirects(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRedirects();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUrl.trim() || !toUrl.trim()) {
      showAdminToast("Please provide both Source and Destination URLs.", "error");
      return;
    }
    // Simple validation (must start with / or http)
    if (!fromUrl.startsWith('/') && !fromUrl.startsWith('http')) {
      showAdminToast("Source URL must start with '/' or 'http'.", "error");
      return;
    }

    setIsAdding(true);
    const res = await createSeoRedirectAction({ from_url: fromUrl, to_url: toUrl, type });
    if (res.success) {
      showAdminToast("Redirect rule created successfully.", "success");
      setFromUrl('');
      setToUrl('');
      setType(301);
      loadRedirects();
    } else {
      showAdminToast(`Failed to create redirect: ${res.error}`, "error");
    }
    setIsAdding(false);
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    const res = await toggleSeoRedirectAction(id, !currentState);
    if (res.success) {
      setRedirects(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentState } : r));
      showAdminToast(currentState ? "Redirect paused." : "Redirect revived.", "success");
    } else {
      showAdminToast("Failed to toggle redirect state.", "error");
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm(`Are you sure you want to permanently delete the redirect rule for ${path}?`)) return;
    const res = await deleteSeoRedirectAction(id);
    if (res.success) {
      setRedirects(prev => prev.filter(r => r.id !== id));
      showAdminToast("Redirect deleted permanently.", "success");
    } else {
      showAdminToast("Failed to delete redirect.", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-220px)]">
      {/* Create Redirect Module */}
      <div className="w-full xl:w-1/3 bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-5 h-fit shrink-0">
        <div className="border-b pb-4">
          <h2 className="text-[16px] font-medium text-[#242424]">New Redirect Rule</h2>
          <p className="text-[12px] text-[#52525b] mt-1">Steer traffic from obsolete links to prevent 404 dead ends.</p>
        </div>
        
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">Source URL Path (Old Link)</label>
            <input 
               type="text" 
               value={fromUrl}
               onChange={(e) => setFromUrl(e.target.value)}
               placeholder="e.g. /old-product-page" 
               className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black font-mono" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">Destination URL (New Link)</label>
            <input 
               type="text" 
               value={toUrl}
               onChange={(e) => setToUrl(e.target.value)}
               placeholder="e.g. /products" 
               className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black font-mono" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">Redirect HTTP Code</label>
            <select 
               value={type}
               onChange={(e) => setType(Number(e.target.value) as 301 | 302)}
               className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black bg-white"
            >
               <option value={301}>301 Moved Permanently (SEO Recommended)</option>
               <option value={302}>302 Found (Temporary Redirect)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className={`mt-2 bg-[#242424] text-white w-full py-2.5 rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors ${isAdding ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {isAdding ? 'Deploying Rule...' : 'Create Redirect'}
          </button>
        </form>
      </div>

      {/* Redirects Table Engine */}
      <div className="w-full xl:w-2/3 bg-white flex flex-col rounded-[12px] border border-[#e5e5e5] shadow-sm overflow-hidden h-full">
         <div className="p-6 border-b shrink-0">
             <h3 className="text-[16px] font-medium text-[#242424]">Active Redirect Map</h3>
             <p className="text-[12px] text-[#52525b] mt-1">Rules are evaluated sequentially at the Edge / Middleware level.</p>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar">
            {isLoading ? (
                <div className="flex justify-center items-center h-full text-[13px] text-[#71717a]">Loading table...</div>
            ) : redirects.length === 0 ? (
                <div className="flex justify-center items-center h-full text-[13px] text-[#71717a]">No active redirect rules found.</div>
            ) : (
                <table className="w-full text-left text-[13px]">
                   <thead className="bg-[#fafa-fb] border-b text-[#71717a] font-medium text-[12px] sticky top-0">
                     <tr>
                       <th className="px-6 py-3">Source Route</th>
                       <th className="px-6 py-3">Destination Route</th>
                       <th className="px-6 py-3">Type</th>
                       <th className="px-6 py-3">Created</th>
                       <th className="px-6 py-3">State</th>
                       <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#e5e5e5]">
                     {redirects.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-3 font-mono text-[#242424] max-w-[150px] truncate" title={r.from_url}>{r.from_url}</td>
                           <td className="px-6 py-3 font-mono text-[#242424] max-w-[150px] truncate" title={r.to_url}>
                              <div className="flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                <span className="truncate">{r.to_url}</span>
                              </div>
                           </td>
                           <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${r.type === 301 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                 {r.type}
                              </span>
                           </td>
                           <td className="px-6 py-3 text-[#71717a]">{formatDate(r.created_at)}</td>
                           <td className="px-6 py-3">
                             <button onClick={() => handleToggle(r.id, r.is_active)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${r.is_active ? 'bg-black' : 'bg-gray-200'}`}>
                               <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${r.is_active ? 'translate-x-2' : '-translate-x-2'}`} />
                             </button>
                           </td>
                           <td className="px-6 py-3 text-right">
                             <button onClick={() => handleDelete(r.id, r.from_url)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                           </td>
                        </tr>
                     ))}
                   </tbody>
                </table>
            )}
         </div>
      </div>
    </div>
  );
}
