'use client';

import React, { useState, useEffect } from 'react';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import DashboardProductCard from '@/components/admin/products/ProductCard';
import ProductTableView from '@/components/admin/products/ProductTableView';
import Pagination from '@/components/admin/products/Pagination';
import UpdatePriceModal from '@/components/admin/products/UpdatePriceModal';
import { fetchProductsPaginated, Product, deleteProduct } from '@/services/productService';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import ProductFilters from '@/components/admin/products/ProductFilters';
import { updateProductAction, deleteProductAction, duplicateProductAction } from '@/app/actions/productActions';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { showAdminToast } = useAdminToast();

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pricing Modal State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<Product | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { products: fetchedProducts, totalCount: count } = await fetchProductsPaginated(
        currentPage,
        PAGE_SIZE,
        { search: searchQuery }
      );
      setProducts(fetchedProducts);
      setTotalCount(count);
      setSelectedIds([]); // Clear selection on page/search change
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Selection Handlers
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

  // Product Action Handlers
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
      loadProducts();
      showAdminToast('Product duplicated successfully.', 'success');
    } else {
      showAdminToast(res.message, 'error');
    }
  };

  const handleOpenPriceModal = (product: Product) => {
    setSelectedProductForPrice(product);
    setIsPriceModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav />
      {/* Contextual Secondary Navigation */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search products..."
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1); // Reset to first page on new search
        }}
        filterDropdown={<ProductFilters />}
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-[#242424] rounded-full animate-spin"></div>
            <p className="text-gray-400 text-[14px] font-medium">Fetching your catalog...</p>
          </div>
        ) : products.length > 0 ? (
          <>
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
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
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
          </div>
        )}
      </div>

      {/* Shared Pricing Modal */}
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
