'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import CouponTable from '@/components/admin/coupons/CouponTable';
import CouponGrid from '@/components/admin/coupons/CouponCard';
import CouponModal from '@/components/admin/coupons/CouponModal';
import { Coupon } from '@/components/admin/coupons/CouponActionMenu';
import { fetchCouponsAction, deleteCouponAction, updateCouponAction, createCouponAction } from '@/app/actions/couponActions';
import { TableSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showAdminToast } = useAdminToast();

  const loadCoupons = async () => {
    setIsLoading(true);
    const res = await fetchCouponsAction();
    if (res.success) {
      setCoupons(res.data || []);
    } else {
      showAdminToast(`Error: ${res.message}`, 'error');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      const res = await deleteCouponAction(id);
      if (res.success) {
        setCoupons(coupons.filter(c => c.id !== id));
        showAdminToast('Coupon deleted successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (coupon: Coupon) => {
    const newVisibility = coupon.is_public === false ? true : false;
    const res = await updateCouponAction(coupon.id, { is_public: newVisibility });
    if (res.success && res.data) {
      const refreshRes = await fetchCouponsAction();
      if (refreshRes.success) {
        setCoupons(refreshRes.data || []);
      }
      showAdminToast(`Coupon is now ${newVisibility ? 'public' : 'private'}.`, 'success');
    } else {
      showAdminToast(`Error: ${res.message}`, 'error');
    }
  };

  const handleSaveCoupon = async (id: string | null, data: Partial<Coupon>) => {
    setIsSaving(true);
    if (id) {
      const res = await updateCouponAction(id, data);
      if (res.success && res.data) {
        // Refresh to get joined product data if it changed
        const refreshRes = await fetchCouponsAction();
        if (refreshRes.success) {
            setCoupons(refreshRes.data || []);
        }
        setIsModalOpen(false);
        showAdminToast('Coupon updated successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    } else {
      const res = await createCouponAction(data);
      if (res.success && res.data) {
         // Refresh to get joined product data
         const refreshRes = await fetchCouponsAction();
         if (refreshRes.success) {
             setCoupons(refreshRes.data || []);
         }
        setIsModalOpen(false);
        showAdminToast('Coupon created successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
    setIsSaving(false);
  };

  const filteredCoupons = useMemo(() => coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [coupons, searchQuery]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredCoupons.length ? [] : filteredCoupons.map((c) => c.id)
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav onPrimaryAction={handleCreateCoupon} />
      <AdminSubNav
        searchPlaceholder="Search coupons by code or description..."
        onSearch={setSearchQuery}
        showViewMode={true}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : (
          viewMode === 'list' ? (
            <CouponTable 
              coupons={filteredCoupons} 
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onEditAction={handleEdit} 
              onDeleteAction={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : (
            <CouponGrid
              coupons={filteredCoupons}
              onEditAction={handleEdit}
              onDeleteAction={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          )
        )}
      </div>

      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCoupon}
        coupon={selectedCoupon}
        isSaving={isSaving}
      />
    </div>
  );
}
