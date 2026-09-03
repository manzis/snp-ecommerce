'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { fetchAllOrdersAdminAction, createDemoOrderAction, deleteOrderAction, syncMultipleExternalOrdersTrackingAction } from '@/app/actions/orderActions';
import { OrderProps } from '@/components/orders/OrderCard';
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
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialOrdersData?.success);
  const [orders, setOrders] = useState<OrderProps[]>(initialOrdersData?.orders || []);
  const [totalCount, setTotalCount] = useState<number>(initialOrdersData?.totalCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hideCancelled, setHideCancelled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_orders_hide_cancelled') === 'true';
    }
    return false;
  });

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
    setIsMounted(true);
    setOverrideTitle(null);
    setPrimaryAction(null);
  }, []);


  useEffect(() => {
    if (!isHydrated || hasEffectRun.current) return;
    lastSeenAtOnMount.current = lastSeenAt;
    markAsSeen();
    hasEffectRun.current = true;
  }, [isHydrated, lastSeenAt, markAsSeen]);

  const loadOrders = async (
    page: number,
    search: string = searchQuery,
    status: string = statusFilter,
    hide: boolean = hideCancelled,
    mode: 'grid' | 'list' = viewMode
  ) => {
    setIsLoading(true);
    const limit = mode === 'list' ? 30 : 12;
    try {
      const result = await fetchAllOrdersAdminAction(page, limit, { search, status, hideCancelled: hide });
      if (result && result.success) {
        setOrders(result.orders || []);
        setTotalCount(result.totalCount || 0);
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
      // If we have SSR data, and we are on page 1 with default filters in grid view, skip initial fetch
      if (initialOrdersData?.success && currentPage === 1 && searchQuery === '' && statusFilter === 'all' && !hideCancelled && viewMode === 'grid') {
        setIsLoading(false);
        return;
      }
    }
    loadOrders(currentPage, searchQuery, statusFilter, hideCancelled, viewMode);
  }, [currentPage, searchQuery, statusFilter, hideCancelled, viewMode]);

  // Auto-sync external tracking for visible active orders
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
      syncMultipleExternalOrdersTrackingAction(activeIds)
        .then((res) => {
          if (res?.updatedCount && res.updatedCount > 0) {
            // Silently refresh the list without triggering isLoading=true and hiding the current list
            fetchAllOrdersAdminAction(currentPage, pageSize, { search: searchQuery, status: statusFilter, hideCancelled })
              .then((result) => {
                if (result && result.success) {
                  setOrders(result.orders || []);
                  setTotalCount(result.totalCount || 0);
                }
              });
          }
        })
        .catch(err => console.error("Auto-sync failed:", err));
    }
  }, [orders, currentPage, isLoading, searchQuery, statusFilter, hideCancelled, pageSize]);

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
    setIsDetailsModalOpen(false);
    setOrderToUpdate(order);
    setIsStatusModalOpen(true);
  };

  const handleUpdatePaymentTrigger = (order: any) => {
    setIsDetailsModalOpen(false);
    setOrderToUpdate(order);
    setIsPaymentModalOpen(true);
  };

  const handleCancelOrder = async (order: any, reason: string) => {
    try {
      const res = await updateOrderStatusAdminAction(order.id, 'cancelled', reason);
      if (res.success) {
        showAdminToast(`Order #${order.shortId} cancelled successfully.`, 'success');
        loadOrders(currentPage);
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
        showAdminToast(`Order status updated to ${status.toUpperCase()}.`, 'success');
        loadOrders(currentPage);
        setIsStatusModalOpen(false);
        setOrderToUpdate(null);
      } else {
        showAdminToast(res.message || 'Failed to update order.', 'error');
      }
    } catch (err) {
      showAdminToast('An error occurred during update.', 'error');
    }
  };

  const handleConfirmPaymentUpdate = async (orderId: string, paymentStatus: string, amountPaid?: number) => {
    try {
      const res = await updatePaymentStatusAdminAction(orderId, paymentStatus, amountPaid);
      if (res.success) {
        showAdminToast(`Payment status updated to ${paymentStatus.toUpperCase()}.`, 'success');
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, paymentStatus: paymentStatus, amountPaid: amountPaid } : o
        ));
        if (selectedOrderForDetails?.id === orderId) {
          setSelectedOrderForDetails((prev: any) => ({ ...prev, paymentStatus: paymentStatus, amountPaid: amountPaid }));
        }
        setIsPaymentModalOpen(false);
        setOrderToUpdate(null);
        loadOrders(currentPage);
      } else {
        showAdminToast(res.message || 'Failed to update payment.', 'error');
      }
    } catch (err) {
      showAdminToast('An error occurred during payment update.', 'error');
    }
  };

  // Client-side filtering is no longer needed as we use server-side filtering
  // const filteredOrders = useMemo(() => { ... }, [orders, searchQuery, statusFilter]);

  const handleDeleteOrder = async (order: OrderProps) => {
    if (confirm(`Are you sure you want to delete order #${order.shortId}? This action cannot be undone.`)) {
      const previousOrders = [...orders];
      setOrders(prev => prev.filter(o => o.id !== order.id));
      setTotalCount(prev => prev - 1);

      const res = await deleteOrderAction(order.id);

      if (res.success) {
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
      
      if (successCount > 0) {
        showAdminToast(`${successCount} order(s) deleted successfully.`, 'success');
      }
      if (failCount > 0) {
        showAdminToast(`Failed to delete ${failCount} order(s).`, 'error');
      }
      
      setSelectedIds([]);
      loadOrders(currentPage);
    }
  };

  const handleResetPayment = async (order: OrderProps) => {
    if (confirm(`Are you sure you want to reset the payment state for Order #${order.shortId}? This will clear the uploaded proof and allow the customer to submit a new one.`)) {
      setIsLoading(true);
      const res = await resetPaymentAdminAction(order.id);
      if (res.success) {
        showAdminToast('Payment state reset successfully.', 'success');
        loadOrders(currentPage);
      } else {
        showAdminToast(res.message || 'Failed to reset payment.', 'error');
        setIsLoading(false);
      }
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      {/* DynamicAdminNav is now in Layout */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search by ID or Name..."
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        onRefresh={() => loadOrders(currentPage)}
        refreshLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        filterDropdown={<OrderFilters status={statusFilter} setStatus={(s) => {
          setStatusFilter(s);
          setCurrentPage(1);
        }} hideCancelled={hideCancelled} setHideCancelled={(val) => {
          setHideCancelled(val);
          sessionStorage.setItem('admin_orders_hide_cancelled', String(val));
          setCurrentPage(1);
        }} />}
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-full pb-[100px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-full"
            >
              {viewMode === 'list' ? <OrderTableSkeleton rows={15} /> : <OrderGridSkeleton count={12} />}
            </motion.div>
          ) : orders.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
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
              <h2 className="text-[#242424] text-[18px] font-semibold">No orders found</h2>
              <p className="text-[#71717a] text-[14px] max-w-xs">We couldn't find any orders matching your criteria. Try adjusting your filters or create a demo order.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    const res = await createDemoOrderAction();
                    if (res.success) {
                      showAdminToast('Demo order created successfully.', 'success');
                      loadOrders(currentPage);
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
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-[#242424] font-medium text-[14px] underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
