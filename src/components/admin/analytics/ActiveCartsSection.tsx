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
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(productsInCarts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = productsInCarts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 font-rubik">
      {/* Header with stats and View All */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em]">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, productsInCarts.length)} of {productsInCarts.length} items
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-5">
        {paginatedItems.length > 0 ? paginatedItems.map((product, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[16px] border border-gray-100 p-5 hover:border-gray-300 hover:bg-gray-50/30 transition-all group flex flex-col h-full"
          >
            {/* Product Header */}
            <div className="flex gap-4 mb-5 pb-5 border-b border-gray-50">
              <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                <img src={product.thumbnail || '/images/protein.webp'} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#242424] truncate group-hover:text-blue-600 transition-colors leading-tight mb-1 font-rubik tracking-tight">{product.name}</h3>
                <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.05em] font-rubik">In {product.unique_cart_count} unique carts</span>
                </div>
              </div>
            </div>

            {/* Users List - Limited to 3 */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between px-1">
                <p className="text-[9px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] font-rubik">Active Customers</p>
                {product.users.length > 3 && (
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="text-[9px] font-bold text-[#3f9633] uppercase hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {product.users.slice(0, 3).map((user: any, j: number) => (
                  <div key={j} className="flex items-center gap-2.5 p-2 bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                      <User className="w-3 h-3 text-[#71717a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#242424] truncate leading-none mb-1 font-rubik tracking-tight">{user.name}</p>
                      <p className="text-[9px] text-[#a1a1aa] truncate leading-none font-medium font-rubik">{user.email}</p>
                    </div>
                  </div>
                ))}

                {product.users.length > 3 && (
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-dashed border-gray-200 transition-all group/btn"
                  >
                    <span className="text-[10px] font-bold text-[#71717a] group-hover/btn:text-[#242424] transition-colors">
                      + {product.users.length - 3} more customers
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Action/Badge */}
            <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-[#71717a] font-medium italic font-rubik">Pending checkout</span>
              <div className="px-2 py-0.5 bg-[#242424] text-white text-[9px] font-bold rounded-md uppercase tracking-[0.1em] font-rubik">
                Rank #{startIndex + i + 1}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-normal italic font-rubik">No active cart data found.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-50">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-semibold text-[#71717a] hover:text-[#242424] disabled:opacity-30 transition-all font-rubik"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                  ? 'bg-[#242424] text-white'
                  : 'text-[#71717a] hover:bg-gray-100'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-semibold text-[#71717a] hover:text-[#242424] disabled:opacity-30 transition-all font-rubik"
          >
            Next
          </button>
        </div>
      )}

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
