'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import CategoryFilters from '@/components/admin/categories/CategoryFilters';
import CategoryGrid from '@/components/admin/categories/CategoryCard';
import CategoryTable from '@/components/admin/categories/CategoryTable';
import CategoryModal from '@/components/admin/categories/CategoryModal';
import { fetchCategories, Category } from '@/services/productService';
import { deleteCategoryAction, updateCategoryAction, createCategoryAction } from '@/app/actions/categoryActions';
import { TableSkeleton, CardGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showAdminToast } = useAdminToast();

  const loadCategories = async () => {
    setIsLoading(true);
    const data = await fetchCategories();
    setCategories(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        setCategories(categories.filter(c => c.id !== id));
        showAdminToast('Category deleted successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (id: string | null, data: Partial<Category>) => {
    setIsSaving(true);
    if (id) {
      // Update existing
      const res = await updateCategoryAction(id, data);
      if (res.success && res.data) {
        setCategories(categories.map(c => c.id === id ? res.data : c));
        setIsModalOpen(false);
        showAdminToast('Category updated successfully.', 'success');
      } else {
        showAdminToast(`Error: ${res.message}`, 'error');
      }
    } else {
      // Create new
      const res = await createCategoryAction(data);
      if (res.success && res.data) {
        setCategories([res.data, ...categories]);
        setIsModalOpen(false);
        showAdminToast('Category created successfully.', 'success');
      } else {
        const errorMsg = res.message?.includes('duplicate key value violates unique constraint') 
          ? 'Error: A category with this slug already exists. Please use a unique slug.' 
          : `Error: ${res.message}`;
        showAdminToast(errorMsg, 'error');
      }
    }
    setIsSaving(false);
  };

  const filteredCategories = useMemo(() => categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.slug && c.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [categories, searchQuery]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredCategories.length ? [] : filteredCategories.map((c) => c.id)
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav onPrimaryAction={handleCreateCategory} />
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search categories..."
        onSearch={setSearchQuery}
        filterDropdown={<CategoryFilters />}
      />
      
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        {isLoading ? (
          viewMode === 'list' ? <TableSkeleton rows={8} cols={5} /> : <CardGridSkeleton count={10} />
        ) : viewMode === 'list' ? (
          <CategoryTable 
            categories={filteredCategories} 
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEditAction={handleEdit} 
            onDeleteAction={handleDelete} 
          />
        ) : (
          <CategoryGrid 
            categories={filteredCategories} 
            onEditAction={handleEdit} 
            onDeleteAction={handleDelete} 
          />
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
        isSaving={isSaving}
      />
    </div>
  );
}