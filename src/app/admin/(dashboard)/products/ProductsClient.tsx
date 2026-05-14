'use client';

import React, { useState, useEffect } from 'react';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import DashboardProductCard from '@/components/admin/products/ProductCard';
import ProductTableView from '@/components/admin/products/ProductTableView';
import Pagination from '@/components/admin/products/Pagination';
import UpdatePriceModal from '@/components/admin/products/UpdatePriceModal';
import { Product } from '@/services/productService';
import ProductFilters from '@/components/admin/products/ProductFilters';
import { updateProductAction, deleteProductAction, duplicateProductAction, fetchProductsPaginatedAction } from '@/app/actions/productActions';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductTableSkeleton, ProductGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';

const PAGE_SIZE = 8;

export default function ProductsClient({ initialData }: { initialData?: any }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(initialData?.products || []);
  const [totalCount, setTotalCount] = useState<number>(initialData?.totalCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(!initialData?.success);
  const { showAdminToast } = useAdminToast();
  const [isMounted, setIsMounted] = useState(false);

  const { setPrimaryAction, setOverrideTitle } = useAdminUI();

  useEffect(() => {
    setIsMounted(true);
    setOverrideTitle(null);
    setPrimaryAction(null);
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<Product | null>(null);

  const loadProducts = async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const result = await fetchProductsPaginatedAction(page, PAGE_SIZE, { search });
      if (result?.success) {
        setProducts(result.products as Product[] || []);
        setTotalCount(result.totalCount || 0);
        setSelectedIds([]);
      } else {
        showAdminToast(result?.message || 'Failed to load products', 'error');
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      showAdminToast(error.message || 'An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        // If we have SSR data, and we are on page 1 with no search query, skip the initial fetch
        if (initialData?.success && currentPage === 1 && searchQuery === '') {
            setIsLoading(false);
            return;
        }
    }
    loadProducts(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const res = await updateProductAction(id, updates);
    if (res.success) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      let message = 'Product updated successfully.';
      if (updates.is_published !== undefined) {
          message = updates.is_published ? 'Product published live.' : 'Product hidden from store.';
      } else if (updates.is_draft !== undefined) {
          message = updates.is_draft ? 'Product moved to drafts.' : 'Product removed from drafts.';
      } else if (updates.stock_status !== undefined) {
          message = `Stock status updated to ${updates.stock_status.replace(/_/g, ' ')}.`;
      }
      showAdminToast(message, 'success');
    } else {
      showAdminToast(`Failed to update product: ${res.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete ${title}?`)) {
      const res = await deleteProductAction(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setTotalCount(prev => prev - 1);
        showAdminToast('Product deleted successfully.', 'success');
      } else {
        showAdminToast(res.message, 'error');
      }
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    const res = await duplicateProductAction(id);
    if (res.success) {
      loadProducts(currentPage, searchQuery);
      showAdminToast('Product duplicated successfully.', 'success');
    } else {
      showAdminToast(res.message, 'error');
    }
  };

  const handleOpenPriceModal = (product: Product) => {
    setSelectedProductForPrice(product);
    setIsPriceModalOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      {/* DynamicAdminNav is now in Layout */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search products..."
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        onRefresh={() => loadProducts(currentPage, searchQuery)}
        refreshLoading={isLoading}
        filterDropdown={<ProductFilters />}
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[200px]">
        <AnimatePresence mode="wait">
          {isLoading && products.length === 0 ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'grid' ? <ProductGridSkeleton count={8} /> : <ProductTableSkeleton rows={8} />}
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-[#71717a] text-[14px] font-regular">
                  Showing <span className="text-[#242424] font-medium">{products.length}</span> of <span className="text-[#242424] font-medium">{totalCount}</span> products
                </p>
                {selectedIds.length > 0 && (
                  <p className="text-[#242424] text-[12px] font-medium">
                    {selectedIds.length} products selected
                  </p>
                )}
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DashboardProductCard
                        id={product.id}
                        title={product.title}
                        brand={product.brands?.name || 'SNP'}
                        currentPrice={`NPR ${product.discounted_price}`}
                        originalPrice={product.original_price ? `NPR ${product.original_price}` : undefined}
                        image={product.images?.[0] || '/images/product-placeholder.png'}
                        stockCount={product.stock_count || 0}
                        status={product.is_draft ? 'Draft' : product.is_published ? (product.stock_status === 'in_stock' ? 'Published' : product.stock_status === 'pre_order' ? 'Pre-Order' : 'Out of Stock') : 'Hidden'}
                        sizes={product.product_sizes?.map(s => s.size_label) || []}
                        flavors={product.product_flavours?.map(f => f.flavour_name) || []}
                        fullProduct={product}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <ProductTableView
                products={products}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onUpdate={handleUpdateProduct}
                onDelete={handleDeleteProduct}
                onDuplicate={handleDuplicateProduct}
                onUpdatePrice={handleOpenPriceModal}
              />
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-[400px] gap-4 text-center"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#71717a]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h2 className="text-[#242424] text-[18px] font-semibold">No products found</h2>
            <p className="text-[#71717a] text-[14px] max-w-xs">We couldn't find any products matching "{searchQuery}". Try a different term.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#242424] font-medium text-[14px] underline underline-offset-4"
            >
              Clear search
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {selectedProductForPrice && (
        <UpdatePriceModal
          isOpen={isPriceModalOpen}
          onClose={() => {
            setIsPriceModalOpen(false);
            setSelectedProductForPrice(null);
          }}
          onSuccess={(updatedVariants) => {
            setProducts(prev => prev.map(p =>
              p.id === selectedProductForPrice.id
                ? { ...p, product_variants: updatedVariants as any }
                : p
            ));
          }}
          product={selectedProductForPrice}
        />
      )}
    </div>
  );
}
