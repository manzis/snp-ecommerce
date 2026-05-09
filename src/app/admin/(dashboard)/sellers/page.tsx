'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import SellerGrid from '@/components/admin/sellers/SellerCard';
import SellerTable from '@/components/admin/sellers/SellerTable';
import SellerModal from '@/components/admin/sellers/SellerModal';
import SellerFilters from '@/components/admin/sellers/SellerFilters';
import PlusIcon from '@/components/icons/PlusIcon';
import { fetchSellers, Seller } from '@/services/productService';
import { deleteSellerAction, updateSellerAction, createSellerAction } from '@/app/actions/sellerActions';
import { TableSkeleton, CardGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';

export default function SellersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showAdminToast } = useAdminToast();

  const loadSellers = async () => {
    setIsLoading(true);
    const data = await fetchSellers();
    setSellers(data || []);
    setIsLoading(false);
  };

  const { setPrimaryAction, setOverrideTitle } = useAdminUI();

  useEffect(() => {
    setOverrideTitle(null);
    setPrimaryAction(() => handleCreateSeller);
    loadSellers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
      const res = await deleteSellerAction(id);
      if (res.success) {
        setSellers(sellers.filter(s => s.id !== id));
        showAdminToast('Seller deleted successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
  };

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const handleCreateSeller = () => {
    setSelectedSeller(null);
    setIsModalOpen(true);
  };

  const handleSaveSeller = async (id: string | null, data: Partial<Seller>) => {
    setIsSaving(true);
    if (id) {
      // Update existing
      const res = await updateSellerAction(id, data);
      if (res.success && res.data) {
        setSellers(sellers.map(s => s.id === id ? res.data : s));
        setIsModalOpen(false);
        showAdminToast('Seller updated successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    } else {
      // Create new
      const res = await createSellerAction(data);
      if (res.success && res.data) {
        setSellers([res.data, ...sellers]);
        setIsModalOpen(false);
        showAdminToast('Seller created successfully.', 'success');
      } else {
        const errorMsg = res.message?.includes('duplicate key value violates unique constraint') 
          ? 'Error: A seller with this slug already exists. Please use a unique slug.' 
          : `Error: ${res.message}`;
        showAdminToast(errorMsg, 'error');
      }
    }
    setIsSaving(false);
  };

  const filteredSellers = useMemo(() => sellers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.slug && s.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [sellers, searchQuery]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredSellers.length ? [] : filteredSellers.map((s) => s.id)
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      {/* DynamicAdminNav is now in Layout */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSearch={setSearchQuery}
        onRefresh={loadSellers}
        refreshLoading={isLoading}
        filterDropdown={
          <div className="flex items-center gap-2">
            <SellerFilters />
          </div>
        }
      />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        {isLoading ? (
          viewMode === 'list' ? <TableSkeleton rows={8} cols={5} /> : <CardGridSkeleton count={10} />
        ) : viewMode === 'list' ? (
          <SellerTable 
            sellers={filteredSellers} 
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEditAction={handleEdit} 
            onDeleteAction={handleDelete} 
          />
        ) : (
          <SellerGrid 
            sellers={filteredSellers} 
            onEditAction={handleEdit} 
            onDeleteAction={handleDelete} 
          />
        )}
      </div>

      <SellerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSeller}
        seller={selectedSeller}
        isSaving={isSaving}
      />
    </div>
  );
}
