"use client";

import React, { useState, useEffect } from 'react';
import {
  fetchSeoGlobalAction,
  fetchSeoPageByIdentifierAction,
  fetchSeoOverrideForProductAction,
} from '@/app/actions/seoActions';
import { fetchProductsPaginated } from '@/services/productService';

const PAGE_OPTIONS = [
  { label: 'Home (/)', identifier: 'home', urlPath: '' },
  { label: 'Products (/products)', identifier: 'products', urlPath: 'products' },
  { label: 'Brands (/brands)', identifier: 'brands', urlPath: 'brands' },
];

export default function SeoPreviewTab() {
  const [mode, setMode] = useState<'page' | 'product'>('page');
  const [selectedPage, setSelectedPage] = useState(PAGE_OPTIONS[0]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urlPath, setUrlPath] = useState('');
  const [showRichSnippet, setShowRichSnippet] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-truncate to mimic Google
  const truncatedTitle = title.length > 60 ? title.substring(0, 60) + '...' : title;
  const truncatedDescription = description.length > 155 ? description.substring(0, 155) + '...' : description;

  // Load real SEO data when page selection changes
  useEffect(() => {
    if (mode !== 'page') return;
    const load = async () => {
      setIsLoading(true);
      const [pageRes, globalRes] = await Promise.all([
        fetchSeoPageByIdentifierAction(selectedPage.identifier),
        fetchSeoGlobalAction(),
      ]);
      const page = pageRes.data;
      const global = globalRes.data;
      const resolvedTitle = page?.title || global?.default_title || 'Bright Supplements | Buy Authentic Supplements in Nepal';
      const resolvedDesc = page?.description || global?.default_description || '';
      setTitle(resolvedTitle);
      setDescription(resolvedDesc);
      setUrlPath(selectedPage.urlPath);
      setIsLoading(false);
    };
    load();
  }, [selectedPage, mode]);

  // Load product SEO when a product is selected
  useEffect(() => {
    if (!selectedProduct) return;
    const load = async () => {
      setIsLoading(true);
      const [overrideRes, globalRes] = await Promise.all([
        fetchSeoOverrideForProductAction(selectedProduct.id),
        fetchSeoGlobalAction(),
      ]);
      const override = overrideRes.data;
      const global = globalRes.data;
      setTitle(override?.custom_title || `Buy ${selectedProduct.title} in Nepal | ${selectedProduct.brands?.name || 'SNP Store'}`);
      setDescription(override?.custom_description || global?.default_description || '');
      setUrlPath(`product/${override?.custom_slug || selectedProduct.slug}`);
      setIsLoading(false);
    };
    load();
  }, [selectedProduct]);

  // Product search debounce
  useEffect(() => {
    if (mode !== 'product') return;
    const timeout = setTimeout(async () => {
      if (!productSearch.trim()) { setProductResults([]); return; }
      const { products } = await fetchProductsPaginated(1, 8, { search: productSearch });
      setProductResults(products);
    }, 400);
    return () => clearTimeout(timeout);
  }, [productSearch, mode]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-220px)]">
      {/* Control Panel */}
      <div className="w-full xl:w-1/3 bg-white p-6 rounded-[12px] border border-[#e5e5e5] shadow-sm flex flex-col gap-5 h-fit shrink-0">
        <div className="border-b pb-4">
          <h2 className="text-[16px] font-medium text-[#242424]">Live SERP Simulator</h2>
          <p className="text-[12px] text-[#52525b] mt-1">Preview real saved metadata before it goes live on Google.</p>
        </div>

        {/* Mode Switch */}
        <div className="flex gap-2">
          {(['page', 'product'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-[6px] text-[13px] font-medium border transition-colors ${mode === m ? 'bg-[#242424] text-white border-[#242424]' : 'border-[#e5e5e5] text-[#52525b] hover:border-black'}`}
            >
              {m === 'page' ? 'Static Page' : 'Product'}
            </button>
          ))}
        </div>

        {/* Page Selector */}
        {mode === 'page' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">Select Page</label>
            <select
              value={selectedPage.identifier}
              onChange={(e) => setSelectedPage(PAGE_OPTIONS.find(p => p.identifier === e.target.value)!)}
              className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black bg-white"
            >
              {PAGE_OPTIONS.map(p => <option key={p.identifier} value={p.identifier}>{p.label}</option>)}
            </select>
          </div>
        )}

        {/* Product Search */}
        {mode === 'product' && (
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[#242424]">Search Product</label>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search by product name..."
              className="w-full text-[13px] border border-[#e5e5e5] rounded-[6px] px-3 py-2 outline-none focus:border-black"
            />
            {productResults.length > 0 && (
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto border border-[#e5e5e5] rounded-[6px]">
                {productResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setProductResults([]); setProductSearch(p.title); }}
                    className={`flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 text-[13px] ${selectedProduct?.id === p.id ? 'bg-gray-50 font-medium' : ''}`}
                  >
                    <img src={p.images?.[0] || '/placeholder.png'} className="w-7 h-7 rounded object-cover border" alt="" />
                    <span className="truncate">{p.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424] flex justify-between">
              Meta Title
              <span className={`text-[11px] ${title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{title.length}/60</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-[13px] border rounded-[6px] px-3 py-2 outline-none focus:border-black ${title.length > 60 ? 'border-red-300' : 'border-[#e5e5e5]'}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424] flex justify-between">
              Meta Description
              <span className={`text-[11px] ${description.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>{description.length}/155</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`w-full text-[13px] border rounded-[6px] px-3 py-2 outline-none focus:border-black resize-none ${description.length > 155 ? 'border-red-300' : 'border-[#e5e5e5]'}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#242424]">URL Path</label>
            <div className="flex items-center text-[13px] border border-[#e5e5e5] rounded-[6px] overflow-hidden focus-within:border-black">
              <span className="bg-gray-50 text-gray-500 px-3 py-2 border-r select-none shrink-0">brightsupplements.store/</span>
              <input type="text" value={urlPath} onChange={(e) => setUrlPath(e.target.value)} className="w-full px-2 py-2 outline-none font-mono" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showRichSnippet} onChange={(e) => setShowRichSnippet(e.target.checked)} className="rounded" />
            <span className="text-[13px] font-medium text-[#242424]">Show aggregate rating snippet (mock)</span>
          </label>
        </div>
      </div>

      {/* Live SERP Preview Card */}
      <div className="w-full xl:w-2/3 bg-[#f8f9fa] flex flex-col items-center justify-center rounded-[12px] border border-[#e5e5e5] shadow-sm overflow-hidden h-full p-10">
        {isLoading ? (
          <div className="text-[13px] text-[#71717a]">Loading real SEO data...</div>
        ) : (
          <>
            <div className="max-w-[600px] w-full bg-white rounded-[12px] shadow-lg border border-gray-100 p-8 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#242424] rounded-full flex items-center justify-center text-white text-[14px] font-bold shrink-0">S</div>
                <div className="flex flex-col overflow-hidden">
                <span className="text-[14px] text-[#202124] font-medium leading-tight">Bright Supplements</span>
                  <span className="text-[12px] text-[#4d5156] leading-tight truncate">
                    https://www.brightsupplements.store{urlPath ? ` › ${urlPath.split('/')[0]}` : ''}
                  </span>
                </div>
              </div>

              <a href="#" className="text-[#1a0dab] text-[20px] font-medium leading-[1.3] block mb-1 hover:underline">
                {truncatedTitle || <span className="text-gray-300 italic">No title set</span>}
              </a>

              {showRichSnippet && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex text-[#fbbc04]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <span className="text-[13px] text-[#70757a]">Rating: 4.9 · 1,428 reviews · In stock · NPR 8,500</span>
                </div>
              )}

              <p className="text-[#4d5156] text-[14px] leading-[1.58]">
                {truncatedDescription || <span className="text-gray-300 italic">No description set — Google will auto-generate one.</span>}
              </p>
            </div>

            <div className="mt-6 flex gap-3 text-[12px]">
              <span className={`px-2.5 py-1 rounded-full font-medium ${title.length > 0 && title.length <= 60 ? 'bg-green-100 text-green-700' : title.length > 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                Title: {title.length > 60 ? 'Too long ✕' : title.length === 0 ? 'Missing' : 'Good ✓'}
              </span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${description.length > 0 && description.length <= 155 ? 'bg-green-100 text-green-700' : description.length > 155 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                Description: {description.length > 155 ? 'Too long ✕' : description.length === 0 ? 'Missing' : 'Good ✓'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
