'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Package, Clock, CreditCard, ExternalLink, Mail, Phone } from 'lucide-react';

interface AbandonedCheckoutsSectionProps {
  data: {
    abandonedOrders: any[];
  };
}

export const AbandonedCheckoutsSection = ({ data }: AbandonedCheckoutsSectionProps) => {
  const { abandonedOrders } = data;
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(abandonedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = abandonedOrders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 font-rubik">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[20px] font-semibold text-[#242424] font-rubik tracking-tight">Abandoned Checkouts</h2>
        <div className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em]">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, abandonedOrders.length)} of {abandonedOrders.length} Potential Recoveries
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {paginatedItems.length > 0 ? paginatedItems.map((order, i) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[20px] border border-gray-100 p-6 hover:border-gray-300 hover:bg-gray-50/30 transition-all group relative overflow-hidden"
          >
            {/* ... rest of the order content ... */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Customer Info */}
              <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-50 pb-4 md:pb-0 md:pr-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                    <User className="w-5 h-5 text-[#71717a]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#242424] truncate font-rubik tracking-tight">{order.customer.name}</h3>
                    <p className="text-[10px] text-[#a1a1aa] font-medium uppercase tracking-wider">Customer Info</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#71717a]">
                    <Mail className="w-3 h-3" />
                    <span className="text-[11px] truncate">{order.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#71717a]">
                    <Phone className="w-3 h-3" />
                    <span className="text-[11px]">{order.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#71717a] mt-2">
                    <Clock className="w-3 h-3" />
                    <span className="text-[11px]">
                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Order Items & Total */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] mb-1">Items in checkout</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100 pr-3">
                          <img src={item.thumbnail || '/images/protein.webp'} alt={item.product_name} className="w-6 h-6 rounded object-cover border border-gray-200" />
                          <span className="text-[10px] font-semibold text-[#242424] max-w-[100px] truncate">{item.product_name}</span>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-gray-100 font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em] mb-1">Total</p>
                    <p className="text-lg font-semibold text-[#242424] font-rubik">Rs. {order.total_amount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Pending Payment</span>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] text-white text-[10px] font-bold rounded-lg hover:bg-black transition-all">
                    Recovery Action
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-normal italic font-rubik">No abandoned checkouts found.</p>
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
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1 
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
    </div>
  );
};
