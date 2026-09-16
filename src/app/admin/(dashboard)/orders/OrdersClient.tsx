'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { fetchAllOrdersAdminAction, createDemoOrderAction, deleteOrderAction, syncMultipleExternalOrdersTrackingAction } from '@/app/actions/orderActions';
import { OrderProps, OrderStatus } from '@/components/orders/OrderCard';
import { AdminOrderList } from '@/components/admin/AdminOrderList';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import { OrderTableSkeleton, OrderGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import Pagination from '@/components/admin/products/Pagination';
import OrderDetailsModal from '@/components/admin/orders/OrderDetailsModal';
import StatusUpdateModal from '@/components/admin/orders/StatusUpdateModal';
import UpdatePaymentStatusModal from '@/components/admin/orders/UpdatePaymentStatusModal';
import LabelPrintModal from '@/components/admin/orders/LabelPrintModal';
import { Printer } from 'lucide-react';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { useAdminUI } from '@/context/AdminUIContext';
import { updateOrderStatusAdminAction, updatePaymentStatusAdminAction, resetPaymentAdminAction } from '@/app/actions/orderActions';

export default function OrdersClient({ initialOrdersData }: { initialOrdersData?: any }) {
  const [isLoading, setIsLoading] = useState(!initialOrdersData?.success && (!initialOrdersData?.orders || initialOrdersData.orders.length === 0));
  const [orders, setOrders] = useState<OrderProps[]>(initialOrdersData?.orders || []);
  const [totalCount, setTotalCount] = useState<number>(initialOrdersData?.totalCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [hideCancelled, setHideCancelled] = useState<boolean>(false);

  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [orderToUpdate, setOrderToUpdate] = useState<any | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const { showAdminToast } = useAdminToast();
  const searchParams = useSearchParams();
  const deepLinkOrderId = searchParams ? searchParams.get('orderId') : null;

  const pageSize = viewMode === 'list' ? 30 : 12;

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  // Notification Logic
  const { markAsSeen, lastSeenAt, isHydrated } = useOrderNotifications();
  const lastSeenAtOnMount = useRef<string | null>(null);
  const hasEffectRun = useRef(false); // Guard for notification effect
  const totalPages = Math.ceil(totalCount / pageSize);

  const { setPrimaryAction, setOverrideTitle } = useAdminUI();

  useEffect(() => {
    setOverrideTitle(null);
    setPrimaryAction(null);
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('admin_orders_hide_cancelled');
      if (saved === 'true') {
        setHideCancelled(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || hasEffectRun.current) return;
    lastSeenAtOnMount.current = lastSeenAt;
    markAsSeen();
    hasEffectRun.current = true;
  }, [isHydrated, lastSeenAt, markAsSeen]);

  // In-memory page cache for instant pagination & zero-latency back/forward navigation
  const pageCacheRef = useRef<Map<string, { orders: OrderProps[]; totalCount: number }>>(new Map());

  // Prime page 1 in cache immediately so subsequent clicks to page 1 are 0ms
  if (pageCacheRef.current.size === 0 && initialOrdersData?.success && initialOrdersData.orders?.length > 0) {
    pageCacheRef.current.set(`1_12___all_all_false_grid`, {
      orders: initialOrdersData.orders,
      totalCount: initialOrdersData.totalCount || 0
    });
  }

  // Pre-fetch both next and previous pages in background
  const prefetchAdjacentPages = (
    page: number,
    limit: number,
    search: string,
    status: string,
    payment: string,
    hide: boolean,
    mode: 'grid' | 'list',
    maxPages: number
  ) => {
    // Next page prefetch
    if (page < maxPages) {
      const nextPage = page + 1;
      const nextKey = `${nextPage}_${limit}_${search}_${status}_${payment}_${hide}_${mode}`;
      if (!pageCacheRef.current.has(nextKey)) {
        setTimeout(async () => {
          try {
            const result = await fetchAllOrdersAdminAction(nextPage, limit, { search, status, paymentStatus: payment, hideCancelled: hide });
            if (result && result.success && result.orders && result.orders.length > 0) {
              pageCacheRef.current.set(nextKey, { orders: result.orders, totalCount: result.totalCount || 0 });
            }
          } catch {}
        }, 150);
      }
    }

    // Previous page prefetch if not already cached
    if (page > 1) {
      const prevPage = page - 1;
      const prevKey = `${prevPage}_${limit}_${search}_${status}_${payment}_${hide}_${mode}`;
      if (!pageCacheRef.current.has(prevKey)) {
        setTimeout(async () => {
          try {
            const result = await fetchAllOrdersAdminAction(prevPage, limit, { search, status, paymentStatus: payment, hideCancelled: hide });
            if (result && result.success && result.orders && result.orders.length > 0) {
              pageCacheRef.current.set(prevKey, { orders: result.orders, totalCount: result.totalCount || 0 });
            }
          } catch {}
        }, 250);
      }
    }
  };

  const loadOrders = async (
    page: number = currentPage,
    search: string = searchQuery,
    status: string = statusFilter,
    payment: string = paymentFilter,
    hide: boolean = hideCancelled,
    mode: 'grid' | 'list' = viewMode,
    forceSkeleton: boolean = false
  ) => {
    const limit = mode === 'list' ? 30 : 12;
    const cacheKey = `${page}_${limit}_${search}_${status}_${payment}_${hide}_${mode}`;

    // Instant load from cache if available (0ms!)
    if (pageCacheRef.current.has(cacheKey)) {
      const cached = pageCacheRef.current.get(cacheKey)!;
      setOrders(cached.orders);
      setTotalCount(cached.totalCount);
      setIsLoading(false);
      const pages = Math.ceil(cached.totalCount / limit);
      prefetchAdjacentPages(page, limit, search, status, payment, hide, mode, pages);
      return;
    }

    setIsLoading(true);

    try {
      const result = await fetchAllOrdersAdminAction(page, limit, { search, status, paymentStatus: payment, hideCancelled: hide });
      if (result && result.success) {
        const fetchedOrders = result.orders || [];
        const count = result.totalCount || 0;
        setOrders(fetchedOrders);
        setTotalCount(count);
        pageCacheRef.current.set(cacheKey, { orders: fetchedOrders, totalCount: count });
        const pages = Math.ceil(count / limit);
        prefetchAdjacentPages(page, limit, search, status, payment, hide, mode, pages);
      } else {
        showAdminToast(result?.message || 'Failed to fetch orders', 'error');
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialOrdersData?.success && initialOrdersData.orders?.length > 0) {
        const pages = Math.ceil((initialOrdersData.totalCount || 0) / 12);
        prefetchAdjacentPages(1, 12, '', 'all', 'all', false, 'grid', pages);
        return;
      }
    }
    loadOrders(currentPage, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode, false);
  }, [currentPage, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode]);

  // Auto-sync external tracking for visible active orders (idle non-blocking)
  const syncedPageRef = useRef<number | null>(null);
  useEffect(() => {
    if (orders.length === 0 || isLoading) return;
    if (syncedPageRef.current === currentPage) return;

    const activeTransitStatuses = ['shipped', 'in_transit', 'shipment_arrived', 'out_for_delivery'];
    const activeIds = orders
      .filter(o => activeTransitStatuses.includes(o.status.toLowerCase()) && o.trackingNumber)
      .map(o => o.id);

    if (activeIds.length > 0) {
      syncedPageRef.current = currentPage;
      const timer = setTimeout(() => {
        syncMultipleExternalOrdersTrackingAction(activeIds)
          .then((res) => {
            if (res?.updatedCount && res.updatedCount > 0) {
              const limit = viewMode === 'list' ? 30 : 12;
              const cacheKey = `${currentPage}_${limit}_${searchQuery}_${statusFilter}_${paymentFilter}_${hideCancelled}_${viewMode}`;
              fetchAllOrdersAdminAction(currentPage, limit, { search: searchQuery, status: statusFilter, paymentStatus: paymentFilter, hideCancelled }).then(result => {
                if (result?.success && result.orders) {
                  setOrders(result.orders);
                  pageCacheRef.current.set(cacheKey, { orders: result.orders, totalCount: result.totalCount || totalCount });
                }
              });
            }
          })
          .catch(err => console.error("Auto-sync failed:", err));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [orders, currentPage, isLoading, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode, totalCount]);

  // Deep Link Logic
  useEffect(() => {
    if (deepLinkOrderId && orders.length > 0) {
      const orderToOpen = orders.find(o => o.id === deepLinkOrderId || o.shortId === deepLinkOrderId);
      if (orderToOpen && !selectedOrderForDetails) {
        handleOpenDetails(orderToOpen);
      }
    }
  }, [deepLinkOrderId, orders, selectedOrderForDetails]);

  const handleOpenDetails = (order: any) => {
    setSelectedOrderForDetails(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatusTrigger = (order: any) => {
    // Keep isDetailsModalOpen so AdminModal is layered gracefully over AdminSheet
    setOrderToUpdate(order);
    setIsStatusModalOpen(true);
  };

  const handleUpdatePaymentTrigger = (order: any) => {
    // Keep isDetailsModalOpen so AdminModal is layered gracefully over AdminSheet
    setOrderToUpdate(order);
    setIsPaymentModalOpen(true);
  };

  const handleCancelOrder = async (order: any, reason: string) => {
    try {
      const res = await updateOrderStatusAdminAction(order.id, 'cancelled', reason);
      if (res.success) {
        const cancelledStatus = 'CANCELLED' as OrderStatus;
        setOrders(prev => prev.map(o =>
          o.id === order.id ? { ...o, status: cancelledStatus } : o
        ));
        if (selectedOrderForDetails?.id === order.id) {
          setSelectedOrderForDetails((prev: any) => ({
            ...prev,
            status: cancelledStatus,
            statusUpdates: [
              ...(prev?.statusUpdates || []),
              {
                status: 'cancelled',
                message: reason || 'Order has been cancelled.',
                date: new Date().toISOString()
              }
            ]
          }));
        }
        pageCacheRef.current.clear();
        showAdminToast(`Order #${order.shortId} cancelled successfully.`, 'success');
        setIsDetailsModalOpen(false);
      } else {
        showAdminToast(res.message || 'Failed to cancel order.', 'error');
      }
    } catch (error) {
      showAdminToast('An error occurred while cancelling order.', 'error');
    }
  };

  const handleConfirmStatusUpdate = async (orderId: string, status: string, message: string, trackingNumber?: string, carrierName?: string) => {
    try {
      const res = await updateOrderStatusAdminAction(orderId, status, message, trackingNumber, carrierName);
      if (res.success) {
        const updatedStatus = status.toUpperCase() as OrderStatus;

        // 1. Instantly update table/grid row in state
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, status: updatedStatus, trackingNumber: trackingNumber || o.trackingNumber, carrierName: carrierName || o.carrierName } : o
        ));

        // 2. Instantly update drawer details and append tracking log
        if (selectedOrderForDetails?.id === orderId) {
          setSelectedOrderForDetails((prev: any) => {
            const currentUpdates = prev?.statusUpdates || [];
            const newLog = {
              status: status.toLowerCase(),
              message: message || `Order status updated to ${status}.`,
              date: new Date().toISOString()
            };
            return {
              ...prev,
              status: updatedStatus,
              trackingNumber: trackingNumber || prev.trackingNumber,
              carrierName: carrierName || prev.carrierName,
              statusUpdates: [...currentUpdates, newLog]
            };
          });
        }

        // 3. Invalidate page cache so next fresh navigation fetches latest
        pageCacheRef.current.clear();

        // 4. Show success toast and close update modal
        showAdminToast(`Order status updated to ${status.toUpperCase()}.`, 'success');
        setIsStatusModalOpen(false);
        setOrderToUpdate(null);
      } else {
        showAdminToast(res.message || 'Failed to update order.', 'error');
        throw new Error(res.message || 'Failed to update order.');
      }
    } catch (err: any) {
      if (!err?.message?.includes('Failed to update order')) {
        showAdminToast('An error occurred during update.', 'error');
      }
      throw err;
    }
  };

  const handleConfirmPaymentUpdate = async (orderId: string, paymentStatus: string, amountPaid?: number) => {
    try {
      const res = await updatePaymentStatusAdminAction(orderId, paymentStatus, amountPaid);
      if (res.success) {
        // 1. Instantly update list state
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, paymentStatus: paymentStatus, amountPaid: amountPaid } : o
        ));

        // 2. Instantly update drawer details
        if (selectedOrderForDetails?.id === orderId) {
          setSelectedOrderForDetails((prev: any) => ({ ...prev, paymentStatus: paymentStatus, amountPaid: amountPaid }));
        }

        pageCacheRef.current.clear();
        showAdminToast(`Payment status updated to ${paymentStatus.toUpperCase()}.`, 'success');
        setIsPaymentModalOpen(false);
        setOrderToUpdate(null);
      } else {
        showAdminToast(res.message || 'Failed to update payment.', 'error');
        throw new Error(res.message || 'Failed to update payment.');
      }
    } catch (err: any) {
      if (!err?.message?.includes('Failed to update payment')) {
        showAdminToast('An error occurred during payment update.', 'error');
      }
      throw err;
    }
  };

  const handleDeleteOrder = async (order: OrderProps) => {
    if (confirm(`Are you sure you want to delete order #${order.shortId}? This action cannot be undone.`)) {
      const previousOrders = [...orders];
      setOrders(prev => prev.filter(o => o.id !== order.id));
      setTotalCount(prev => prev - 1);

      const res = await deleteOrderAction(order.id);

      if (res.success) {
        pageCacheRef.current.clear();
        showAdminToast(`Order #${order.shortId} deleted successfully.`, 'success');
      } else {
        setOrders(previousOrders);
        setTotalCount(previousOrders.length);
        showAdminToast(res.message || 'Failed to delete order.', 'error');
      }
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} orders? This action cannot be undone.`)) {
      setIsLoading(true);
      let successCount = 0;
      let failCount = 0;
      
      await Promise.all(selectedIds.map(async (id) => {
        const res = await deleteOrderAction(id);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
      }));
      
      pageCacheRef.current.clear();
      if (successCount > 0) {
        showAdminToast(`${successCount} order(s) deleted successfully.`, 'success');
      }
      if (failCount > 0) {
        showAdminToast(`Failed to delete ${failCount} order(s).`, 'error');
      }
      
      setSelectedIds([]);
      loadOrders(currentPage, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode, true);
    }
  };

  const handleResetPayment = async (order: OrderProps) => {
    if (confirm(`Are you sure you want to reset the payment state for Order #${order.shortId}? This will clear the uploaded proof and allow the customer to submit a new one.`)) {
      const res = await resetPaymentAdminAction(order.id);
      if (res.success) {
        pageCacheRef.current.clear();
        showAdminToast('Payment state reset successfully.', 'success');
        loadOrders(currentPage, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode, false);
      } else {
        showAdminToast(res.message || 'Failed to reset payment.', 'error');
      }
    }
  };

  const handleOrderUpdated = (updatedOrder: OrderProps) => {
    setSelectedOrderForDetails(updatedOrder);
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    pageCacheRef.current.forEach((val) => {
      const idx = val.orders.findIndex(o => o.id === updatedOrder.id);
      if (idx !== -1) {
        val.orders[idx] = updatedOrder;
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      {/* DynamicAdminNav is now in Layout */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search by ID or Name..."
        onSearch={(query) => {
          pageCacheRef.current.clear();
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        onRefresh={() => {
          pageCacheRef.current.clear();
          loadOrders(currentPage, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode, true);
        }}
        refreshLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        filterDropdown={<OrderFilters 
          status={statusFilter} 
          setStatus={(s) => {
            pageCacheRef.current.clear();
            setStatusFilter(s);
            setCurrentPage(1);
          }} 
          paymentStatus={paymentFilter}
          setPaymentStatus={(p) => {
            pageCacheRef.current.clear();
            setPaymentFilter(p);
            setCurrentPage(1);
          }}
          hideCancelled={hideCancelled} 
          setHideCancelled={(val) => {
            pageCacheRef.current.clear();
            setHideCancelled(val);
            sessionStorage.setItem('admin_orders_hide_cancelled', String(val));
            setCurrentPage(1);
          }} 
        />}
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full pb-[100px] relative">
        {isLoading ? (
          <div className="w-full max-w-full">
            {viewMode === 'list' ? <OrderTableSkeleton rows={15} /> : <OrderGridSkeleton count={12} />}
          </div>
        ) : orders.length > 0 ? (
          <AdminOrderList
            initialOrders={orders}
            lastSeenAt={lastSeenAtOnMount.current || undefined}
            viewMode={viewMode}
            selectedIds={selectedIds}
            totalCount={totalCount}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onViewDetails={handleOpenDetails}
            onUpdateStatus={handleUpdateStatusTrigger}
            onUpdatePaymentStatus={handleUpdatePaymentTrigger}
            onDeleteOrder={handleDeleteOrder}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
            <div className="w-16 h-16 bg-[#F4F4F5] rounded-2xl flex items-center justify-center text-[#71717a]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h2 className="text-[#242424] text-[18px] font-semibold">No orders found</h2>
            <p className="text-[#71717a] text-[14px] max-w-xs">We couldn't find any orders matching your criteria. Try adjusting your filters or create a demo order.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setIsLoading(true);
                  const res = await createDemoOrderAction();
                  if (res.success) {
                    showAdminToast('Demo order created successfully.', 'success');
                    loadOrders(currentPage, searchQuery, statusFilter, paymentFilter, hideCancelled, viewMode, true);
                  } else {
                    showAdminToast(res.message || 'Failed to create demo order.', 'error');
                    setIsLoading(false);
                  }
                }}
                className="bg-[#242424] text-white px-6 py-2.5 rounded-xl font-medium text-[14px] hover:bg-black transition-all active:scale-95"
              >
                Create Demo Order
              </button>
              <button
                onClick={() => {
                  pageCacheRef.current.clear();
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setHideCancelled(false);
                }}
                className="text-[#242424] font-medium text-[14px] underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderForDetails(null);
        }}
        order={selectedOrderForDetails}
        onUpdateStatus={handleUpdateStatusTrigger}
        onUpdatePaymentStatus={handleUpdatePaymentTrigger}
        onResetPayment={handleResetPayment}
        onCancelOrder={handleCancelOrder}
        onOrderUpdated={handleOrderUpdated}
      />

      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          if (!isPaymentModalOpen) setOrderToUpdate(null);
        }}
        order={orderToUpdate}
        onConfirm={handleConfirmStatusUpdate}
      />

      <UpdatePaymentStatusModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          if (!isStatusModalOpen) setOrderToUpdate(null);
        }}
        order={orderToUpdate}
        onConfirm={handleConfirmPaymentUpdate}
      />

      <LabelPrintModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        orders={orders.filter(o => selectedIds.includes(o.id))}
      />

      {/* Floating Batch Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#242424] text-white px-4 py-2.5 shadow-2xl flex items-center gap-4 z-[999] font-rubik border border-white/10 rounded-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-sm bg-white/20 flex items-center justify-center text-[11px] font-medium">
                {selectedIds.length}
              </div>
              <span className="text-[12px] font-normal">Orders selected</span>
            </div>
            
            <div className="w-px h-5 bg-white/20" />
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsLabelModalOpen(true)}
                className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-sm text-[12px] font-medium hover:bg-gray-100 transition-colors active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                Generate Labels
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-sm text-[12px] font-medium hover:bg-red-600 transition-colors active:scale-95 ml-1"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-[12px] font-normal text-white/70 hover:text-white transition-colors ml-1"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
