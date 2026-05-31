'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Clock, CreditCard, ExternalLink, Mail, Phone } from 'lucide-react';

interface AbandonedCheckoutsSectionProps {
  data: {
    abandonedOrders: any[];
  };
}

export const AbandonedCheckoutsSection = ({ data }: AbandonedCheckoutsSectionProps) => {
  const { abandonedOrders } = data;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const displayedItems = isExpanded ? abandonedOrders : abandonedOrders.slice(0, 5);
  const hasMore = abandonedOrders.length > 5;

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 font-rubik tracking-tight">
      <div className="px-2">
        <div className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.15em]">
          Showing {displayedItems.length} of {abandonedOrders.length} Potential Recoveries
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {displayedItems.length > 0 ? displayedItems.map((order, i) => (
            <motion.article 
              key={order.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03 }}
              className="flex w-full flex-col rounded-[12px] bg-white border border-gray-100 shadow-none hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden"
            >
              {/* Header - Matching OrderCard status bar */}
              <header className="flex px-[16px] py-[10px] justify-between items-center bg-zinc-50 border-b border-[#f3f4f6]">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-zinc-100 text-[#3f3f46] text-[10px] font-semibold rounded uppercase tracking-wider">
                    Abandoned
                  </div>
                  <span className="text-[11px] text-[#a1a1aa] font-regular italic">
                    {getRelativeTime(order.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3 h-3 text-[#a1a1aa]" />
                  <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">Pending</span>
                </div>
              </header>

              <div className="p-[16px] flex flex-col md:flex-row gap-6">
                {/* Left: Customer Info Block */}
                <div className="md:w-[40%] flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-50 pb-4 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                      {order.customer.avatar ? (
                        <img src={order.customer.avatar} alt={order.customer.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-gray-300 uppercase">
                          {order.customer.name ? order.customer.name.charAt(0) : <User className="w-5 h-5" />}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold text-[#242424] truncate leading-tight mb-0.5">{order.customer.name}</h3>
                      <p className="text-[10px] text-[#a1a1aa] font-medium uppercase tracking-wider">Contact Details</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#71717a]">
                      <Mail className="w-3.5 h-3.5 opacity-70" />
                      <span className="text-[12px] truncate">{order.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#71717a]">
                      <Phone className="w-3.5 h-3.5 opacity-70" />
                      <span className="text-[12px]">{order.customer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Order Content & Value */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-[0.15em] mb-2.5">Items in session</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-lg border border-gray-100 pr-3">
                          <img src={item.thumbnail || '/images/protein.webp'} alt="" className="w-7 h-7 rounded-md object-cover border border-gray-200" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-[#242424] max-w-[120px] truncate leading-tight">{item.product_name}</span>
                            <span className="text-[9px] text-[#71717a]">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-gray-50/50">
                    <div>
                      <p className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-widest mb-1">Total Recovery</p>
                      <p className="text-[18px] font-semibold text-[#242424]">Rs. {order.total_amount}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#242424] text-white text-[11px] font-semibold rounded-lg hover:bg-black transition-all shadow-sm active:scale-95">
                      Recover Order
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          )) : (
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-[20px] border border-dashed border-gray-200">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium italic font-rubik">No abandoned checkouts found.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* View All Toggle & Status */}
      {hasMore && (
        <div className="flex flex-col items-center gap-4 pt-10 border-t border-gray-50/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-3 px-10 py-3.5 bg-white hover:bg-[#242424] rounded-[14px] border border-gray-200 shadow-sm transition-all duration-300"
          >
            <span className="text-[12px] font-bold text-[#242424] group-hover:text-white uppercase tracking-wider">
              {isExpanded ? 'Show Less' : `View All Potential Recoveries (${abandonedOrders.length})`}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CreditCard className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-[#242424]'} group-hover:text-white`} />
            </motion.div>
          </button>
        </div>
      )}
    </div>
  );
};
