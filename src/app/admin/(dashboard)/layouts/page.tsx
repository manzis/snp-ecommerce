'use client';

import React, { useState, useEffect } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import LayoutSection from '@/components/admin/layouts/LayoutSection';
import { Product } from '@/services/productService';
import { fetchHomepageProductsAction, updateHomepageProductsAction } from '@/app/actions/layoutActions';
import { TableSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import BannerModal from '@/components/admin/layouts/BannerModal';
import { BannerGrid } from '@/components/admin/layouts/BannerCard';
import { Banner } from '@/services/bannerService';
import { fetchBannersAction, createBannerAction, updateBannerAction, deleteBannerAction } from '@/app/actions/bannerActions';
import PlusIcon from '@/components/icons/PlusIcon';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

const SECTIONS = [
  { key: 'popular_products', title: 'Popular Products' },
  { key: 'todays_deals', title: 'Todays Deals', max: 4 },
  { key: 'new_arrivals', title: 'New Arrivals' },
  { key: 'best_selling', title: 'Best Selling' },
];

export default function LayoutsPage() {
  const [sectionData, setSectionData] = useState<Record<string, Product[]>>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBannersLoading, setIsBannersLoading] = useState(true);
  
  // Modal State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  
  const { showAdminToast } = useAdminToast();

  const loadAllData = async () => {
    setIsLoading(true);
    setIsBannersLoading(true);
    
    // Load Homepage Sections
    const sectionResults: Record<string, Product[]> = {};
    for (const section of SECTIONS) {
      try {
        const res = await fetchHomepageProductsAction(section.key);
        sectionResults[section.key] = res.success && res.data ? res.data : [];
      } catch (e) {
        sectionResults[section.key] = [];
      }
    }
    setSectionData(sectionResults);
    setIsLoading(false);

    // Load Banners
    try {
      const bannerRes = await fetchBannersAction();
      if (bannerRes.success && bannerRes.data) {
        setBanners(bannerRes.data);
      }
    } catch (e) {
      console.error('Error loading banners:', e);
    }
    setIsBannersLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSaveSection = async (sectionKey: string, productIds: string[]) => {
    const res = await updateHomepageProductsAction(sectionKey, productIds);
    if (res.success) {
      showAdminToast('Homepage section updated successfully.', 'success');
    } else {
      showAdminToast(`Error saving section: ${res.message}`, 'error');
    }
  };

  const handleCreateBanner = () => {
    setSelectedBanner(null);
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsBannerModalOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      const res = await deleteBannerAction(id);
      if (res.success) {
        setBanners(prev => prev.filter(b => b.id !== id));
        showAdminToast('Banner deleted successfully.', 'success');
      } else {
        showAdminToast(`Failed to delete banner: ${res.message}`, 'error');
      }
    }
  };

  const handleSaveBanner = async (id: string | null, data: Partial<Banner>) => {
    setIsSavingBanner(true);
    if (id) {
       const res = await updateBannerAction(id, data);
       if (res.success) {
           showAdminToast('Banner updated successfully.', 'success');
           loadAllData();
           setIsBannerModalOpen(false);
       } else {
           showAdminToast(`Error updating banner: ${res.message}`, 'error');
       }
    } else {
        const res = await createBannerAction(data);
        if (res.success) {
            showAdminToast('Banner created successfully.', 'success');
            loadAllData();
            setIsBannerModalOpen(false);
        } else {
            showAdminToast(`Error creating banner: ${res.message}`, 'error');
        }
    }
    setIsSavingBanner(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav overrideTitle="Home Layouts" />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        <div className="w-full flex flex-col gap-[48px]">
          
          {/* BANNER MANAGEMENT SECTION */}
          <section className="flex flex-col gap-[24px]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]">
              <div className="flex flex-col gap-[8px]">
                <h2 className="text-[24px] font-regular text-[#242424] tracking-tight">Active Banners</h2>
                <p className="text-[14px] text-[#71717a]">Manage promotional banners (1080x1080) that appear on product pages.</p>
              </div>
              <button 
                onClick={handleCreateBanner}
                className="flex items-center gap-2 bg-[#242424] text-white px-5 py-2.5 rounded-full text-[13.5px] font-medium hover:bg-black transition-all active:scale-95 shadow-md shadow-black/10"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add New Banner</span>
              </button>
            </div>

            {isBannersLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {[1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-[24px]" />)}
              </div>
            ) : (
                <BannerGrid 
                  banners={banners} 
                  onEdit={handleEditBanner}
                  onDelete={handleDeleteBanner}
                />
            )}
          </section>

          <div className="h-[1px] w-full bg-gray-100" />

          {/* HOMEPAGE SECTIONS */}
          <div className="flex flex-col gap-[32px]">
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

      <BannerModal 
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banner={selectedBanner}
        onSave={handleSaveBanner}
        isSaving={isSavingBanner}
      />
    </div>
  );
}
