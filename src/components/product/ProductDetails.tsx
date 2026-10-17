'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import MediaLightbox from '@/components/ui/MediaLightBox';
import type { Product } from '@/services/productService';

type TabID = 'description' | 'ingredients' | 'manufacturer' | 'other';

interface ProductDetailsProps {
  product: Product;
}

/**
 * Sanitizes and cleans up external product description HTML (e.g. pasted from Amazon or supplier specs).
 * 1. Strips hardcoded fixed pixel widths (e.g. style="width: 637px") from wrappers, tables and cells.
 * 2. Strips intrusive font-family overrides (e.g. "Amazon Ember") so site typography remains consistent.
 * 3. Wraps tables in a responsive horizontal scroll container so labels stay intact without being crushed.
 * 4. Converts tab-separated specifications into clean 2-column tables.
 */
function formatProductDescription(rawHtml?: string): string {
  if (!rawHtml) return '';

  let cleaned = rawHtml;

  // 1. Remove Amazon/external fixed pixel widths and font overrides
  cleaned = cleaned.replace(/\bstyle\s*=\s*"([^"]*)"/gi, (match, styleContent) => {
    const rules = styleContent.split(';').map((r: string) => r.trim());
    const filtered = rules.filter((rule: string) => {
      if (!rule) return false;
      const [prop] = rule.split(':');
      const p = prop.trim().toLowerCase();
      return !['width', 'min-width', 'max-width', 'font-family', 'word-break', 'max-height'].includes(p);
    });
    return filtered.length > 0 ? `style="${filtered.join('; ')}"` : '';
  });

  // Remove fixed width/height attributes (e.g. width="500")
  cleaned = cleaned.replace(/\s+(?:width|height)\s*=\s*["'][^"']*["']/gi, '');

  // 2. Wrap tables in an overflow container if not already wrapped
  if (cleaned.includes('<table') && !cleaned.includes('product-desc-table-wrap')) {
    cleaned = cleaned.replace(/(<table[\s\S]*?<\/table>)/gi, (match) => {
      return `<div class="product-desc-table-wrap overflow-x-auto w-full my-3 pb-1 -mx-0.5 px-0.5 no-scrollbar">${match}</div>`;
    });
  }

  // 3. Handle tab-separated key-values if plain text or html with tabs was entered:
  cleaned = cleaned.replace(/&Tab;|&#9;/gi, '\t');
  if (cleaned.includes('\t') && !cleaned.includes('<table')) {
    const lines = cleaned.split(/\r?\n|<br\s*\/?>|<\/p>|<\/div>/i);
    let inTable = false;
    const newParts: string[] = [];
    let tableRows: string[] = [];

    for (const rawLine of lines) {
      const plainText = rawLine.replace(/<[^>]*>/g, '').trim();
      if (plainText.includes('\t')) {
        const parts = plainText.split('\t').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const key = parts[0];
          const val = parts.slice(1).join(' ');
          tableRows.push(`<tr><td class="spec-label">${key}</td><td class="spec-value">${val}</td></tr>`);
          inTable = true;
          continue;
        }
      }

      if (inTable) {
        newParts.push(`<div class="product-desc-table-wrap overflow-x-auto w-full my-3 pb-1 -mx-0.5 px-0.5 no-scrollbar"><table class="product-spec-table w-full border-collapse"><tbody>${tableRows.join('')}</tbody></table></div>`);
        tableRows = [];
        inTable = false;
      }
      if (rawLine.trim()) {
        newParts.push(rawLine);
      }
    }
    if (inTable && tableRows.length > 0) {
      newParts.push(`<div class="product-desc-table-wrap overflow-x-auto w-full my-3 pb-1 -mx-0.5 px-0.5 no-scrollbar"><table class="product-spec-table w-full border-collapse"><tbody>${tableRows.join('')}</tbody></table></div>`);
    }
    cleaned = newParts.join('\n');
  }

  return cleaned;
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

  const formattedDescription = useMemo(() => {
    return formatProductDescription(info?.description);
  }, [info?.description]);

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

  return (
    <section id="product-details-section" className="scroll-mt-[66px] main-container relative mx-auto flex w-full max-w-[700px] flex-col items-start lg:mx-0 lg:max-w-none px-[18px] lg:px-[24px]">

      {/* STICKY HEADER */}
      <div className="sticky top-[66px] z-40 flex w-[calc(100%+36px)] lg:w-full flex-col bg-white pt-4 pb-4 -ml-[18px] px-[18px] lg:ml-0 lg:px-0 lg:pt-0 gap-[24px] shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)]">
        {/* SECTION TITLE: 20px, 600 weight, -0.4px tracking */}
        <h2 className="h-[18px] font-rajdhani text-[20px] font-bold leading-[18px] tracking-[-0.4px] text-[#242424] whitespace-nowrap">
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
                  flex ${tab.width} lg:flex-1 lg:min-w-[140px] h-[40px] px-[12px] py-[8px] justify-center items-center rounded-[10px] border transition-all duration-300 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] outline-none
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

      <div className="flex w-full min-w-0 max-w-full flex-col gap-[16px] self-stretch mt-1 overflow-hidden">

        {/* CONTENT AREA: Smoothest animation transitions */}
        <div
          className="relative w-full min-w-0 max-w-full overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >

          {activeTab === 'description' && (
            <div className="w-full min-w-0 max-w-full font-rajdhani text-[16px] font-medium leading-[24px] text-[#242424] animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden [overflow-wrap:break-word]">
              {formattedDescription ? (
                <div
                  className="font-rajdhani text-[16px] leading-[24px] text-[#242424] prose-sm max-w-full w-full min-w-0 [overflow-wrap:break-word]
                    [&_*]:!font-rajdhani [&_*]:max-w-full
                    [&_h1,&_h2,&_h3,&_h4]:!font-rajdhani [&_h1,&_h2,&_h3,&_h4]:font-bold [&_h1,&_h2,&_h3,&_h4]:text-[#242424] [&_h1]:text-[22px] [&_h2]:text-[20px] [&_h3]:text-[18px] [&_h4]:text-[16px] [&_h1,&_h2,&_h3,&_h4]:mt-6 [&_h1,&_h2,&_h3,&_h4]:mb-3
                    [&_p]:mb-3.5 [&_p]:leading-[24px] [&_p]:[overflow-wrap:break-word]
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5
                    [&_li]:!font-rajdhani [&_li]:text-[15px] [&_li]:leading-[22px] [&_li]:text-[#374151] [&_li]:[overflow-wrap:break-word]
                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-3.5 [&_table]:table-auto
                    [&_tr]:border-b [&_tr]:border-[#f0f0f0]
                    [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:!whitespace-nowrap [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:!font-semibold [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:!text-[#242424] [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:!pr-5 [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:!py-2.5 [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:align-top [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:w-[1%] [&_td:first-child,&_th:first-child,&_td.a-span3,&_.spec-label]:min-w-fit
                    [&_td:first-child_*,&_th:first-child_*,&_td.a-span3_*,&_.spec-label_*]:!whitespace-nowrap [&_td:first-child_*,&_th:first-child_*,&_td.a-span3_*,&_.spec-label_*]:!font-semibold [&_td:first-child_*,&_th:first-child_*,&_td.a-span3_*,&_.spec-label_*]:!text-[#242424]
                    [&_td:last-child,&_th:last-child,&_td.a-span9,&_.spec-value]:!whitespace-normal [&_td:last-child,&_th:last-child,&_td.a-span9,&_.spec-value]:!text-[#4b5563] [&_td:last-child,&_th:last-child,&_td.a-span9,&_.spec-value]:!py-2.5 [&_td:last-child,&_th:last-child,&_td.a-span9,&_.spec-value]:align-top [&_td:last-child,&_th:last-child,&_td.a-span9,&_.spec-value]:w-full [&_td:last-child,&_th:last-child,&_td.a-span9,&_.spec-value]:[overflow-wrap:break-word]
                    [&_td:last-child_*,&_th:last-child_*,&_td.a-span9_*,&_.spec-value_*]:!whitespace-normal [&_td:last-child_*,&_th:last-child_*,&_td.a-span9_*,&_.spec-value_*]:[overflow-wrap:break-word]
                    [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_img]:max-w-full [&_img]:h-auto
                  "
                  dangerouslySetInnerHTML={{ __html: formattedDescription }}
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
                className="relative box-content w-full h-[362px] rounded-[14px] lg:rounded-[16px] border-[4px] border-white shadow-[0_4px_6px_0_rgba(16,24,40,0.1)] overflow-hidden cursor-pointer"
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
  <div className={`flex flex-1 min-w-0 flex-col gap-[5px] py-[4px] px-0 justify-center ${border ? 'border-l border-[#e8e8e8] pl-4' : ''}`}>
    <span className="font-inter text-[14px] font-semibold leading-[20px] text-[#242424] tracking-[0.1px] truncate">
      {label}
    </span>
    <span className="font-inter text-[16px] font-medium leading-[20px] text-[#242424] line-clamp-2 break-words [overflow-wrap:anywhere]">
      {value}
    </span>
  </div>
);

export default ProductDetails;
