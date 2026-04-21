"use client";

import React, { useState, useEffect } from 'react';
import { SeoSitemap } from '@/lib/seo/seoTypes';
import { fetchSeoSitemapAction, upsertSeoSitemapAction, deleteSeoSitemapAction } from '@/app/actions/seoActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function SitemapTab() {
  const { showAdminToast } = useAdminToast();
  const [sitemapEntries, setSitemapEntries] = useState<SeoSitemap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [path, setPath] = useState('');
  const [priority, setPriority] = useState<number>(0.8);
  const [changeFreq, setChangeFreq] = useState('weekly');
  const [isAdding, setIsAdding] = useState(false);

  const loadSitemap = async () => {
    setIsLoading(true);
    const res = await fetchSeoSitemapAction();
    if (res.success) {
        setSitemapEntries(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadSitemap();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim() || !path.startsWith('/')) {
      showAdminToast("Path must begin with a forward slash (e.g. /about).", "error");
      return;
    }

    setIsAdding(true);
    const payload = {
        path,
        priority,
        change_freq: changeFreq,
        is_enabled: true
    };
    
    const res = await upsertSeoSitemapAction(payload);
    if (res.success) {
      showAdminToast("Sitemap entry created/updated.", "success");
      setPath('');
      setPriority(0.8);
      loadSitemap();
    } else {
      showAdminToast(`Failed: ${res.error}`, "error");
    }
    setIsAdding(false);
  };

  const handleToggle = async (entry: SeoSitemap) => {
    const payload = { ...entry, is_enabled: !entry.is_enabled };
    const res = await upsertSeoSitemapAction(payload);
    if (res.success) {
      setSitemapEntries(prev => prev.map(r => r.id === entry.id ? { ...r, is_enabled: !entry.is_enabled } : r));
      showAdminToast("Sitemap entry toggled.", "success");
    } else {
      showAdminToast(`Failed to toggle: ${res.error}`, "error");
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm(`Are you sure you want to delete ${path} from the explicit sitemap rules?`)) return;
    const res = await deleteSeoSitemapAction(id);
    if (res.success) {
      setSitemapEntries(prev => prev.filter(r => r.id !== id));
      showAdminToast("Entry deleted.", "success");
    } else {
      showAdminToast("Failed to delete.", "error");
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-220px)]">
      {/* Create Sitemap Rule */}
      <div className="w-full xl:w-1/3 bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-5 h-fit shrink-0">
        <div className="border-b pb-4">
          <h2 className="text-[16px] font-medium text-[#242424]">New Sitemap Rule</h2>
          <p className="text-[12px] text-[#52525b] mt-1">Forcefully include hidden paths or adjust crawl priority & frequency limits.</p>
        </div>
        
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">URL Path</label>
            <input 
               type="text" 
               value={path}
               onChange={(e) => setPath(e.target.value)}
               placeholder="e.g. /promotions/summer-sale" 
               className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black font-mono" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">Priority (0.0 to 1.0)</label>
            <input 
               type="number" 
               step="0.1"
               min="0"
               max="1"
               value={priority}
               onChange={(e) => setPriority(parseFloat(e.target.value))}
               className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">Change Frequency</label>
            <select 
               value={changeFreq}
               onChange={(e) => setChangeFreq(e.target.value)}
               className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black bg-white"
            >
               <option value="always">always</option>
               <option value="hourly">hourly</option>
               <option value="daily">daily</option>
               <option value="weekly">weekly</option>
               <option value="monthly">monthly</option>
               <option value="yearly">yearly</option>
               <option value="never">never</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className={`mt-2 bg-[#242424] text-white w-full py-2.5 rounded-[8px] text-[13px] font-medium hover:bg-black transition-colors ${isAdding ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {isAdding ? 'Saving Rule...' : 'Push to Sitemap'}
          </button>
        </form>
      </div>

      {/* Rules Table */}
      <div className="w-full xl:w-2/3 bg-white flex flex-col rounded-[12px] border border-[#e5e5e5] shadow-sm overflow-hidden h-full">
         <div className="p-6 border-b shrink-0 flex items-center justify-between">
             <div>
               <h3 className="text-[16px] font-medium text-[#242424]">XML Engine Mapping Overrides</h3>
               <p className="text-[12px] text-[#52525b] mt-1">Manual overrides mapped dynamically into `sitemap.xml`.</p>
             </div>
             <a href="/sitemap.xml" target="_blank" className="text-[13px] text-blue-600 hover:underline font-medium border px-3 py-1.5 rounded-[6px] border-[#e5e5e5] bg-gray-50 flex items-center gap-2">
                <span>View Raw XML</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
             </a>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar">
            {isLoading ? (
                <div className="flex justify-center items-center h-full text-[13px] text-[#71717a]">Loading sitemap rules...</div>
            ) : sitemapEntries.length === 0 ? (
                <div className="flex justify-center items-center h-full text-[13px] text-[#71717a]">No explicit sitemap rules configured. Dynamic routes are still auto-mapped.</div>
            ) : (
                <table className="w-full text-left text-[13px]">
                   <thead className="bg-[#fafa-fb] border-b text-[#71717a] font-medium text-[12px] sticky top-0">
                     <tr>
                       <th className="px-6 py-3">Path</th>
                       <th className="px-6 py-3">Priority</th>
                       <th className="px-6 py-3">Freq</th>
                       <th className="px-6 py-3">State</th>
                       <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#e5e5e5]">
                     {sitemapEntries.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-3 font-mono text-[#242424] max-w-[200px] truncate" title={r.path}>{r.path}</td>
                           <td className="px-6 py-3">
                              <span className="px-2 py-0.5 rounded-[4px] bg-gray-100 font-medium">{r.priority.toFixed(1)}</span>
                           </td>
                           <td className="px-6 py-3 text-[#52525b]">{r.change_freq}</td>
                           <td className="px-6 py-3">
                             <button onClick={() => handleToggle(r)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${r.is_enabled ? 'bg-black' : 'bg-gray-200'}`}>
                               <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${r.is_enabled ? 'translate-x-2' : '-translate-x-2'}`} />
                             </button>
                           </td>
                           <td className="px-6 py-3 text-right">
                             <button onClick={() => handleDelete(r.id, r.path)} className="text-red-500 hover:text-red-700 font-medium">Clear</button>
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
