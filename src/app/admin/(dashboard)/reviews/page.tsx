'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import ReviewFilters from '@/components/admin/reviews/ReviewFilters';
import ReviewGrid from '@/components/admin/reviews/ReviewCard';
import ReviewTable from '@/components/admin/reviews/ReviewTable';
import ReviewModal from '@/components/admin/reviews/ReviewModal';
import { Review } from '@/services/productService';
import { fetchReviewsAction, createReviewAction, updateReviewAction, deleteReviewAction } from '@/app/actions/reviewActions';
import { TableSkeleton, CardGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function ReviewsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showAdminToast } = useAdminToast();

  const loadReviews = async () => {
    setIsLoading(true);
    const res = await fetchReviewsAction();
    setReviews(res.reviews as Review[] || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const res = await deleteReviewAction(id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showAdminToast('Review deleted successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleAddReview = () => {
    setSelectedReview(null);
    setIsModalOpen(true);
  };

  const handleSave = async (id: string | null, data: Partial<Review>, productIds: string[] = []) => {
    setIsSaving(true);
    if (id) {
      // Edit: update the review row and its mappings
      const res = await updateReviewAction(id, data, productIds);
      if (res.success && res.data) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...res.data as Review } : r)));
        setIsModalOpen(false);
        showAdminToast('Review updated successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    } else {
      // Create: bulk-insert one row per product (or one row with null if no product)
      const res = await createReviewAction(data, productIds);
      if (res.success && res.data) {
        const newRows = Array.isArray(res.data) ? res.data : [res.data];
        setReviews((prev) => [...(newRows as Review[]), ...prev]);
        setIsModalOpen(false);
        showAdminToast('Review created successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
    setIsSaving(false);
  };

  const filteredReviews = useMemo(
    () =>
      reviews.filter(
        (r) =>
          r.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.role?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [reviews, searchQuery]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredReviews.length ? [] : filteredReviews.map((r) => r.id)
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav onPrimaryAction={handleAddReview} />
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search reviews..."
        onSearch={setSearchQuery}
        onRefresh={loadReviews}
        refreshLoading={isLoading}
        filterDropdown={<ReviewFilters />}
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        {isLoading ? (
          viewMode === 'list' ? (
            <TableSkeleton rows={8} cols={7} />
          ) : (
            <CardGridSkeleton count={10} />
          )
        ) : viewMode === 'list' ? (
          <ReviewTable
            reviews={filteredReviews}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <ReviewGrid
            reviews={filteredReviews}
            onEditAction={handleEdit}
            onDeleteAction={handleDelete}
          />
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        review={selectedReview}
        isSaving={isSaving}
      />
    </div>
  );
}
