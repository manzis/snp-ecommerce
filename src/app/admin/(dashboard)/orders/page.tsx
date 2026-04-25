'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { useSearchParams } from 'next/navigation';
import { fetchAllOrdersAdminAction, createDemoOrderAction, deleteOrderAction } from '@/app/actions/orderActions';
import { OrderProps } from '@/components/orders/OrderCard';
import { AdminOrderList } from '@/components/admin/AdminOrderList';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import AdminSubNav from '@/components/admin/layout/AdminSubNav';
import OrderFilters from '@/components/admin/orders/OrderFilters';
import { TableSkeleton } from '@/components/admin/shared/AdminPageSkeletons';
import OrderDetailsModal from '@/components/admin/orders/OrderDetailsModal';
import StatusUpdateModal from '@/components/admin/orders/StatusUpdateModal';
import UpdatePaymentStatusModal from '@/components/admin/orders/UpdatePaymentStatusModal';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import { updateOrderStatusAdminAction, updatePaymentStatusAdminAction, resetPaymentAdminAction } from '@/app/actions/orderActions';

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [orderToUpdate, setOrderToUpdate] = useState<any | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { showAdminToast } = useAdminToast();
  const searchParams = useSearchParams();
  const deepLinkOrderId = searchParams.get('orderId');

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
        setSelectedIds([]);
    } else {
        setSelectedIds(filteredOrders.map(o => o.id));
    }
  };
  
  // Notification Logic
  const { markAsSeen, lastSeenAt, isHydrated } = useOrderNotifications();
  const lastSeenAtOnMount = useRef<string | null>(null);
  const hasEffectRun = useRef(false);

  useEffect(() => {
      // Only proceed once we're sure the store has loaded from localStorage
      if (!isHydrated || hasEffectRun.current) return;
      
      // Capture the state once when the page is FIRST opened post-hydration
      lastSeenAtOnMount.current = lastSeenAt;
      
      // Clear global badges
      markAsSeen();
      hasEffectRun.current = true;
  }, [isHydrated, lastSeenAt, markAsSeen]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllOrdersAdminAction(currentPage, PAGE_SIZE);
      if (result.success) {
        setOrders(result.orders || []);
        setTotalCount(result.totalCount || 0);
      } else {
        showAdminToast(result.message || 'Failed to fetch orders', 'error');
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  // Deep Link Logic: Auto-open modal if orderId is in URL
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

  const handleCancelOrder = async (order: any) => {
    if (confirm(`Are you sure you want to CANCEL order #${order.shortId}? This will notify the customer.`)) {
        try {
            const res = await updateOrderStatusAdminAction(order.id, 'cancelled', 'Order cancelled by administrator.');
            if (res.success) {
                showAdminToast(`Order #${order.shortId} cancelled successfully.`, 'success');
                loadOrders();
                setIsDetailsModalOpen(false);
            } else {
                showAdminToast(res.message || 'Failed to cancel order.', 'error');
            }
        } catch (error) {
            showAdminToast('An error occurred while cancelling order.', 'error');
        }
    }
  };

  const handleConfirmStatusUpdate = async (orderId: string, status: string, message: string, trackingNumber?: string, carrierName?: string) => {
     try {
        const res = await updateOrderStatusAdminAction(orderId, status, message, trackingNumber, carrierName);
        if (res.success) {
            showAdminToast(`Order status updated to ${status.toUpperCase()}.`, 'success');
            loadOrders();
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
            
            // Optimistic Update for List
            setOrders(prev => prev.map(o => 
                o.id === orderId ? { ...o, paymentStatus: paymentStatus, amountPaid: amountPaid } : o
            ));
            
            // Optimistic Update for Details Modal if open
            if (selectedOrderForDetails?.id === orderId) {
                setSelectedOrderForDetails((prev: any) => ({ ...prev, paymentStatus: paymentStatus, amountPaid: amountPaid }));
            }
            
            setIsPaymentModalOpen(false);
            setOrderToUpdate(null);
            
            // Trigger backend fetch silently behind the scenes
            loadOrders();
        } else {
            showAdminToast(res.message || 'Failed to update payment.', 'error');
        }
     } catch (err) {
        showAdminToast('An error occurred during payment update.', 'error');
     }
  };

  // Basic local filtering for now (backend support can be added if needed)
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    return orders.filter(order => {
      const search = searchQuery.toLowerCase();
      const matchesSearch = search === '' || 
        (order.shortId && order.shortId.toLowerCase().includes(search)) ||
        (order.id && order.id.toLowerCase().includes(search)) ||
        (order.customerName && order.customerName.toLowerCase().includes(search));
      
      const matchesStatus = statusFilter === 'all' || 
        (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleDeleteOrder = async (order: OrderProps) => {
    if (confirm(`Are you sure you want to delete order #${order.shortId}? This action cannot be undone.`)) {
        // Optimistic UI Update: Remove from local state immediately
        const previousOrders = [...orders];
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setTotalCount(prev => prev - 1);

        const res = await deleteOrderAction(order.id);
        
        if (res.success) {
            showAdminToast(`Order #${order.shortId} deleted successfully.`, 'success');
            // No need to reload, state is already updated
        } else {
            // Rollback on failure
            setOrders(previousOrders);
            setTotalCount(previousOrders.length);
            showAdminToast(res.message || 'Failed to delete order.', 'error');
        }
    }
  };

  const handleResetPayment = async (order: OrderProps) => {
    if (confirm(`Are you sure you want to reset the payment state for Order #${order.shortId}? This will clear the uploaded proof and allow the customer to submit a new one.`)) {
        setIsLoading(true);
        const res = await resetPaymentAdminAction(order.id);
        if (res.success) {
            showAdminToast('Payment state reset successfully.', 'success');
            loadOrders();
        } else {
            showAdminToast(res.message || 'Failed to reset payment.', 'error');
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[12px] overflow-hidden font-rubik">
      <DynamicAdminNav />
      {/* Contextual Secondary Navigation */}
      <AdminSubNav
        showViewMode
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchPlaceholder="Search by ID or Name..."
        onSearch={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
        }}
        filterDropdown={<OrderFilters status={statusFilter} setStatus={(s) => {
            setStatusFilter(s);
            setCurrentPage(1);
        }} />}
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-[100px]">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : filteredOrders.length > 0 ? (
          <AdminOrderList 
            initialOrders={filteredOrders} 
            lastSeenAt={lastSeenAtOnMount.current || undefined}
            viewMode={viewMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onViewDetails={handleOpenDetails}
            onUpdateStatus={handleUpdateStatusTrigger} 
            onUpdatePaymentStatus={handleUpdatePaymentTrigger}
            onDeleteOrder={handleDeleteOrder}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
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
                        loadOrders();
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
    </div>
  );
}