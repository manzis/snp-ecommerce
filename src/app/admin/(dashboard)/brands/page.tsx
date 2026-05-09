'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import BrandFilters from '@/components/admin/brands/BrandFilters';
import BrandGrid from '@/components/admin/brands/BrandCard';
import BrandTable from '@/components/admin/brands/BrandTable';
import BrandModal from '@/components/admin/brands/BrandModal';
import { fetchBrands, Brand } from '@/services/productService';
import { deleteBrandAction, updateBrandAction, createBrandAction } from '@/app/actions/brandActions';
import { TableSkeleton, CardGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';

export default function BrandsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showAdminToast } = useAdminToast();

  const loadBrands = async () => {
    setIsLoading(true);
    const data = await fetchBrands();
    setBrands(data || []);
    setIsLoading(false);
  };

  const { setPrimaryAction, setOverrideTitle } = useAdminUI();

  useEffect(() => {
    setOverrideTitle(null);
    setPrimaryAction(() => handleCreateBrand);
    loadBrands();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand? This action cannot be undone.')) {
      const res = await deleteBrandAction(id);
      if (res.success) {
        setBrands(brands.filter(b => b.id !== id));
        showAdminToast('Brand deleted successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleCreateBrand = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (id: string | null, data: Partial<Brand>) => {
    setIsSaving(true);
    if (id) {
      // Update existing
      const res = await updateBrandAction(id, data);
      if (res.success) {
        setBrands(brands.map(b => b.id === id ? { ...b, ...data } : b));
        setIsModalOpen(false);
        showAdminToast('Brand updated successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    } else {
      // Create new
      const res = await createBrandAction(data);
      if (res.success && res.data) {
        setBrands([res.data, ...brands]);
        setIsModalOpen(false);
        showAdminToast('Brand created successfully.', 'success');
      } else {
        const errorMsg = res.message?.includes('duplicate key value violates unique constraint') 
          ? 'Error: A brand with this slug already exists. Please use a unique slug.' 
          : `Error: ${res.message}`;
        showAdminToast(errorMsg, 'error');
      }
    }
    setIsSaving(false);
  };

  const filteredBrands = useMemo(() => brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.slug && b.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [brands, searchQuery]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredBrands.length ? [] : filteredBrands.map((b) => b.id)
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      {/* DynamicAdminNav is now in Layout */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search brands..."
        onSearch={setSearchQuery}
        filterDropdown={<BrandFilters />}
      />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px] custom-scrollbar">
        {isLoading ? (
          viewMode === 'list' ? <TableSkeleton rows={8} cols={5} /> : <CardGridSkeleton count={12} />
        ) : (
          <>
            {viewMode === 'list' ? (
              <BrandTable 
                brands={filteredBrands} 
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <BrandGrid 
                brands={filteredBrands} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </div>

      <BrandModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brand={selectedBrand}
        onSave={handleSaveBrand}
        isSaving={isSaving}
      />
    </div>
  );
}
