'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type TabID = 'description' | 'ingredients' | 'manufacturer' | 'other';

const ProductDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabID>('description');
  const [mounted, setMounted] = useState(false);

  // Fix hydration and potential URL construction issues during SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs: { id: TabID; label: string; width: string }[] = [
    { id: 'description', label: 'Product Description', width: 'w-[161px]' },
    { id: 'ingredients', label: 'Ingredients', width: 'w-[102px]' },
    { id: 'manufacturer', label: 'Manufacturer Info', width: 'w-[147px]' },
    { id: 'other', label: 'Other Details', width: 'w-[152px]' },
  ];

  if (!mounted) return <div className="w-full h-[500px]" />;

  return (
    <section className="main-container relative mx-auto flex w-full max-w-[700px] flex-col items-start gap-[16px] lg:mx-0 lg:max-w-none">
      {/* SECTION TITLE: 20px, 600 weight, -0.4px tracking */}
      <h2 className="h-[18px] font-titillium text-[20px] font-semibold leading-[18px] tracking-[-0.4px] text-[#242424] whitespace-nowrap">
        Product Details
      </h2>

      <div className="flex w-full flex-col gap-[16px] self-stretch">
        
        {/* TABS NAVIGATION: 610px width scrollable row on mobile */}
        <nav className="flex w-full flex-col items-start gap-[10px] overflow-x-auto no-scrollbar">
          <div className="flex w-[610px] lg:w-full flex-nowrap lg:flex-wrap gap-[16px] shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex ${tab.width} lg:flex-1 lg:min-w-[140px] h-[36px] px-[12px] py-[8px] justify-center items-center rounded-[6px] border transition-all duration-300 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] outline-none
                  ${activeTab === tab.id 
                    ? 'bg-[#242424] border-[#242424]' 
                    : 'bg-[#fafbfc] border-[#eaebf0]'}
                `}
              >
                <span className={`font-inter text-[14px] font-semibold leading-[20px] tracking-[0.1px] whitespace-nowrap transition-colors duration-300
                  ${activeTab === tab.id ? 'text-white' : 'text-[#252525]'}
                `}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* CONTENT AREA: Smoothest animation transitions */}
        <div className="relative w-full ">
          
          {activeTab === 'description' && (
            <div className="w-full font-inter text-[16px] font-normal leading-[22px] text-[#242424] animate-in fade-in slide-in-from-left-4 duration-500">
              <p>Information related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as followsInformation related to the product are as follows Information related to the product are as follows</p>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-500">
              {/* IMAGE: Using local public folder path to avoid URL errors */}
              <div className="relative box-content w-full h-[362px] rounded-[8px] border-[4px] border-white shadow-[0_4px_6px_0_rgba(16,24,40,0.1)] overflow-hidden">
                <Image 
                  src="/images/ingredients.png" 
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
              {/* ROW 1 */}
              <div className="flex w-full h-[73px] items-stretch justify-between border-t border-[#e8e8e8]">
                <DetailItem label="Sales Package" value="01 Packet of Protein Powder" border={false} />
                <DetailItem label="Quantity" value="1kg" />
              </div>
              {/* ROW 2 */}
              <div className="flex w-full h-[73px] items-stretch justify-between border-t border-[#e8e8e8]">
                <DetailItem label="Model Name" value="Atom Whey" border={false} />
                <DetailItem label="Form" value="Powder" />
              </div>
              {/* ROW 3 (Full Width) */}
              <div className="flex flex-col gap-[5px] py-[8px] border-t border-[#e8e8e8]">
                <span className="font-inter text-[14px] font-semibold leading-[20px] text-[#242424] tracking-[0.1px]">Country of Origin</span>
                <span className="font-inter text-[16px] font-normal leading-[20px] text-[#242424]">India / Nepal</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Reusable Detail Item to ensure 1:1 Figma Layout
const DetailItem = ({ label, value, border = true }: { label: string; value: string; border?: boolean }) => (
  <div className={`flex flex-1 flex-col gap-[5px] py-[4px] px-0 justify-center ${border ? 'border-l border-[#e8e8e8] pl-4' : ''}`}>
    <span className="font-inter text-[14px] font-semibold leading-[20px] text-[#242424] tracking-[0.1px] whitespace-nowrap">
      {label}
    </span>
    <span className="font-inter text-[16px] font-normal leading-[20px] text-[#242424] line-clamp-2">
      {value}
    </span>
  </div>
);

export default ProductDetails;