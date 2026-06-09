'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import MediaLightbox from '@/components/ui/MediaLightBox';
import type { Product } from '@/services/productService';

type TabID = 'description' | 'ingredients' | 'manufacturer' | 'other';

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<TabID>('description');
  const [mounted, setMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fix hydration and potential URL construction issues during SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const isInitialMount = useRef(true);

  // Auto-scroll to top of section when tab changes
  useEffect(() => {
    if (!mounted) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // We do this immediately (no setTimeout) and with 'auto' (instant) behavior.
    // This prevents the browser from aggressively adjusting scroll when the height 
    // dramatically changes (e.g. from a very long description to short ingredients),
    // which leaves the user stranded at the bottom of the page.
    const section = document.getElementById('product-details-section');
    if (section) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: sectionTop - 66,
        behavior: 'auto'
      });
    }
  }, [activeTab, mounted]);

  const handleTabClick = (tabId: TabID, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tabId);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  const info = Array.isArray(product.product_info) ? product.product_info[0] : product.product_info;
  const otherDetails = info?.other_details || {};
  const manufacturerInfo = info?.manufacture_info || {};

  // Decide which data source to use based on the active tab
  const activeDataObj = activeTab === 'manufacturer' ? manufacturerInfo : otherDetails;
  const activeEntries = Object.entries(activeDataObj);

  // Group into pairs (chunks of 2) for mapping 2-column rows
  const rowChunks = [];
  for (let i = 0; i < activeEntries.length; i += 2) {
    rowChunks.push(activeEntries.slice(i, i + 2));
  }

  const tabs: { id: TabID; label: string; width: string }[] = [
    { id: 'description', label: 'Product Description', width: 'w-[161px]' },
    { id: 'ingredients', label: 'Ingredients', width: 'w-[102px]' },
    { id: 'manufacturer', label: 'Manufacturer Info', width: 'w-[147px]' },
    { id: 'other', label: 'Other Details', width: 'w-[152px]' },
  ];

  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.findIndex(t => t.id === activeTab);
      if (isLeftSwipe && currentIndex < tabs.length - 1) {
        const nextTab = tabs[currentIndex + 1];
        setActiveTab(nextTab.id);
        setTimeout(() => {
          document.getElementById(`tab-btn-${nextTab.id}`)?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
          });
        }, 50);
      }
      if (isRightSwipe && currentIndex > 0) {
        const prevTab = tabs[currentIndex - 1];
        setActiveTab(prevTab.id);
        setTimeout(() => {
          document.getElementById(`tab-btn-${prevTab.id}`)?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
          });
        }, 50);
      }
    }
  };

  if (!mounted) return <div className="w-full h-[500px]" />;

  return (
    <section id="product-details-section" className="scroll-mt-[66px] main-container relative mx-auto flex w-full max-w-[700px] flex-col items-start lg:mx-0 lg:max-w-none px-[24px]">
      
      {/* STICKY HEADER */}
      <div className="sticky top-[66px] z-40 flex w-[calc(100%+48px)] lg:w-full flex-col bg-white pt-4 pb-4 -ml-[24px] px-[24px] lg:ml-0 lg:px-0 lg:pt-0 gap-[24px] shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
        {/* SECTION TITLE: 20px, 600 weight, -0.4px tracking */}
        <h2 className="h-[18px] font-rajdhani text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424] whitespace-nowrap">
          Product Details
        </h2>

        {/* TABS NAVIGATION: 610px width scrollable row on mobile */}
        <nav className="flex w-full flex-col items-start gap-[10px] overflow-x-auto no-scrollbar">
          <div className="flex w-[610px] lg:w-full flex-nowrap lg:flex-wrap gap-[16px] shrink-0 pb-[2px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                type="button"
                onClick={(e) => handleTabClick(tab.id, e)}
                className={`
                  flex ${tab.width} lg:flex-1 lg:min-w-[140px] h-[40px] px-[12px] py-[8px] justify-center items-center rounded-[6px] border transition-all duration-300 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] outline-none
                  ${activeTab === tab.id
                    ? 'bg-[#242424] border-[#242424]'
                    : 'bg-[#fafbfc] border-[#eaebf0]'}
                `}
              >
                <span className={`font-rajdhani text-[14px] font-semibold leading-[24px] tracking-[0.1px] whitespace-nowrap transition-colors duration-300
                  ${activeTab === tab.id ? 'text-white' : 'text-[#252525]'}
                `}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="flex w-full flex-col gap-[16px] self-stretch mt-1">

        {/* CONTENT AREA: Smoothest animation transitions */}
        <div 
          className="relative w-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >

          {activeTab === 'description' && (
            <div className="w-full font-rajdhani text-[16px] font-medium leading-[24px] text-[#242424] animate-in fade-in slide-in-from-left-4 duration-500">
              {info?.description ? (
                <div 
                  className="font-rajdhani text-[16px] leading-[24px] text-[#242424] prose-sm max-w-none [&_*]:!font-rajdhani [&_h1]:text-[22px] [&_h2]:text-[20px] [&_h3]:text-[18px] [&_h4]:text-[16px] [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold [&_h1,h2,h3,h4]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-0 [&_ul]:list-inside [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: info.description }} 
                />
              ) : (
                <p>No description available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-500">
              {/* IMAGE: Using local public folder path to avoid URL errors */}
              <div 
                className="relative box-content w-full h-[362px] rounded-[8px] border-[4px] border-white shadow-[0_4px_6px_0_rgba(16,24,40,0.1)] overflow-hidden cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Image
                  src={info?.ingredients_image || "/images/ingredients.png"}
                  alt="Product Ingredients"
                  fill
                  className="object-cover"
                  sizes="362px"
                />
              </div>
            </div>
          )}

          {(activeTab === 'manufacturer' || activeTab === 'other') && (
            <div className="w-full flex flex-col gap-0 animate-in fade-in slide-in-from-right-4 duration-500">
              {rowChunks.length === 0 ? (
                <div className="py-4 text-[#787878] italic">No detailed information available.</div>
              ) : (
                rowChunks.map((chunk, rowIndex) => {
                  // If it's the last chunk and only has 1 item, render it full width (matching the original 'Country of Origin' style)
                  if (chunk.length === 1 && rowIndex === rowChunks.length - 1) {
                    const [key, val] = chunk[0];
                    return (
                      <div key={key} className="flex flex-col gap-[5px] py-[8px] border-t border-[#e8e8e8]">
                        <span className="font-inter text-[14px] font-semibold leading-[20px] text-[#242424] tracking-[0.1px]">
                          {key}
                        </span>
                        <span className="font-inter text-[16px] font-medium leading-[20px] text-[#242424]">
                          {String(val)}
                        </span>
                      </div>
                    );
                  }

                  // Normal 2-item row
                  return (
                    <div key={rowIndex} className="flex w-full min-h-[73px] items-stretch justify-between border-t border-[#e8e8e8]">
                      {chunk.map(([key, val], idx) => (
                        <DetailItem
                          key={key}
                          label={key}
                          value={String(val)}
                          border={idx !== 0}
                        />
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <MediaLightbox 
        isOpen={isLightboxOpen}
        media={[{ type: 'image', url: info?.ingredients_image || "/images/ingredients.png", alt: "Ingredients" }]}
        initialIndex={0}
        onClose={() => setIsLightboxOpen(false)}
      />
    </section>
  );
};

// Reusable Detail Item to ensure 1:1 Figma Layout
const DetailItem = ({ label, value, border = true }: { label: string; value: string; border?: boolean }) => (
  <div className={`flex flex-1 flex-col gap-[5px] py-[4px] px-0 justify-center ${border ? 'border-l border-[#e8e8e8] pl-4' : ''}`}>
    <span className="font-inter text-[14px] font-semibold leading-[20px] text-[#242424] tracking-[0.1px] whitespace-nowrap">
      {label}
    </span>
    <span className="font-inter text-[16px] font-medium leading-[20px] text-[#242424] line-clamp-2">
      {value}
    </span>
  </div>
);

export default ProductDetails;
