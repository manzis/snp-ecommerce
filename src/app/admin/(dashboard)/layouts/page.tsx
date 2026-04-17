'use client';

import React, { useState, useEffect } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import LayoutSection from '@/components/admin/layouts/LayoutSection';
import { Product } from '@/services/productService';
import { fetchHomepageProductsAction, updateHomepageProductsAction } from '@/app/actions/layoutActions';
import { TableSkeleton } from '@/components/admin/shared/AdminPageSkeletons';

const SECTIONS = [
  { key: 'popular_products', title: 'Popular Products' },
  { key: 'todays_deals', title: 'Todays Deals', max: 4 },
  { key: 'new_arrivals', title: 'New Arrivals' },
  { key: 'best_selling', title: 'Best Selling' },
];

export default function LayoutsPage() {
  const [sectionData, setSectionData] = useState<Record<string, Product[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadAllSections = async () => {
    setIsLoading(true);
    const results: Record<string, Product[]> = {};

    for (const section of SECTIONS) {
      const res = await fetchHomepageProductsAction(section.key);
      if (res.success && res.data) {
        results[section.key] = res.data;
      } else {
        results[section.key] = [];
      }
    }

    setSectionData(results);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllSections();
  }, []);

  const handleSaveSection = async (sectionKey: string, productIds: string[]) => {
    const res = await updateHomepageProductsAction(sectionKey, productIds);
    if (res.success) {
      // Potentially show a toast or notification
      console.log(res.message);
    } else {
      alert(`Error saving section: ${res.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav overrideTitle="Home Layouts" />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        <div className="w-full flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[8px]">
            <h2 className="text-[24px] font-regular text-[#242424] tracking-tight">Homepage Sections</h2>
            <p className="text-[14px] text-[#71717a]">Manage which products are displayed in the featured sections of your storefront homepage.</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-[20px]">
              <TableSkeleton rows={3} cols={1} />
              <TableSkeleton rows={3} cols={1} />
            </div>
          ) : (
            SECTIONS.map(section => (
              <LayoutSection
                key={section.key}
                title={section.title}
                sectionKey={section.key}
                initialProducts={sectionData[section.key] || []}
                onSave={handleSaveSection}
                maxProducts={section.max}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
