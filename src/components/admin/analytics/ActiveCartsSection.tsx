'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Package, Users } from 'lucide-react';
import AdminModal from '@/components/admin/shared/AdminModal';

interface ActiveCartsSectionProps {
  data: {
    productsInCarts: any[];
  };
}

export const ActiveCartsSection = ({ data }: ActiveCartsSectionProps) => {
  const { productsInCarts } = data;
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const displayedItems = isExpanded ? productsInCarts : productsInCarts.slice(0, 5);
  const hasMore = productsInCarts.length > 5;

  return (
    <div className="space-y-6 font-rubik tracking-tight">
      {/* Header removed to avoid duplication in AbandonedCartClient */}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        <AnimatePresence mode="popLayout">
          {displayedItems.length > 0 ? displayedItems.map((product, i) => (
            <motion.div
              key={product.id || i}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="group flex w-full flex-col p-[14px] gap-[16px] items-start bg-white rounded-[12px] transition-all duration-300 border border-gray-100 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-[2px]"
            >
              {/* Product Info Block */}
              <div className="flex gap-[12px] items-start self-stretch min-h-[72px]">
                {/* Product Image */}
                <div className="w-[72px] h-[72px] shrink-0 rounded-[8px] relative overflow-hidden bg-[#f4f4f5] border border-gray-50">
                  <img
                    src={product.thumbnail || '/images/protein.webp'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-col gap-[4px] min-w-0 flex-1">
                  <span className="text-[11px] font-regular text-[#71717a] uppercase tracking-wider">
                    {product.brand || 'SNP Nutrition'}
                  </span>
                  <h3 className="text-[14px] font-semibold text-[#242424] leading-[18px] line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users className="w-3 h-3 text-[#3f9633]" />
                    <span className="text-[11px] font-semibold text-[#3f9633] uppercase tracking-tight">
                      In {product.unique_cart_count} Carts
                    </span>
                  </div>
                </div>
              </div>

              {/* Shoppers Table Style Section - Grow this to push footer down */}
              <div className="flex flex-col w-full rounded-[8px] border border-[#f3f4f6] overflow-hidden bg-white flex-1">
                <div className="flex items-center justify-between px-[12px] py-[8px] border-b border-[#f3f4f6] bg-gray-50/30">
                  <span className="text-[10px] font-regular text-[#a1a1aa] uppercase tracking-wider">Top Shopper</span>
                  {product.users.length > 1 && (
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-[10px] font-semibold text-[#3f9633] hover:underline"
                    >
                      View All ({product.users.length})
                    </button>
                  )}
                </div>
                
                <div className="p-[8px] space-y-1">
                  {product.users.slice(0, 1).map((user: any, j: number) => (
                    <div key={j} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase">
                            {user.name ? user.name.charAt(0) : <User className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[#242424] truncate leading-none mb-0.5">{user.name}</p>
                        <p className="text-[9px] text-[#a1a1aa] truncate leading-none">{user.email}</p>
                      </div>
                    </div>
                  ))}
                  
                  {product.users.length > 1 && (
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="w-full pt-1 px-1.5 flex justify-start"
                    >
                      <span className="text-[9px] font-semibold text-[#71717a] italic hover:text-[#242424] transition-colors">
                        + {product.users.length - 1} more waiting in cart...
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Footer Rank - Pinned to bottom */}
              <div className="flex items-center justify-between w-full pt-1 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#3f9633] animate-pulse" />
                  <span className="text-[10px] text-[#71717a] font-regular italic">High purchase intent</span>
                </div>
                <span className="text-[11px] font-semibold text-[#242424] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  Rank #{i + 1}
                </span>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-normal italic font-rubik">No active cart data found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* View All Toggle & Status */}
      <div className="flex flex-col items-center gap-4 pt-10 border-t border-gray-50/50">
        <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em]">
          Showing {displayedItems.length} of {productsInCarts.length} high-intent items
        </div>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-3 px-10 py-3.5 bg-white hover:bg-[#242424] rounded-[14px] border border-gray-200 shadow-sm transition-all duration-300"
          >
            <span className="text-[12px] font-bold text-[#242424] group-hover:text-white uppercase tracking-wider">
              {isExpanded ? 'Show Less' : `View All Active Carts (${productsInCarts.length})`}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <ShoppingCart className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-[#242424]'} group-hover:text-white`} />
            </motion.div>
          </button>
        )}
      </div>

      {/* Customer List Modal */}
      <AdminModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Active Shoppers"
        description={selectedProduct ? `Customers currently holding ${selectedProduct.name} in their cart` : ''}
        maxWidth="max-w-xl"
        maxHeight="max-h-[85vh] lg:max-h-[60vh]"
        headerRight={selectedProduct && (
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
            <img src={selectedProduct.thumbnail || '/images/protein.webp'} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      >
        <div className="space-y-2">
          {selectedProduct?.users.map((user: any, j: number) => (
            <div key={j} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-transparent hover:border-gray-200 transition-all group">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                <User className="w-4 h-4 text-[#71717a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#242424] truncate leading-tight mb-0.5">{user.name}</p>
                <p className="text-[10px] text-[#71717a] font-medium truncate leading-tight">{user.email}</p>
              </div>
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-0.5 bg-[#3f9633]/10 text-[#3f9633] text-[9px] font-bold rounded-full uppercase tracking-tight">Active</span>
              </div>
            </div>
          ))}
        </div>
      </AdminModal>
    </div>
  );
};
